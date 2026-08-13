import { fetchWeather } from "./shared/api.js";
import { getSettingsCopyBundle } from "./shared/copy-bundle.js";
import { resolveCurrentLocation } from "./shared/location.js";
import { alertHeadline, configureSettingsCopy, daylightPeriods, escapeHtml, locationDescription, sourceAgeLabel, temperatureLabel, weatherGlyph } from "./shared/model.js";
import { getSettings, saveSettings } from "./shared/settings.js";

const body = document.body;
const surface = body.dataset.surface;
const root = document.getElementById("weatherRoot");
const searchPicker = document.getElementById("searchProvider");
const searchPickerTrigger = document.getElementById("searchProviderTrigger");
const searchPickerValue = document.getElementById("searchProviderValue");
const searchPickerMenu = document.getElementById("searchProviderMenu");
const searchProviderNote = document.getElementById("searchProviderNote");
let settings;

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = theme === "light" ? "☾" : "☀";
    button.title = theme === "light" ? "Turn the lights off" : "Turn the lights on";
    button.setAttribute("aria-label", button.title);
  });
}

function mascotMarkup(className = "mascot") {
  return `<img class="${className}" src="assets/cruddy-mark.svg" alt="">`;
}

function popupHeader() {
  return `<header class="popup-header">
    <div class="popup-brand">${mascotMarkup("popup-mascot")}<strong>Cruddy Weather</strong></div>
    <div class="popup-tools">
      <button type="button" data-theme-toggle aria-label="Switch color theme">◐</button>
      <button type="button" data-open-settings aria-label="Open settings">⚙</button>
    </div>
  </header>`;
}

function footerMarkup() {
  const producerUrl = ["https:", "", "wiplash.ai", ""].join("/");
  return `<footer class="product-footer"><span>Cruddy Weather</span><a href="${producerUrl}" target="_blank" rel="noreferrer">Produced by Wiplash.ai</a></footer>`;
}

function loadingMarkup() {
  const content = `<section class="loading-state" aria-live="polite">${mascotMarkup("loading-mascot")}<p>Asking the atmosphere<br>what its problem is…</p></section>`;
  return surface === "popup" ? `<div class="popup-shell">${popupHeader()}${content}${footerMarkup()}</div>` : content;
}

function setupMarkup(message) {
  const content = `<section class="setup-state">
    ${mascotMarkup("setup-mascot")}
    <div class="eyebrow">FORECAST NEEDS A LOCATION</div>
    <h1>${escapeHtml(message)}</h1>
    <p>Use your browser location, or search for a U.S. city in Settings.</p>
    <div class="setup-actions"><button class="primary-button" data-use-current>Use my current location <span>◎</span></button><button class="secondary-button" data-open-settings>Open settings <span>↗</span></button></div>
    <output class="location-status" data-location-status aria-live="polite"></output>
  </section>`;
  return surface === "popup" ? `<div class="popup-shell">${popupHeader()}${content}${footerMarkup()}</div>` : content;
}

function alertsMarkup(alerts) {
  if (!alerts?.length) return "";
  const alert = alerts[0];
  const headline = alertHeadline(alert);
  const remainder = alerts.length > 1 ? `<small>+${alerts.length - 1} more active</small>` : "";
  return `<section class="alert-card" aria-label="Active weather alert">
    <span>${escapeHtml(alert.severity)} alert</span>
    <strong>${escapeHtml(alert.event)}</strong>
    <p>${escapeHtml(headline)}</p>${remainder}
  </section>`;
}

function forecastMarkup(periods, limit = 7) {
  const selected = daylightPeriods(periods).slice(0, limit);
  return `<section class="forecast-strip" aria-label="Week forecast">${selected.map((period) => `
    <article title="${escapeHtml(period.shortForecast)}">
      <span>${escapeHtml(period.name.slice(0, 3))}</span>
      <b aria-hidden="true">${weatherGlyph(period.shortForecast)}</b>
      <strong>${escapeHtml(temperatureLabel(period))}</strong>
      <small>${escapeHtml(period.shortForecast)}</small>
    </article>`).join("")}</section>`;
}

function popupForecastMarkup(periods) {
  return `<section class="popup-forecast" aria-labelledby="popupForecastHeading">
    <div class="popup-forecast-heading"><strong id="popupForecastHeading">The week</strong><span>Seven days of sky nonsense</span></div>
    ${forecastMarkup(periods, 7)}
  </section>`;
}

function weatherDetails(current) {
  const rain = current.precipitationProbability == null ? "—" : `${current.precipitationProbability}%`;
  const humidity = typeof current.relativeHumidity === "number" && Number.isFinite(current.relativeHumidity)
    ? `${Math.round(current.relativeHumidity)}%`
    : "—";
  const feelsLike = typeof current.feelsLikeTemperature === "number" && Number.isFinite(current.feelsLikeTemperature) && current.feelsLikeTemperatureUnit
    ? temperatureLabel({ temperature: current.feelsLikeTemperature, temperatureUnit: current.feelsLikeTemperatureUnit })
    : "—";
  return `<dl class="weather-details">
    <div><dt>Wind</dt><dd>${escapeHtml(current.windSpeed)} ${escapeHtml(current.windDirection)}</dd></div>
    <div><dt>Rain</dt><dd>${escapeHtml(rain)}</dd></div>
    <div><dt>Humidity</dt><dd>${escapeHtml(humidity)}</dd></div>
    <div><dt>Feels like</dt><dd>${escapeHtml(feelsLike)}</dd></div>
  </dl>`;
}

function popupWeatherMarkup(weather) {
  const commentaryClass = weather.commentary.text.length > 190
    ? "extra-long-copy"
    : weather.commentary.text.length > 145 ? "long-copy" : "";
  return `<div class="popup-shell situation-${escapeHtml(weather.commentary.situation)} ${weather.alerts?.length ? "has-alert" : ""}">
    ${popupHeader()}
    ${alertsMarkup(weather.alerts)}
    <main class="popup-main">
      <div class="place-row"><strong>${escapeHtml(weather.location.label)}</strong><span>${escapeHtml(sourceAgeLabel(weather.source, weather.cache))}</span></div>
      <section class="current-row">
        <div class="temperature">${escapeHtml(temperatureLabel(weather.current))}</div>
        <div class="condition"><span aria-hidden="true">${weatherGlyph(weather.current.shortForecast)}</span><strong>${escapeHtml(weather.current.shortForecast)}</strong></div>
      </section>
      <blockquote class="${commentaryClass}">${escapeHtml(weather.commentary.text)}</blockquote>
      ${weatherDetails(weather.current)}
      ${popupForecastMarkup(weather.daily)}
    </main>
    ${footerMarkup()}
  </div>`;
}

function newtabWeatherMarkup(weather) {
  const commentaryClass = weather.commentary.text.length > 190
    ? "extra-long-copy"
    : weather.commentary.text.length > 145 ? "long-copy" : "";
  const dashboard = `<section class="weather-dashboard situation-${escapeHtml(weather.commentary.situation)}">
    <div class="section-heading weather-heading">
      <div class="weather-title"><h2>The week ahead</h2><span>${escapeHtml(weather.location.label)} · ${escapeHtml(sourceAgeLabel(weather.source, weather.cache))}</span></div>
    </div>
    <div class="weather-alert-slot">${alertsMarkup(weather.alerts)}</div>
    <div class="weather-overview">
      <section class="big-current">
        <div class="temperature">${escapeHtml(temperatureLabel(weather.current))}</div>
        <div class="condition"><span aria-hidden="true">${weatherGlyph(weather.current.shortForecast)}</span><strong>${escapeHtml(weather.current.shortForecast)}</strong></div>
        ${weatherDetails(weather.current)}
      </section>
      <blockquote class="${commentaryClass}">${escapeHtml(weather.commentary.text)}</blockquote>
      ${mascotMarkup("dashboard-mascot")}
    </div>
  </section>`;
  return `<div class="newtab-weather-layout">${dashboard}${forecastMarkup(weather.daily)}</div>`;
}

async function useCurrentLocation(button) {
  const status = document.querySelector("[data-location-status]");
  button.disabled = true;
  try {
    const result = await resolveCurrentLocation({ onProgress: (message) => { if (status) status.textContent = message; } });
    settings = await saveSettings({ location: result.location });
    await load();
  } catch (error) {
    if (status) status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

function setSearchPickerOpen(open, { focusSelection = false } = {}) {
  if (!searchPickerTrigger || !searchPickerMenu) return;
  searchPickerTrigger.setAttribute("aria-expanded", String(open));
  searchPickerMenu.hidden = !open;
  if (open && focusSelection) {
    const selected = searchPickerMenu.querySelector('[role="option"][aria-selected="true"]');
    (selected || searchPickerMenu.querySelector('[role="option"]'))?.focus();
  }
}

function syncCustomSearchPicker() {
  if (!searchPicker || !searchPickerValue || !searchPickerMenu) return;
  const options = [...searchPicker.options];
  const selected = searchPicker.selectedOptions[0] || options[0];
  searchPickerValue.textContent = selected?.textContent?.replace(/ · browser default$/i, "") || "Browser default";
  searchPickerMenu.replaceChildren(...options.map((option) => {
    const button = document.createElement("button");
    const isManage = option.value === "manage";
    button.type = "button";
    button.className = "search-picker-option";
    button.dataset.searchProviderValue = option.value;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(option.value === searchPicker.value));
    button.innerHTML = `<span class="search-option-icon" aria-hidden="true">${isManage ? "⚙" : "⌕"}</span><span>${escapeHtml(option.textContent || "Search engine")}</span><b aria-hidden="true">${option.value === searchPicker.value ? "✓" : ""}</b>`;
    return button;
  }));
}

function bindCustomSearchPicker() {
  if (!searchPicker || !searchPickerTrigger || !searchPickerMenu || searchPickerTrigger.dataset.bound) return;
  searchPickerTrigger.dataset.bound = "true";
  searchPickerTrigger.addEventListener("click", () => {
    setSearchPickerOpen(searchPickerTrigger.getAttribute("aria-expanded") !== "true", { focusSelection: true });
  });
  searchPickerTrigger.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    setSearchPickerOpen(true, { focusSelection: true });
  });
  searchPickerMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-search-provider-value]");
    if (!option) return;
    searchPicker.value = option.dataset.searchProviderValue;
    setSearchPickerOpen(false);
    searchPicker.dispatchEvent(new Event("change", { bubbles: true }));
    searchPickerTrigger.focus();
  });
  searchPickerMenu.addEventListener("keydown", (event) => {
    const options = [...searchPickerMenu.querySelectorAll('[role="option"]')];
    const index = options.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0
        : event.key === "End" ? options.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[next]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSearchPickerOpen(false);
      searchPickerTrigger.focus();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("[data-search-picker]")) setSearchPickerOpen(false);
  });
}

async function configureSearchPicker() {
  if (!searchPicker || searchPicker.dataset.bound) return;
  searchPicker.dataset.bound = "true";
  const mode = globalThis.CruddyWeatherConfig?.searchPickerMode || "browser-default";
  if (mode === "installed" && globalThis.browser?.search?.get) {
    try {
      const engines = await browser.search.get();
      const defaultEngine = engines.find((engine) => engine.isDefault) || engines[0];
      searchPicker.replaceChildren(...engines.map((engine) => {
        const option = document.createElement("option");
        option.value = `engine:${engine.name}`;
        option.textContent = `${engine.name}${engine.isDefault ? " · browser default" : ""}`;
        return option;
      }));
      const preferred = settings.searchProvider !== "browser" && engines.some((engine) => `engine:${engine.name}` === settings.searchProvider)
        ? settings.searchProvider
        : `engine:${defaultEngine.name}`;
      searchPicker.value = preferred;
      searchProviderNote.textContent = "Firefox lets Cruddy Weather use any search engine already installed in your browser.";
    } catch {
      searchProviderNote.textContent = "Uses the search engine already selected in your browser.";
    }
  } else if (mode === "fixed-google") {
    searchPicker.options[0].textContent = "Google";
    searchProviderNote.textContent = "Opera sends searches to Google from this page.";
  } else {
    searchPicker.options[0].textContent = "Browser default";
    const manageOption = document.createElement("option");
    manageOption.value = "manage";
    manageOption.textContent = "Change browser default…";
    searchPicker.append(manageOption);
    searchProviderNote.textContent = "Chrome keeps this tied to the search engine selected in your browser.";
  }
  searchPicker.addEventListener("change", async () => {
    if (searchPicker.value === "manage") {
      searchPicker.value = "browser";
      syncCustomSearchPicker();
      searchProviderNote.textContent = "Opening your browser's search-engine settings…";
      try {
        await chrome.tabs.create({ url: "chrome://settings/searchEngines" });
      } catch {
        searchProviderNote.textContent = "Open browser Settings → Search engine to change the default used here.";
      }
      return;
    }
    settings = await saveSettings({ searchProvider: searchPicker.value });
    syncCustomSearchPicker();
  });
  syncCustomSearchPicker();
  bindCustomSearchPicker();
}

async function performSearch(query) {
  const provider = searchPicker?.value || settings?.searchProvider || "browser";
  if (provider.startsWith("engine:") && globalThis.browser?.search?.search) {
    await browser.search.search({ query, engine: provider.slice(7), disposition: "CURRENT_TAB" });
    return;
  }
  if (globalThis.CruddyWeatherConfig?.searchMode !== "direct" && chrome.search?.query) {
    await chrome.search.query({ text: query, disposition: "CURRENT_TAB" });
    return;
  }
  const providerUrl = new URL(["https:", "", "www.google.com", "search"].join("/"));
  providerUrl.searchParams.set("q", query);
  window.location.assign(providerUrl.href);
}

function bindActions() {
  document.querySelectorAll("[data-open-settings]").forEach((button) => button.addEventListener("click", () => chrome.runtime.openOptionsPage()));
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", async () => {
    settings = await saveSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
    applyTheme(settings.theme);
  }));
  document.querySelectorAll("[data-use-current]").forEach((button) => button.addEventListener("click", () => useCurrentLocation(button)));
}

async function load() {
  root.innerHTML = loadingMarkup();
  const [storedSettings, remoteCopyBundle] = await Promise.all([getSettings(), getSettingsCopyBundle()]);
  settings = storedSettings;
  configureSettingsCopy(remoteCopyBundle?.settings);
  applyTheme(settings.theme);
  await configureSearchPicker();
  if (!settings.location) {
    root.innerHTML = setupMarkup(locationDescription(null, settings.level, 0));
    bindActions();
    return;
  }
  try {
    const weather = await fetchWeather(settings);
    root.innerHTML = surface === "popup" ? popupWeatherMarkup(weather) : newtabWeatherMarkup(weather);
  } catch (error) {
    root.innerHTML = setupMarkup(error.message);
  }
  bindActions();
}

async function loadFrequentSites() {
  const container = document.getElementById("frequentSites");
  if (!container) return;
  try {
    const sites = globalThis.CruddyWeatherConfig?.faviconMode === "top-sites" && globalThis.browser?.topSites
      ? await browser.topSites.get({ includeFavicon: true })
      : await chrome.topSites.get();
    const seen = new Set();
    const selected = sites.filter((site) => {
      try {
        const url = new URL(site.url);
        if (!/^https?:$/.test(url.protocol) || seen.has(url.hostname)) return false;
        seen.add(url.hostname);
        return true;
      } catch { return false; }
    }).slice(0, 8);
    container.innerHTML = selected.length ? selected.map((site) => {
      const url = new URL(site.url);
      const domain = url.hostname.replace(/^www\./, "");
      const name = (site.title || domain).trim();
      const initial = (name.match(/[a-z0-9]/i)?.[0] || "↗").toUpperCase();
      let favicon = typeof site.favicon === "string" && site.favicon.startsWith("data:image/") ? site.favicon : "";
      if (!favicon && globalThis.CruddyWeatherConfig?.faviconMode === "extension") {
        const faviconUrl = new URL("_favicon/", chrome.runtime.getURL("/"));
        faviconUrl.searchParams.set("pageUrl", site.url);
        faviconUrl.searchParams.set("size", "64");
        favicon = faviconUrl.href;
      }
      const image = favicon ? `<img src="${escapeHtml(favicon)}" alt="" loading="eager">` : "";
      return `<a href="${escapeHtml(site.url)}" title="${escapeHtml(name)}"><span class="site-icon" aria-hidden="true">${image}<span class="site-initial">${escapeHtml(initial)}</span></span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(domain)}</small></a>`;
    }).join("") : `<span class="sites-loading">Your frequent sites will show up here once Chrome has a few.</span>`;
    container.querySelectorAll(".site-icon img").forEach((image) => image.addEventListener("error", () => image.remove(), { once: true }));
  } catch {
    container.innerHTML = `<span class="sites-loading">Chrome would not hand over your frequent sites.</span>`;
  }
}

if (surface === "newtab") {
  const form = document.getElementById("webSearch");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = new FormData(form).get("q")?.toString().trim();
    if (!query) return;
    performSearch(query).catch(() => {});
  });
  loadFrequentSites();
}

load();
