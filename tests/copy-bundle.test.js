import assert from "node:assert/strict";
import test from "node:test";
import { getSettingsCopyBundle, normalizeSettingsCopyBundle, settingsCopyRevalidateMs } from "../src/shared/copy-bundle.js";

const levels = ["safe", "mild", "hot", "spicy"];
const branch = (name) => Array.from({ length: 5 }, (_, index) => ({ id: `${name}.${index}`, text: `${name} generated copy line ${index}` }));
const levelMap = (name) => Object.fromEntries(levels.map((level) => [level, branch(`${name}.${level}`)]));

function payload(version = "copy_test_bundle") {
  return {
    schemaVersion: 1,
    version,
    generatedAt: "2026-08-25T09:00:00.000Z",
    activatedAt: "2026-08-25T10:00:00.000Z",
    settings: {
      attitudes: levelMap("attitudes"),
      units: Object.fromEntries(levels.map((level) => [level, Object.fromEntries(["us", "metric", "scientific"].map((unit) => [unit, branch(`units.${level}.${unit}`)]))])),
      themes: Object.fromEntries(levels.map((level) => [level, Object.fromEntries(["dark", "light"].map((theme) => [theme, branch(`themes.${level}.${theme}`)]))])),
      locations: Object.fromEntries(["city", "town", "rural", "generic"].map((flavor) => [flavor, levelMap(`locations.${flavor}`)])),
      saved: levelMap("saved"),
      missingLocations: levelMap("missing"),
    },
  };
}

test("accepts complete settings bundles and rejects incomplete branches", () => {
  assert.equal(normalizeSettingsCopyBundle(payload()).version, "copy_test_bundle");
  const incomplete = payload();
  incomplete.settings.attitudes.safe = incomplete.settings.attitudes.safe.slice(0, 4);
  assert.equal(normalizeSettingsCopyBundle(incomplete), null);
});

test("revalidates weekly while retaining the last good bundle", async () => {
  const storage = {};
  globalThis.chrome = { storage: { local: {
    get: async (key) => ({ [key]: storage[key] }),
    set: async (value) => Object.assign(storage, value),
  } } };
  let calls = 0;
  const first = await getSettingsCopyBundle({ now: 1000, fetchBundle: async () => {
    calls += 1;
    return { status: 200, etag: '"copy_test_bundle"', body: payload() };
  } });
  assert.equal(first.version, "copy_test_bundle");
  const cached = await getSettingsCopyBundle({ now: 2000, fetchBundle: async () => { calls += 1; throw new Error("should not fetch"); } });
  assert.equal(cached.version, "copy_test_bundle");
  assert.equal(calls, 1);
  const unchanged = await getSettingsCopyBundle({ now: 1000 + settingsCopyRevalidateMs, fetchBundle: async (etag) => {
    calls += 1;
    assert.equal(etag, '"copy_test_bundle"');
    return { status: 304, etag, body: null };
  } });
  assert.equal(unchanged.version, "copy_test_bundle");
  assert.equal(calls, 2);
  delete globalThis.chrome;
});
