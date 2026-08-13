import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const target = process.env.CRUDDY_EXTENSION_TARGET || "dev-chrome";
const extensionPath = path.join(root, "dist", target);
const profilePath = path.join(root, ".wip", `playwright-newtab-smoke-${target}`);
await rm(profilePath, { recursive: true, force: true });

const errors = [];
const context = await chromium.launchPersistentContext(profilePath, {
  headless: true,
  channel: "chromium",
  viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`, "--no-first-run", "--disable-default-apps"],
});

try {
  const page = context.pages()[0] || await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("chrome://newtab");
  await page.waitForURL(/^chrome-extension:\/\//, { timeout: 15_000 });
  await page.locator(".setup-state").waitFor({ timeout: 15_000 });
  const setupSize = await weatherRootSize(page);
  await page.evaluate(async () => chrome.storage.local.set({
    location: { label: "Austin, TX", latitude: 30.2672, longitude: -97.7431, kind: "city" },
    units: "us",
    level: "mild",
    theme: "dark",
    weatherDock: "right",
  }));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".weather-dashboard").waitFor({ timeout: 20_000 });
  const weatherSize = await weatherRootSize(page);
  assert.ok(Math.abs(setupSize.width - weatherSize.width) <= 1 && Math.abs(setupSize.height - weatherSize.height) <= 1,
    `loading/setup and loaded weather should keep the same footprint: ${JSON.stringify({ setupSize, weatherSize })}`);

  await assertCanvas(page, "1280x800");
  assert.deepEqual(await page.locator(".weather-details dt").allTextContents(), ["Wind", "Rain", "Humidity", "Feels like"]);
  assert.equal(await page.locator("[data-weather-drag]").count(), 0, "fixed weather should not render a drag handle");
  assert.ok(!("weatherDock" in await page.evaluate(async () => chrome.storage.local.get())), "legacy weather dock state should be removed");
  assert.equal(await page.locator("#searchProvider").evaluate((element) => element.closest("form")?.id), "webSearch");
  assert.equal(await page.locator("#searchProvider").inputValue(), "browser");
  assert.match(await page.locator("#searchProvider option:checked").textContent(), /Browser default/);
  assert.equal(await page.locator("#searchProvider option").count(), 2);
  await page.locator("#searchProviderTrigger").click();
  await page.locator("#searchProviderMenu:not([hidden])").waitFor();
  assert.equal(await page.locator("#searchProviderMenu [role=option]").count(), 2);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#searchProviderMenu").getAttribute("hidden"), "");
  await page.locator("#searchProviderTrigger").focus();
  await page.keyboard.press("ArrowDown");
  await page.locator("#searchProviderMenu:not([hidden])").waitFor();
  const settingsPagePromise = context.waitForEvent("page");
  await page.locator('[data-search-provider-value="manage"]').click();
  const settingsPage = await settingsPagePromise;
  await settingsPage.waitForURL(/^chrome:\/\/settings\/searchEngines/, { timeout: 5_000 });
  await settingsPage.close();
  assert.equal(await page.locator("#searchProvider").inputValue(), "browser");

  await page.setViewportSize({ width: 1024, height: 700 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".weather-dashboard").waitFor({ timeout: 20_000 });
  await assertCanvas(page, "1024x700");
  await assertTodayVisible(page, "1024x700");
  await page.locator(".weather-alert-slot").evaluate((slot) => { slot.innerHTML = '<section class="alert-card"><span>Severe alert</span><strong>Weather being rude</strong><p>Representative active alert layout.</p></section>'; });
  await assertCanvas(page, "1024x700 with alert");
  await assertTodayVisible(page, "1024x700 with alert");
  const compactWeatherHeight = (await weatherRootSize(page)).height;
  await page.locator(".weather-overview blockquote").evaluate((commentary) => {
    commentary.classList.add("extra-long-copy");
    commentary.textContent = "Listen the fuck up: this intentionally oversized Spicy forecast is a gloriously excessive weather rant built to prove that every ridiculous word remains visible. The atmosphere has reviewed your plans, rejected your optimistic little outfit, scheduled a hostile wind, invited several deeply annoying clouds, and prepared enough premium-grade bullshit to fill the whole damn morning. Pack what you need, leave the optimism at home, and do not expect this unlicensed sky to respect your schedule, your hair, or your last clean pair of shoes.";
  });
  await assertCanvas(page, "1024x700 oversized commentary", { allowPageScroll: true });
  await assertTodayVisible(page, "1024x700 oversized commentary");
  const expandedWeatherHeight = (await weatherRootSize(page)).height;
  assert.ok(expandedWeatherHeight > compactWeatherHeight,
    `oversized commentary should grow the weather card: ${JSON.stringify({ compactWeatherHeight, expandedWeatherHeight })}`);
  assert.deepEqual(errors, []);
  console.log("Verified fixed weather placement, content-driven commentary growth, stable loading size, and no clipping.");
} finally {
  await context.close();
}

async function weatherRootSize(page) {
  return page.locator("#weatherRoot").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
}

async function assertCanvas(page, label, { allowPageScroll = false } = {}) {
  const metrics = await page.evaluate(() => {
    const weather = (document.querySelector(".newtab-weather-layout") || document.querySelector(".weather-dashboard")).getBoundingClientRect();
    const search = document.querySelector(".search-zone").getBoundingClientRect();
    const frequent = document.querySelector(".frequent-section").getBoundingClientRect();
    return {
      clientHeight: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight,
      weatherTop: weather.top,
      weatherLeft: weather.left,
      weatherBottom: weather.bottom,
      weatherRight: weather.right,
      searchTop: search.top,
      searchBottom: search.bottom,
      searchLeft: search.left,
      searchRight: search.right,
      frequentTop: frequent.top,
      frequentBottom: frequent.bottom,
      forecastClientHeight: document.querySelector(".forecast-strip").clientHeight,
      forecastScrollHeight: document.querySelector(".forecast-strip").scrollHeight,
      forecastDays: document.querySelectorAll(".forecast-strip article").length,
      visibleForecastDescriptions: [...document.querySelectorAll(".forecast-strip small")].filter((element) => getComputedStyle(element).display !== "none" && element.getBoundingClientRect().height > 0).length,
      detailLabelFontSize: Number.parseFloat(getComputedStyle(document.querySelector(".weather-details dt")).fontSize),
      detailValueFontSize: Number.parseFloat(getComputedStyle(document.querySelector(".weather-details dd")).fontSize),
      forecastTemperatureFontSize: Number.parseFloat(getComputedStyle(document.querySelector(".forecast-strip strong")).fontSize),
    };
  });
  if (!allowPageScroll) assert.ok(metrics.scrollHeight <= metrics.clientHeight, `${label} should not scroll: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.forecastScrollHeight <= metrics.forecastClientHeight, `${label} should not clip forecast cells: ${JSON.stringify(metrics)}`);
  assert.equal(metrics.forecastDays, 7, `${label} should render seven forecast days`);
  assert.equal(metrics.visibleForecastDescriptions, 7, `${label} should keep all seven forecast descriptions visible`);
  assert.ok(metrics.detailLabelFontSize >= 8, `${label} should keep detail labels readable: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.detailValueFontSize >= 12, `${label} should keep detail values readable: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.forecastTemperatureFontSize >= 18, `${label} should keep weekly temperatures readable: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.frequentBottom <= metrics.clientHeight, `${label} should keep frequent sites on-screen: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.weatherBottom < metrics.searchTop, `${label} should keep weather above search: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.searchTop - metrics.weatherBottom <= 32, `${label} should keep the raised search close to weather: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.searchBottom < metrics.frequentTop, `${label} should keep search above frequent sites: ${JSON.stringify(metrics)}`);
}

async function assertTodayVisible(page, label) {
  const metrics = await page.evaluate(() => {
    const dashboard = document.querySelector(".weather-dashboard").getBoundingClientRect();
    const overview = document.querySelector(".weather-overview").getBoundingClientRect();
    const forecast = document.querySelector(".forecast-strip").getBoundingClientRect();
    const current = document.querySelector(".big-current").getBoundingClientRect();
    const commentary = document.querySelector(".weather-overview blockquote").getBoundingClientRect();
    const details = document.querySelector(".big-current .weather-details").getBoundingClientRect();
    return {
      dashboardTop: dashboard.top,
      dashboardBottom: dashboard.bottom,
      overviewTop: overview.top,
      overviewBottom: overview.bottom,
      forecastTop: forecast.top,
      currentTop: current.top,
      currentBottom: current.bottom,
      commentaryTop: commentary.top,
      commentaryBottom: commentary.bottom,
      commentaryClientHeight: document.querySelector(".weather-overview blockquote").clientHeight,
      commentaryScrollHeight: document.querySelector(".weather-overview blockquote").scrollHeight,
      overviewClientHeight: document.querySelector(".weather-overview").clientHeight,
      overviewScrollHeight: document.querySelector(".weather-overview").scrollHeight,
      detailsBottom: details.bottom,
    };
  });
  assert.ok(metrics.currentTop >= metrics.dashboardTop && metrics.currentBottom <= metrics.forecastTop,
    `${label} should keep today's conditions above the week: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.commentaryTop >= metrics.dashboardTop && metrics.commentaryBottom <= metrics.forecastTop,
    `${label} should keep today's commentary above the week: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.commentaryScrollHeight <= metrics.commentaryClientHeight,
    `${label} should show today's commentary without clipping it: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.overviewScrollHeight <= metrics.overviewClientHeight,
    `${label} should grow today's row around its content: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.commentaryBottom <= metrics.dashboardBottom && metrics.overviewBottom <= metrics.dashboardBottom,
    `${label} should grow the dashboard around today's content: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.detailsBottom <= metrics.forecastTop,
    `${label} should keep today's wind and rain visible: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.overviewBottom <= metrics.forecastTop,
    `${label} should keep today's grid row structurally separate from the week: ${JSON.stringify(metrics)}`);
}
