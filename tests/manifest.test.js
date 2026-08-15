import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../src/manifest.json", import.meta.url), "utf8"));

test("uses Manifest V3 with popup and new-tab surfaces", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "Funny Weather New Tab - Cruddy Weather");
  assert.equal(manifest.action.default_popup, "popup.html");
  assert.equal(manifest.chrome_url_overrides.newtab, "newtab.html");
  assert.ok(manifest.permissions.includes("topSites"));
  assert.ok(manifest.permissions.includes("favicon"));
  assert.deepEqual(manifest.host_permissions, ["https://labs.wiplash.ai/cruddy-weather/api/*"]);
  assert.equal(manifest.browser_specific_settings.gecko.id, "cruddy-weather@wiplash.ai");
  assert.deepEqual(manifest.browser_specific_settings.gecko.data_collection_permissions.required, ["locationInfo", "searchTerms"]);
});

test("requests no browsing, scripting, tab, or all-site access", () => {
  for (const permission of ["history", "tabs", "scripting", "webRequest", "activeTab"]) {
    assert.ok(!manifest.permissions.includes(permission));
  }
  assert.ok(!manifest.host_permissions.some((pattern) => pattern === "https://*/*" || pattern === "<all_urls>"));
  assert.ok(!manifest.host_permissions.some((pattern) => /localhost|127\.0\.0\.1/.test(pattern)));
});
