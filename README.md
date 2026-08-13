<p align="center">
  <img src="src/assets/cruddy-mark.svg" alt="Cruddy Weather hot-pink poop mascot" width="150">
</p>

<h1 align="center">Cruddy Weather</h1>

<p align="center">
  <strong>Real weather. Bad attitude.</strong><br>
  <a href="https://labs.wiplash.ai/cruddy-weather/">Website</a> ·
  <a href="https://www.youtube.com/watch?v=TxP3riT157k">Watch the demo</a> ·
  <a href="https://labs.wiplash.ai/cruddy-weather/privacy/">Privacy</a>
</p>

Cruddy Weather is a U.S.-only Manifest V3 browser extension that combines a
useful new-tab page with a forecast that has an actual personality. It includes
a compact non-scrolling toolbar forecast, prominent web search, up to eight
frequently visited sites with locally rendered favicons, a weather-first
seven-day outlook that expands for longer commentary, active alerts,
Fahrenheit/Celsius/Kelvin, and four attitude levels configured only in Settings.

See the popup, new-tab dashboard, attitude controls, and weekly forecast in the
[Cruddy Weather video demo](https://www.youtube.com/watch?v=TxP3riT157k).

## Privacy and permissions

- `storage` keeps the chosen location, units, attitude, theme, viewed attitude-hint rotation, and last valid settings-copy bundle locally.
- `geolocation` is used only after the user presses “Use my current location.”
- `search` sends new-tab searches to the browser's configured search provider.
- `topSites` reads the browser's most frequently visited sites for local display on
  the new-tab page. That list is never sent to Cruddy Weather.
- `favicon` lets Chrome and Edge render those frequent-site icons from the
  browser's own local favicon cache. Firefox supplies icons with its top-sites
  result; Opera falls back to initials.
- Production host access is restricted to the Cruddy Weather API. The separate
  unpacked development build also permits the local API on port 8792.
- The extension does not read page content, open tabs, or full browsing history
  and contains no analytics, advertising, or remote scripts.

Forecast requests send the selected coordinates, location label, units, and
attitude to the Cruddy Weather API. If the browser's geolocation provider is
unavailable, an explicit current-location request falls back to approximate
network geolocation. See `src/privacy.html` for the user-facing disclosure.

## Development

Run the private API on port 8792, then:

```bash
npm install
npm run verify
```

Load `dist/dev-chrome` as an unpacked extension. It uses
`http://127.0.0.1:8792`; production builds use the hosted Wiplash endpoint.
Unsigned Chrome, Edge, Opera, and Firefox archives are written to
`artifacts/packages/`. Store listing copy and reviewer notes live in
`store-assets/LISTING.md` and `STORE_REVIEW.md`.

To refresh the listing screenshots and promotional graphics with an isolated
headless browser profile, run `npm run capture:store` after building.

Run `npm run smoke:newtab` with the local API running to verify weather-first
ordering, content-driven commentary growth, browser-default search, and
viewport containment at desktop sizes.

The free extension uses narrow public routes under `/app/v1`. Commercial API
routes remain authenticated under `/v1`; users never paste API origins or
credentials into the extension.

## Alerts and attribution

Alerts remain structurally separate from Cruddy commentary. The selected
attitude now carries through alert-driven commentary while still telling the
user to follow official instructions. The interface does not link users into
raw upstream responses.

Every dynamic settings-copy branch ships with at least five reviewed variants,
and the API provides 20 deterministic commentary variants for each weather
situation and attitude pairing.

The extension revalidates promoted settings copy at most once every seven days
through `/app/v1/copy/settings`. A refresh updates the unseen catalog but never
changes the attitude phrase currently on screen; a new phrase appears only
after the user changes attitude. The bundled catalog remains the permanent
offline and invalid-response fallback.

## Repository boundary

This public repository contains the extension, presentation code, build tools,
and deterministic client tests. Upstream normalization, caching,
authentication, commercial controls, IP-location fallback, and the phrase
engine live in the private `Wiplash-ai/cruddy-weather-api` repository.

## Internal product note

The product is an original Wiplash Labs tribute to the irreverent spirit that
made the discontinued Authentic Weather app memorable. Names, visual identity,
interface, phrase library, and implementation are original to Cruddy Weather;
the tribute is context for the team, not public-facing product copy.

Produced by [Wiplash.ai](https://wiplash.ai/).
