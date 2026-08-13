import { searchLocations } from "./shared/api.js";
import { getAttitudeCopyCache, saveAttitudeCopyCache, selectAttitudeVariant } from "./shared/attitude-cache.js";
import { getSettingsCopyBundle } from "./shared/copy-bundle.js";
import { resolveCurrentLocation } from "./shared/location.js";
import { attitudeDescriptionOptions, configureSettingsCopy, escapeHtml, locationDescription, savedDescription, themeDescription, unitDescription } from "./shared/model.js";
import { getSettings, saveSettings } from "./shared/settings.js";

const form = document.getElementById("settingsForm");
const query = document.getElementById("locationQuery");
const results = document.getElementById("locationResults");
const chosen = document.getElementById("chosenLocation");
const status = document.getElementById("status");
const attitudePreview = document.getElementById("attitudePreview");
const unitPreview = document.getElementById("unitPreview");
const locationPreview = document.getElementById("locationPreview");
const themePreview = document.getElementById("themePreview");
let [settings, attitudeCopyCache, remoteCopyBundle] = await Promise.all([getSettings(), getAttitudeCopyCache(), getSettingsCopyBundle()]);
configureSettingsCopy(remoteCopyBundle?.settings);
let selectedLocation = settings.location;
let copyIndex = 0;
let attitudeCacheWrite = Promise.resolve();

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = theme === "light" ? "☾" : "☀";
    button.title = theme === "light" ? "Turn the lights off" : "Turn the lights on";
    button.setAttribute("aria-label", button.title);
  });
}

function showChosen() {
  chosen.textContent = selectedLocation
    ? `${selectedLocation.label} · ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
    : "No location chosen yet.";
}

function setSelected(location) {
  selectedLocation = {
    label: location.label,
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    ...(location.kind ? { kind: location.kind } : {}),
  };
  results.innerHTML = "";
  showChosen();
  copyIndex += 1;
  renderLocationPreview();
}

function renderAttitudePreview(advance = false) {
  const level = form.elements.level.value;
  const selection = selectAttitudeVariant(attitudeCopyCache, level, attitudeDescriptionOptions(level), advance);
  attitudeCopyCache = selection.cache;
  attitudePreview.textContent = selection.phrase.text;
  const cacheSnapshot = attitudeCopyCache;
  attitudeCacheWrite = attitudeCacheWrite
    .then(() => saveAttitudeCopyCache(cacheSnapshot))
    .catch(() => {});
}

function renderUnitPreview() {
  unitPreview.textContent = unitDescription(form.elements.units.value, form.elements.level.value, copyIndex + 1);
}

function renderThemePreview() {
  themePreview.textContent = themeDescription(form.elements.theme.value, form.elements.level.value, copyIndex + 2);
}

function renderLocationPreview() {
  locationPreview.textContent = locationDescription(selectedLocation, form.elements.level.value, copyIndex + 3);
}

function renderContextPreviews() {
  renderUnitPreview();
  renderThemePreview();
  renderLocationPreview();
}

form.elements.level.value = settings.level;
form.elements.units.value = settings.units;
form.elements.theme.value = settings.theme;
applyTheme(settings.theme);
showChosen();
renderAttitudePreview();
renderContextPreviews();

document.querySelectorAll('input[name="level"]').forEach((input) => input.addEventListener("change", () => {
  copyIndex += 1;
  renderAttitudePreview(true);
  renderContextPreviews();
}));
document.querySelectorAll('input[name="units"]').forEach((input) => input.addEventListener("change", () => {
  copyIndex += 1;
  renderUnitPreview();
}));
document.querySelectorAll('input[name="theme"]').forEach((input) => input.addEventListener("change", () => {
  applyTheme(input.value);
  copyIndex += 1;
  renderThemePreview();
}));

document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", async () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  form.elements.theme.value = theme;
  settings = await saveSettings({ theme });
  applyTheme(theme);
  copyIndex += 1;
  renderThemePreview();
}));

async function findLocation() {
  const value = query.value.trim();
  if (value.length < 2) {
    status.textContent = form.elements.level.value === "safe" ? "Give me at least two characters to work with." : "Give me at least two damn characters to work with.";
    return;
  }
  status.textContent = "";
  results.innerHTML = "<span>Searching the U.S. for your particular patch of sky…</span>";
  try {
    const body = await searchLocations(value);
    results.innerHTML = body.data.length
      ? body.data.map((location, index) => `<button type="button" data-index="${index}">${escapeHtml(location.label)}</button>`).join("")
      : "<span>No U.S. locations matched. The map is giving us nothing.</span>";
    results.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => setSelected(body.data[Number(button.dataset.index)])));
  } catch (error) {
    results.innerHTML = `<span>${escapeHtml(error.message)}</span>`;
  }
}

document.getElementById("findLocation").addEventListener("click", findLocation);
query.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    findLocation();
  }
});

document.getElementById("useCurrent").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const result = await resolveCurrentLocation({ onProgress: (message) => { status.textContent = message; } });
    setSelected(result.location);
    status.textContent = `${locationDescription(selectedLocation, form.elements.level.value, copyIndex)} ${result.accuracy === "precise" ? "Save when ready." : "This is an approximate area; save it if it looks right."}`;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  settings = await saveSettings({
    location: selectedLocation,
    level: form.elements.level.value,
    units: form.elements.units.value,
    theme: form.elements.theme.value,
  });
  applyTheme(settings.theme);
  copyIndex += 1;
  status.textContent = savedDescription(settings.level, copyIndex);
});
