export const defaultSettings = Object.freeze({
  location: null,
  units: "us",
  level: "mild",
  theme: "dark",
  searchProvider: "browser",
});

const levels = new Set(["safe", "mild", "hot", "spicy"]);
const units = new Set(["us", "metric", "scientific"]);
const themes = new Set(["light", "dark"]);
function normalizeSearchProvider(value) {
  if (value === "browser") return value;
  if (typeof value === "string" && value.startsWith("engine:") && value.length <= 167) return value;
  return defaultSettings.searchProvider;
}

export function normalizeSettings(value = {}) {
  const location = value.location && Number.isFinite(Number(value.location.latitude)) && Number.isFinite(Number(value.location.longitude))
    ? {
        label: String(value.location.label || "Chosen location").slice(0, 160),
        latitude: Number(value.location.latitude),
        longitude: Number(value.location.longitude),
        ...(typeof value.location.kind === "string" ? { kind: value.location.kind.slice(0, 32) } : {}),
      }
    : null;
  return {
    location,
    units: units.has(value.units) ? value.units : defaultSettings.units,
    level: levels.has(value.level) ? value.level : defaultSettings.level,
    theme: themes.has(value.theme) ? value.theme : defaultSettings.theme,
    searchProvider: normalizeSearchProvider(value.searchProvider),
  };
}

export async function getSettings() {
  if (!globalThis.chrome?.storage?.local) return defaultSettings;
  const stored = await chrome.storage.local.get();
  if ("apiUrl" in stored || "apiKey" in stored || "variantOffset" in stored || "weatherOffset" in stored || "weatherDock" in stored) {
    await chrome.storage.local.remove(["apiUrl", "apiKey", "variantOffset", "weatherOffset", "weatherDock"]);
  }
  return normalizeSettings(stored);
}

export async function saveSettings(patch) {
  const settings = normalizeSettings({ ...(await getSettings()), ...patch });
  await chrome.storage.local.set(settings);
  await chrome.storage.local.remove(["apiUrl", "apiKey", "variantOffset", "weatherOffset", "weatherDock"]);
  return settings;
}
