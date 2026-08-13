import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const [html, css, script] = await Promise.all([
  readFile(new URL("../src/newtab.html", import.meta.url), "utf8"),
  readFile(new URL("../src/app.css", import.meta.url), "utf8"),
  readFile(new URL("../src/app.js", import.meta.url), "utf8"),
]);

test("puts weather before search and lets oversized commentary grow its card", () => {
  assert.ok(html.indexOf('class="weather-stage"') < html.indexOf('class="search-zone"'));
  assert.match(css, /body\[data-surface="newtab"\][^}]*overflow-y:\s*auto/);
  assert.match(html, /id="searchProvider"/);
  assert.match(html, /id="searchProviderTrigger"/);
  assert.match(html, /role="listbox"/);
  assert.ok(html.indexOf('id="searchProvider"') > html.indexOf('id="webSearch"'));
  assert.doesNotMatch(script, /data-weather-drag|weatherDockForPoint|persistWeatherDock/);
  assert.doesNotMatch(script, /weatherOffset/);
  assert.match(script, /newtab-weather-layout/);
  assert.match(script, /\$\{dashboard\}\$\{forecastMarkup\(weather\.daily\)\}/);
  assert.match(script, /<dt>Humidity<\/dt>/);
  assert.match(script, /<dt>Feels like<\/dt>/);
  assert.match(css, /\.newtab-weather-layout\s*\{[^}]*height:\s*auto[^}]*grid-template-rows:\s*minmax\([^;]*,\s*auto\)\s+var\(--forecast-row-height\)/s);
  assert.match(css, /body\[data-surface="newtab"\]\s+\.weather-overview\s*\{[^}]*overflow:\s*visible/);
});

test("uses browser-owned favicon data without a third-party favicon service", () => {
  assert.match(script, /_favicon\//);
  assert.match(script, /includeFavicon:\s*true/);
  assert.doesNotMatch(script, /google\.com\/s2\/favicons|icons\.duckduckgo\.com/);
});

test("keeps Chromium search on the browser default while enabling installed Firefox engines", () => {
  assert.match(script, /chrome\.search\?\.query/);
  assert.match(script, /chrome:\/\/settings\/searchEngines/);
  assert.match(script, /browser\.search\.get/);
  assert.match(script, /browser\.search\.search/);
  assert.match(script, /syncCustomSearchPicker/);
  assert.match(script, /data-search-provider-value/);
});
