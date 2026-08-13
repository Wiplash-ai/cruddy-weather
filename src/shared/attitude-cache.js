export const attitudeCopyCacheKey = "cruddyAttitudeCopyCacheV2";

const levels = ["safe", "mild", "hot", "spicy"];

function emptyEntry() {
  return { current: null, seen: [] };
}

function normalizePhrase(value) {
  return value && typeof value.id === "string" && value.id && typeof value.text === "string" && value.text
    ? { id: value.id, text: value.text }
    : null;
}

function normalizeEntry(value = {}) {
  const current = normalizePhrase(value.current);
  const seen = Array.isArray(value.seen)
    ? [...new Set(value.seen.filter((item) => typeof item === "string" && item))]
    : [];
  return { current, seen };
}

export function normalizeAttitudeCopyCache(value = {}) {
  return Object.fromEntries(levels.map((level) => [level, normalizeEntry(value[level])]));
}

export function selectAttitudeVariant(value, level, phrases, advance = false) {
  const catalog = Array.isArray(phrases)
    ? phrases.map(normalizePhrase).filter(Boolean)
    : [];
  if (!catalog.length) throw new Error("Attitude copy catalog is empty.");
  const cache = normalizeAttitudeCopyCache(value);
  const selectedLevel = levels.includes(level) ? level : "mild";
  const entry = cache[selectedLevel] || emptyEntry();
  const current = entry.current;
  const catalogIds = new Set(catalog.map((phrase) => phrase.id));
  let seen = entry.seen.filter((id) => catalogIds.has(id));

  if (!advance && current) {
    cache[selectedLevel] = { current, seen: catalogIds.has(current.id) && !seen.includes(current.id) ? [...seen, current.id] : seen };
    return { cache, phrase: current, variant: catalog.findIndex((phrase) => phrase.id === current.id) };
  }

  if (seen.length >= catalog.length) seen = current && catalogIds.has(current.id) ? [current.id] : [];
  const currentIndex = current ? catalog.findIndex((phrase) => phrase.id === current.id) : -1;
  const start = (currentIndex + 1) % catalog.length;
  let variant = start;
  for (let offset = 0; offset < catalog.length; offset += 1) {
    const candidate = (start + offset) % catalog.length;
    const phrase = catalog[candidate];
    if (phrase && !seen.includes(phrase.id)) {
      variant = candidate;
      break;
    }
  }
  const phrase = catalog[variant];
  if (!phrase) throw new Error("Attitude copy selection failed.");
  cache[selectedLevel] = { current: phrase, seen: [...seen, phrase.id] };
  return { cache, phrase, variant };
}

export async function getAttitudeCopyCache() {
  if (!globalThis.chrome?.storage?.local) return normalizeAttitudeCopyCache();
  const stored = await chrome.storage.local.get(attitudeCopyCacheKey);
  return normalizeAttitudeCopyCache(stored[attitudeCopyCacheKey]);
}

export async function saveAttitudeCopyCache(cache) {
  const normalized = normalizeAttitudeCopyCache(cache);
  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.set({ [attitudeCopyCacheKey]: normalized });
  }
  return normalized;
}
