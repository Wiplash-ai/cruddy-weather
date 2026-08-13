import { fetchSettingsCopy } from "./api.js";

export const settingsCopyBundleCacheKey = "cruddySettingsCopyBundleV1";
export const settingsCopyRevalidateMs = 7 * 24 * 60 * 60 * 1_000;

const levels = ["safe", "mild", "hot", "spicy"];
const units = ["us", "metric", "scientific"];
const themes = ["dark", "light"];
const flavors = ["city", "town", "rural", "generic"];

function lineArray(value) {
  if (!Array.isArray(value) || value.length < 5) return null;
  const normalized = value.map((line) => ({ id: String(line?.id || ""), text: String(line?.text || "").trim() }));
  return normalized.every((line) => line.id && line.text.length >= 12 && line.text.length <= 180) ? normalized : null;
}

function keyed(value, keys, child) {
  if (!value || typeof value !== "object") return null;
  const entries = keys.map((key) => [key, child(value[key])]);
  return entries.every(([, item]) => item) ? Object.fromEntries(entries) : null;
}

export function normalizeSettingsCopyBundle(value) {
  if (!value || value.schemaVersion !== 1 || typeof value.version !== "string" || !value.settings) return null;
  const settings = value.settings;
  const normalized = {
    attitudes: keyed(settings.attitudes, levels, lineArray),
    units: keyed(settings.units, levels, (branch) => keyed(branch, units, lineArray)),
    themes: keyed(settings.themes, levels, (branch) => keyed(branch, themes, lineArray)),
    locations: keyed(settings.locations, flavors, (branch) => keyed(branch, levels, lineArray)),
    saved: keyed(settings.saved, levels, lineArray),
    missingLocations: keyed(settings.missingLocations, levels, lineArray),
  };
  if (Object.values(normalized).some((branch) => !branch)) return null;
  return {
    schemaVersion: 1,
    version: value.version,
    generatedAt: String(value.generatedAt || ""),
    activatedAt: String(value.activatedAt || ""),
    settings: normalized,
  };
}

function normalizeCache(value) {
  const bundle = normalizeSettingsCopyBundle(value?.bundle);
  return {
    bundle,
    etag: typeof value?.etag === "string" ? value.etag : null,
    checkedAt: Number.isFinite(value?.checkedAt) ? value.checkedAt : 0,
    nextCheckAt: Number.isFinite(value?.nextCheckAt) ? value.nextCheckAt : 0,
  };
}

async function readCache() {
  if (!globalThis.chrome?.storage?.local) return normalizeCache();
  const stored = await chrome.storage.local.get(settingsCopyBundleCacheKey);
  return normalizeCache(stored[settingsCopyBundleCacheKey]);
}

async function saveCache(cache) {
  if (globalThis.chrome?.storage?.local) await chrome.storage.local.set({ [settingsCopyBundleCacheKey]: cache });
  return cache;
}

export async function getSettingsCopyBundle({ now = Date.now(), fetchBundle = fetchSettingsCopy } = {}) {
  const cached = await readCache();
  if (cached.nextCheckAt > now) return cached.bundle;
  try {
    const response = await fetchBundle(cached.etag);
    const fresh = response.status === 200 ? normalizeSettingsCopyBundle(response.body) : null;
    const next = {
      bundle: fresh || cached.bundle,
      etag: response.etag || cached.etag,
      checkedAt: now,
      nextCheckAt: now + settingsCopyRevalidateMs,
    };
    await saveCache(next);
    return next.bundle;
  } catch {
    return cached.bundle;
  }
}
