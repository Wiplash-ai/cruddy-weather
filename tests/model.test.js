import assert from "node:assert/strict";
import test from "node:test";
import { alertHeadline, attitudeDescription, attitudeDescriptionCount, configureSettingsCopy, daylightPeriods, escapeHtml, locationDescription, locationFlavor, savedDescription, settingsCopyInventory, temperatureLabel, themeDescription, unitDescription, weatherGlyph } from "../src/shared/model.js";
import { normalizeSettings } from "../src/shared/settings.js";

test("normalizes privacy-sensitive settings without inventing a location", () => {
  const settings = normalizeSettings({ level: "chaos", units: "kelvin", theme: "neon", apiUrl: "http://localhost:8792/", apiKey: "nope" });
  assert.equal(settings.level, "mild");
  assert.equal(settings.units, "us");
  assert.equal(settings.theme, "dark");
  assert.equal(settings.searchProvider, "browser");
  assert.equal(settings.location, null);
  assert.ok(!("apiUrl" in settings));
  assert.ok(!("apiKey" in settings));
});

test("normalizes new-tab preferences without granting them extra reach", () => {
  const settings = normalizeSettings({ searchProvider: "engine:DuckDuckGo", weatherDock: "right" });
  assert.equal(settings.searchProvider, "engine:DuckDuckGo");
  assert.ok(!("weatherDock" in settings));
  assert.equal(normalizeSettings({ searchProvider: "https://example.com" }).searchProvider, "browser");
});

test("settings copy reacts to both attitude and temperature unit", () => {
  assert.match(attitudeDescription("spicy"), /fuck/i);
  assert.match(unitDescription("scientific", "safe"), /scientist/i);
  assert.match(unitDescription("scientific", "spicy"), /fucking scientist/i);
  assert.notEqual(unitDescription("scientific", "safe"), unitDescription("scientific", "spicy"));
  assert.notEqual(attitudeDescription("mild", 0), attitudeDescription("mild", 1));
  for (const level of ["safe", "mild", "hot", "spicy"]) assert.equal(attitudeDescriptionCount(level), 5);
  assert.match(themeDescription("dark", "spicy"), /fuck/i);
  assert.match(savedDescription("hot"), /shit/i);
});

test("uses a configured remote branch while preserving bundled fallbacks", () => {
  configureSettingsCopy({ attitudes: { safe: Array.from({ length: 5 }, (_, index) => ({ id: `remote.${index}`, text: `Remote safe weather phrase number ${index}.` })) } });
  assert.equal(attitudeDescription("safe", 1), "Remote safe weather phrase number 1.");
  assert.match(unitDescription("scientific", "safe"), /scientist/i);
  configureSettingsCopy();
});

test("ships at least five variants for every dynamic settings-copy branch", () => {
  const leafCounts = [];
  const collect = (value) => {
    if (typeof value === "number") leafCounts.push(value);
    else Object.values(value).forEach(collect);
  };
  collect(settingsCopyInventory());
  assert.ok(leafCounts.length > 0);
  assert.ok(leafCounts.every((count) => count >= 5));
});

test("location copy reflects both place type and selected attitude", () => {
  const city = { label: "Austin, Texas", kind: "city" };
  const rural = { label: "Nowhere County, Texas", kind: "county" };
  assert.equal(locationFlavor(city), "city");
  assert.equal(locationFlavor(rural), "rural");
  assert.match(locationDescription(city, "mild"), /city boy/i);
  assert.match(locationDescription(rural, "spicy"), /middle of fucking nowhere/i);
});

test("removes upstream source suffixes from alert display copy", () => {
  assert.equal(alertHeadline({ headline: "Heat Advisory issued until 8 PM by NWS Fort Worth TX" }), "Heat Advisory issued until 8 PM");
});

test("renders safe display values", () => {
  assert.equal(temperatureLabel({ temperature: 300.2, temperatureUnit: "K" }), "300.2°K");
  assert.equal(weatherGlyph("Thunderstorms Likely"), "ϟ");
  assert.equal(escapeHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
});

test("selects seven daytime forecast periods", () => {
  const periods = Array.from({ length: 16 }, (_, index) => ({ id: index, isDaytime: index % 2 === 0 }));
  const selected = daylightPeriods(periods);
  assert.equal(selected.length, 7);
  assert.ok(selected.every((period) => period.isDaytime));
});
