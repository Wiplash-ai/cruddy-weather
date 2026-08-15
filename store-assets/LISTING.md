# Cruddy Weather store listing draft

## Product identity

- Name: `Funny Weather New Tab - Cruddy Weather`
- Category: `News & Weather`
- Language: `English (United States)`
- Version: `0.1.2`
- Homepage: `https://labs.wiplash.ai/cruddy-weather/`
- Support: `https://labs.wiplash.ai/cruddy-weather/support/`
- Privacy: `https://labs.wiplash.ai/cruddy-weather/privacy/`
- Support email: `support@wiplash.ai`
- Video demo: `https://www.youtube.com/watch?v=TxP3riT157k`
- Mature content: `Yes` — stronger profanity is available in the opt-in Hot and Spicy attitude levels.

## Short description

Turn every new tab into a U.S. weather forecast with current conditions, alerts, search, frequent sites, and adjustable attitude.

## Search terms

- `weather new tab`
- `weather forecast`
- `7 day forecast`
- `local weather`
- `weather alerts`
- `new tab dashboard`
- `funny weather`

## Full description

Cruddy Weather turns your new tab and toolbar into a useful weather dashboard with an actual personality.

Get current conditions, active weather alerts, and a seven-day forecast for a U.S. location. Then choose how much restraint the forecast should pretend to have: Safe, Mild, Hot, or Spicy. Safe stays clean. Hot and Spicy unlock stronger language in Settings.

Features:

- Current conditions and a roomy seven-day forecast
- A compact toolbar popup for quick checks
- A full new-tab dashboard with web search and frequent-site shortcuts
- Safe, Mild, Hot, and Spicy commentary levels
- Fahrenheit, Celsius, and Kelvin
- Dark mode in black and hot pink, plus a white-and-pink light mode
- Clear, separate treatment for active weather alerts
- Deterministic commentary that stays consistent for the same forecast
- Location by browser permission or manual U.S. city and ZIP-code search

Privacy is part of the product. Cruddy Weather has no ads or extension analytics. Your preferences stay in local browser storage. Frequent-site names and addresses are rendered locally and are never sent to Cruddy Weather. Search text goes to the browser's configured provider—or Google Search in Opera—only when you submit it.

Cruddy Weather currently supports U.S. forecast locations. Weather can be delayed, incomplete, or wrong; follow official emergency guidance when safety is at stake.

## Single purpose

Cruddy Weather provides a personalized browser weather dashboard in the toolbar and new tab, with supporting search and locally rendered frequent-site shortcuts.

## Permission justifications

### `storage`

Stores the user's chosen location, units, attitude, theme, viewed settings-copy rotation, and last valid public copy bundle in local extension storage so the experience persists between browser sessions.

### `geolocation`

Requests the user's current coordinates only after the user presses the current-location button. The coordinates are used to retrieve a local forecast. A manual city or ZIP-code search is available instead.

### `search`

Passes text submitted in the new-tab search box to the search provider already configured in the user's browser. Search text is not sent to Cruddy Weather or Wiplash.ai.

Opera does not expose the Chromium `search` permission, so the Opera build omits that permission and sends a submitted search directly to Google Search instead.

### `topSites`

Reads up to eight frequent sites to render new-tab shortcuts. Site titles and URLs stay in the browser and are never transmitted to Cruddy Weather or Wiplash.ai.

### `favicon`

Uses Chrome's local favicon cache to show recognizable icons beside frequent-site shortcuts. Cruddy Weather does not contact a third-party favicon service or transmit the frequent-site list.

### `https://labs.wiplash.ai/cruddy-weather/api/*`

Sends the user-selected forecast coordinates, location label, unit system, and attitude level to the Cruddy Weather service, and periodically retrieves public commentary bundles. The extension requests no access to arbitrary websites.

## Remote code

No. All executable JavaScript and CSS ships inside the extension. The Cruddy Weather API returns structured weather data and text only; the extension does not execute remote strings as code.

## Data-use declarations

- Location: used to retrieve the forecast the user requests; transmitted to the Cruddy Weather service and weather infrastructure described in the privacy policy.
- Website history / frequent sites: handled locally through `topSites`; not transmitted.
- Search terms: passed only to the user's configured browser search provider after form submission; not sent to Cruddy Weather or Wiplash.ai.
- Extension preferences: stored locally; selected forecast settings are sent with forecast requests as described above.
- Advertising, profiling, credit, lending, or data brokerage: none.

## Reviewer steps

1. Install the extension and allow the new-tab override when the browser asks.
2. Open Settings from the toolbar popup or new-tab gear button.
3. Search for `Austin, TX`, choose the result, select an attitude and unit system, then save.
4. Open the toolbar popup and confirm current conditions plus seven forecast periods appear.
5. Open a new tab and confirm search, frequent-site shortcuts, current conditions, and the week-ahead forecast appear.
6. Toggle dark/light mode and change the attitude level in Settings.

No account, API key, paid subscription, or reviewer credential is required for extension review.

## Store-specific notes

### Chrome Web Store

- Use the Chrome ZIP from `artifacts/packages/`.
- Use `icon128.png`, at least one 1280 x 800 screenshot, and `promo-small-440x280.png`.
- Complete the Privacy tab using the single-purpose, permission, remote-code, and data-use answers above.
- Leave the item saved as a draft. Do not submit for review.

### Microsoft Edge Add-ons

- Use the Edge ZIP from `artifacts/packages/`.
- Mark the listing as containing mature content because Hot and Spicy are opt-in settings.
- Complete Package, Properties, Privacy, and Store listings, then leave the submission in Draft. Do not click Publish.

### Firefox Add-ons

- Use the unsigned Firefox XPI from `artifacts/packages/`.
- The manifest declares `locationInfo` and `searchTerms` in `data_collection_permissions` and includes the fixed Gecko ID `cruddy-weather@wiplash.ai`.
- If AMO cannot persist an unsubmitted version before its final `Submit Version` action, stop after local validation and asset preparation. Do not submit the version merely to create a dashboard entry.

### Opera Add-ons

- Use the Opera ZIP from `artifacts/packages/`.
- Use `icon300.png` if the dashboard requests a 300 x 300 icon and `promo-opera-300x188.png` for a 300 x 188 promotional image.
- Fill General, Details, and Images, then leave it saved before the final submit-for-review action.
