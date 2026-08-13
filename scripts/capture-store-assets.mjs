import { chromium } from "playwright";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const extensionPath = path.join(root, "dist", "dev-chrome");
const screenshotDir = path.join(root, "store-assets", "screenshots");
const profileDir = path.join(root, ".wip", "playwright-store-profile");

await mkdir(screenshotDir, { recursive: true });
await rm(profileDir, { recursive: true, force: true });
await Promise.all([128, 300, 512].map((size) => cp(
  path.join(extensionPath, "assets", "icons", `icon${size}.png`),
  path.join(root, "store-assets", `icon${size}.png`),
)));

const context = await chromium.launchPersistentContext(profileDir, {
  headless: process.env.CRUDDY_HEADLESS !== "0",
  channel: "chromium",
  viewport: { width: 1280, height: 800 },
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    "--no-first-run",
    "--disable-default-apps",
  ],
});

const errors = [];
context.on("page", watchPage);
context.pages().forEach(watchPage);

try {
  const newtab = context.pages()[0] || await context.newPage();
  await newtab.goto("chrome://newtab");
  await newtab.waitForURL(/^chrome-extension:\/\//, { timeout: 15_000 });
  const extensionOrigin = `chrome-extension://${new URL(newtab.url()).host}`;

  await newtab.evaluate(async () => {
    await chrome.storage.local.set({
      location: { label: "Austin, TX", latitude: 30.2672, longitude: -97.7431, kind: "city" },
      units: "us",
      level: "mild",
      theme: "dark",
    });
  });
  await newtab.reload({ waitUntil: "domcontentloaded" });
  await newtab.locator(".weather-dashboard").waitFor({ timeout: 20_000 });
  await installFrequentSiteFixtures(newtab);

  await newtab.evaluate(() => window.scrollTo(0, 0));
  await newtab.screenshot({ path: path.join(screenshotDir, "newtab-search-and-sites-dark.png") });

  await newtab.locator(".weather-dashboard").scrollIntoViewIfNeeded();
  await newtab.waitForTimeout(250);
  await newtab.screenshot({ path: path.join(screenshotDir, "newtab-forecast-dark.png") });

  await newtab.locator("[data-theme-toggle]").click();
  await newtab.locator("html[data-theme=light]").waitFor();
  await newtab.screenshot({ path: path.join(screenshotDir, "newtab-forecast-light.png") });

  const options = await context.newPage();
  await options.goto(`${extensionOrigin}/options.html`, { waitUntil: "domcontentloaded" });
  await options.locator("#attitudePreview").waitFor();
  await options.locator("#levels").scrollIntoViewIfNeeded();
  await options.waitForTimeout(250);
  await options.screenshot({ path: path.join(screenshotDir, "settings-attitudes.png") });

  const popup = await context.newPage();
  await popup.setViewportSize({ width: 430, height: 600 });
  await popup.goto(`${extensionOrigin}/popup.html`, { waitUntil: "domcontentloaded" });
  await popup.locator(".popup-shell").waitFor({ timeout: 20_000 });
  const rawPopup = path.join(root, ".wip", "popup-raw.png");
  await popup.screenshot({ path: rawPopup });

  const popupBytes = await readFile(rawPopup);
  const popupShowcase = await context.newPage();
  await popupShowcase.setViewportSize({ width: 1280, height: 800 });
  await popupShowcase.setContent(popupShowcaseHtml(popupBytes.toString("base64")));
  await popupShowcase.screenshot({ path: path.join(screenshotDir, "toolbar-popup.png") });

  const promo = await context.newPage();
  await promo.setViewportSize({ width: 1400, height: 2200 });
  await promo.goto(`file://${path.join(root, "store-assets", "fixtures", "promo.html")}`);
  await promo.locator(".promo.small").screenshot({ path: path.join(root, "store-assets", "promo-small-440x280.png") });
  await promo.locator(".promo.marquee").screenshot({ path: path.join(root, "store-assets", "promo-marquee-1400x560.png") });
  await promo.locator(".promo.opera").screenshot({ path: path.join(root, "store-assets", "promo-opera-300x188.png") });

  if (errors.length) throw new Error(`Browser errors during store capture:\n${errors.join("\n")}`);
  console.log(`Captured five 1280 x 800 store screenshots, three promo graphics, and store icons in ${path.join(root, "store-assets")}.`);
} finally {
  await context.close();
}

function watchPage(page) {
  page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${page.url()}: ${message.text()}`);
  });
}

async function installFrequentSiteFixtures(page) {
  const sites = [
    ["W", "Wiplash", "wiplash.ai", "#ff2a98"], ["G", "GitHub", "github.com", "#ffffff"],
    ["C", "Codex", "chatgpt.com", "#20c997"], ["Y", "YouTube", "youtube.com", "#ff3040"],
    ["R", "Reddit", "reddit.com", "#ff5700"], ["L", "LinkedIn", "linkedin.com", "#0a66c2"],
    ["M", "Mail", "mail.google.com", "#ea4335"], ["D", "Docs", "docs.google.com", "#4285f4"],
  ];
  await page.locator("#frequentSites").evaluate((container, values) => {
    container.replaceChildren(...values.map(([initial, name, domain, color]) => {
      const link = document.createElement("a");
      link.href = `https://${domain}/`;
      link.title = name;
      const icon = document.createElement("span"); icon.className = "site-icon";
      const image = document.createElement("img");
      image.alt = "";
      image.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="17" fill="${color}"/><text x="32" y="43" text-anchor="middle" font-family="Arial Black,Arial" font-size="32" font-weight="900" fill="${color === "#ffffff" ? "#111111" : "#ffffff"}">${initial}</text></svg>`)}`;
      const fallback = document.createElement("span"); fallback.className = "site-initial"; fallback.textContent = initial;
      icon.append(image, fallback);
      const strong = document.createElement("strong"); strong.textContent = name;
      const small = document.createElement("small"); small.textContent = domain;
      link.append(icon, strong, small);
      return link;
    }));
  }, sites);
}

function popupShowcaseHtml(base64) {
  return `<!doctype html><html><head><style>
    *{box-sizing:border-box}html,body{margin:0;width:1280px;height:800px;overflow:hidden;font-family:Inter,Arial,sans-serif;background:#050505;color:#fff}
    body{display:grid;grid-template-columns:1fr 430px;align-items:center;gap:78px;padding:70px 110px;background-image:radial-gradient(circle at 1px 1px,rgba(255,42,152,.22) 1px,transparent 0),radial-gradient(circle at 85% 40%,rgba(255,42,152,.2),transparent 32%);background-size:27px 27px,auto}
    .eyebrow{color:#ff2a98;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.copy h1{margin:24px 0 28px;font:900 86px/.84 "Arial Black",Impact,sans-serif;letter-spacing:-.075em}.copy h1 em{color:#ff2a98;font-style:normal}.copy p{max-width:510px;margin:0;color:#c7b6bf;font-size:20px;font-weight:650;line-height:1.5}
    .frame{padding:13px;border:2px solid #ff2a98;border-radius:28px;background:#160b11;box-shadow:21px 24px 0 rgba(255,42,152,.18),0 34px 80px rgba(0,0,0,.5);transform:rotate(1.8deg)}.frame img{display:block;width:430px;height:600px;border-radius:17px}
  </style></head><body><section class="copy"><div class="eyebrow">One click. The whole damn week.</div><h1>A forecast<br>with some <em>nerve.</em></h1><p>Current conditions, active alerts, and seven days of sky nonsense in one compact toolbar widget.</p></section><div class="frame"><img src="data:image/png;base64,${base64}" alt="Cruddy Weather toolbar popup"></div></body></html>`;
}
