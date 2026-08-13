export const levelLabels = Object.freeze({ safe: "Safe", mild: "Mild", hot: "Hot", spicy: "Spicy" });

const attitudeDescriptions = Object.freeze({
  safe: [
    "Clean, cheerful, and safe to leave open during a family Zoom call.",
    "The forecast keeps its manners and still tells you when outside is a mess.",
    "No swearing. Just weather with a suspicious amount of personality.",
    "Polite enough for your mom, honest enough to be useful.",
    "Friendly forecast mode. The clouds may be rude, but we are not.",
  ],
  mild: [
    "A little damn rude, a little dramatic, and still store-safe.",
    "The forecast can say hell and ass, but it knows when to behave.",
    "Mildly vulgar. Highly opinionated. Nothing HR needs to hear about.",
    "Weather with a smart mouth and one foot barely inside the line.",
    "A few damns, the occasional hell, and no need to clutch your pearls.",
  ],
  hot: [
    "The forecast swears because this weather is fucking ridiculous.",
    "No delicate language. The sky started this shit and we are finishing it.",
    "Full-strength profanity for weather that deserves an honest review.",
    "The filter is mostly gone. Outside can deal with it.",
    "Hot mode. The forecast is done politely tolerating this atmospheric bullshit.",
  ],
  spicy: [
    "No fucking filter. The atmosphere gets every goddamn word it earned.",
    "Maximum profanity, minimum restraint, and absolutely no apologies.",
    "The weather is an asshole and this setting is prepared to document it.",
    "Unhinged forecast mode. The fucking sky has been warned.",
    "Every filthy fucking thought the weather inspires, delivered on schedule.",
  ],
});

const unitDescriptions = Object.freeze({
  safe: {
    us: ["Fahrenheit. Familiar, practical, and blissfully free of math.", "Fahrenheit. The numbers America already understands.", "Fahrenheit. No conversion chart required.", "Fahrenheit. Built for people who know 75 means nice.", "Fahrenheit. Familiar numbers for an unpredictable sky."],
    metric: ["Celsius. Sensible, international, and quietly judging Fahrenheit.", "Celsius. Water freezes at zero, as logic intended.", "Celsius. A tidy little scale for a chaotic atmosphere.", "Celsius. Ten-degree jacket logic without extra arithmetic.", "Celsius. The weather scale that travels well."],
    scientific: ["Kelvin. Are you a scientist or something?", "Kelvin. Very official. Very laboratory chic.", "Kelvin. For anyone who thinks absolute zero belongs in casual conversation.", "Kelvin. Because ordinary temperature scales lack sufficient gravitas.", "Kelvin. Your forecast now comes dressed in a lab coat."],
  },
  mild: {
    us: ["Fahrenheit. The weird one America already understands.", "Fahrenheit. No math, no drama, just tell me if it is hot as hell.", "Fahrenheit. Nonsense everywhere else, useful as hell here.", "Fahrenheit. The national language of is-it-hot-yet.", "Fahrenheit. Strange, familiar, and not worth another damn argument."],
    metric: ["Celsius. Clean, logical, and smug as hell about it.", "Celsius. Because freezing at zero makes damn sense.", "Celsius. Neat, rational, and silently judging us.", "Celsius. A clean scale that makes weather math less annoying.", "Celsius. Logical as hell and welcome almost everywhere."],
    scientific: ["Kelvin. Are you a damn scientist or something?", "Kelvin. Okay, professor, calm the hell down.", "Kelvin. For when Celsius is not nerdy enough.", "Kelvin. Somebody brought lab equipment to a weather fight.", "Kelvin. Damn, professor, we get it."],
  },
  hot: {
    us: ["Fahrenheit. No conversions, no bullshit, just tell me if it is hot.", "Fahrenheit. America's batshit little temperature language.", "Fahrenheit. Weird as fuck, but at least you know what 90 means.", "Fahrenheit. We inherited this bullshit and somehow made it a personality.", "Fahrenheit. Tell me the number and skip the conversion crap."],
    metric: ["Celsius. Water freezes at a number that makes fucking sense.", "Celsius. Base ten, logical, and tired of Fahrenheit's bullshit.", "Celsius. The rest of the world cannot all be wrong, damn it.", "Celsius. Simple enough that the fucking weather is the complicated part.", "Celsius. One sensible choice in an atmosphere full of bullshit."],
    scientific: ["Kelvin. Are you a fucking scientist or something?", "Kelvin. What kind of laboratory bullshit is this?", "Kelvin. Absolute zero, because normal weather was too easy.", "Kelvin. Put on the fucking goggles; apparently we are doing science.", "Kelvin. Because your weather needed more significant digits and bullshit."],
  },
  spicy: {
    us: ["Fahrenheit. America chose chaos, and now it is your fucking weather setting.", "Fahrenheit. A deranged scale we defend like it pays our damn rent.", "Fahrenheit. Because apparently 32 is a perfectly sane place for water to freeze.", "Fahrenheit. A chaotic fucking scale for a chaotic fucking country.", "Fahrenheit. Nobody can explain it, but your sweaty ass understands it."],
    metric: ["Celsius. Base ten, globally understood, and sick of Fahrenheit's shit.", "Celsius. Zero means freezing. See how fucking easy that was?", "Celsius. The sane choice in this goddamn temperature circus.", "Celsius. The scale that does not need a goddamn flowchart.", "Celsius. Globally sensible while Fahrenheit eats crayons in the corner."],
    scientific: ["Kelvin. Are you a fucking scientist, a supervillain, or both?", "Kelvin. Absolute-zero nerd shit has entered the forecast.", "Kelvin. Congratulations, your weather now sounds like a fucking reactor readout.", "Kelvin. Your forecast has become a goddamn physics exam.", "Kelvin. Zero is absolute and so is this fucking nerd energy."],
  },
});

const themeDescriptions = Object.freeze({
  safe: {
    dark: ["Black, hot pink, and easy on tired eyes.", "Dark mode. Quiet background, loud pink accents.", "Lights out. The forecast still knows how to make an entrance.", "A dark canvas with hot-pink weather warnings.", "Low glare, high contrast, same forecast personality."],
    light: ["White, hot pink, and bright enough to face the day.", "Light mode. Crisp, clean, and unapologetically pink.", "The cheerful version, with plenty of breathing room.", "White space, pink accents, and no visual mysteries.", "Bright mode. Clean enough for daylight, loud enough for Cruddy."],
  },
  mild: {
    dark: ["Dark mode. Your retinas can calm the hell down.", "Black and hot pink. Moody, sharp, and easy as hell to read.", "Lights off. Pink stays loud; everything else chills out.", "Dark, dramatic, and easier on your tired-ass eyes.", "A low-light forecast with a loud pink mouth."],
    light: ["White and hot pink. Clean as hell and hard to miss.", "Light mode. For people who are suspiciously awake.", "Bright, crisp, and just a little bit obnoxious.", "White space with enough hot pink to keep things interesting.", "Light mode. Clean, sharp, and awake as hell."],
  },
  hot: {
    dark: ["Black and hot pink. Clean as fuck and allergic to glare.", "Dark mode. All the attitude, none of the blinding bullshit.", "Kill the lights. Let the pink do its damn job.", "Dark as fuck, pink where it counts, readable everywhere.", "Black background. Hot-pink attitude. No glaring bullshit."],
    light: ["White and hot pink. Bright as fuck and not remotely shy.", "Light mode. The forecast has turned every damn lamp on.", "A clean white canvas for loud-ass weather.", "The bright-ass version for people who fear no screen glare.", "White canvas, hot-pink forecast, zero subtlety."],
  },
  spicy: {
    dark: ["Lights out. Welcome to the hot-pink fucking void.", "Black, pink, and absolutely no bright-background bullshit.", "Dark mode: because the sky is loud enough already, goddamn it.", "Black as midnight, pink as sin, and readable as fuck.", "The hot-pink void would like to discuss your goddamn forecast."],
    light: ["White and hot pink. Your eyeballs signed the fucking waiver.", "Light mode. Bright, loud, and aggressively awake as shit.", "Every damn light is on and the pink still wins.", "A blindingly clean stage for filthy fucking weather reports.", "White background, hot-pink chaos, absolutely nowhere for the bullshit to hide."],
  },
});

const locationDescriptions = Object.freeze({
  city: {
    safe: ["Okay, city slicker. {place} is locked in.", "Found {place}. Plenty of buildings, one very opinionated sky.", "Big-city forecast secured for {place}.", "{place} found. Your skyline now has a forecast.", "Locked onto {place}. Urban atmosphere under review."],
    mild: ["Okay, city boy. {place} is locked in.", "Found {place}. Busy streets, loud sky, whole damn package.", "City weather for {place}. Try not to fight the traffic and the clouds.", "{place} secured. Concrete, traffic, and one cranky-ass sky.", "Found the city. Now let us see what the hell is happening overhead."],
    hot: ["Alright, city boy. We found your concrete-ass habitat: {place}.", "{place} found. Tall buildings, loud streets, same fucking atmosphere.", "Urban forecast locked. The sky over {place} can start explaining itself.", "{place} acquired. Time to audit this city's atmospheric bullshit.", "Found your urban-ass coordinates. The sky can testify now."],
    spicy: ["Okay, city boy. We found your loud fucking grid: {place}.", "{place} located. Millions of people and one goddamn forecast.", "Found your concrete jungle. Let us see what the fucking sky is doing to it.", "{place} confirmed. Let us inspect the fucking weather over all that concrete.", "City-boy coordinates accepted. The goddamn skyline is on notice."],
  },
  town: {
    safe: ["Found {place}. Small-town sky, full-size forecast.", "{place} is on the map and under observation.", "Town located. Let us see what the clouds have planned for {place}.", "There is {place}. Cozy scale, complete forecast.", "Found {place}. The clouds did not escape our attention."],
    mild: ["Found {place}. Small town, big damn atmosphere.", "{place} is locked in. Everybody probably knows it is going to rain already.", "Town forecast secured. The local sky can quit acting mysterious.", "{place} found. Main Street is about to get a damn forecast.", "Locked onto {place}. Small-town sky, zero secrets."],
    hot: ["Found {place}. Small-town weather with full-size bullshit.", "{place} locked in. Let us see what the fucking clouds are gossiping about.", "Town located. Yes, the sky is still being an asshole out there.", "{place} found. Let us review whatever atmospheric shit is brewing.", "Small town located. Big fucking forecast incoming."],
    spicy: ["Found {place}. Tiny dot on the map, giant fucking weather drama.", "{place} locked in. The clouds know everybody's business and now we do too.", "Small-town forecast secured. Let the local atmospheric bullshit commence.", "{place} confirmed. Population: some people and one nosy fucking forecast.", "Found it. The goddamn clouds over {place} can start talking."],
  },
  rural: {
    safe: ["You really found some breathing room out there, huh? {place} is set.", "Found {place}. Lots of sky, not many neighbors.", "Remote forecast secured. The horizon has nowhere to hide.", "{place} found. Big sky, precise coordinates.", "We found you out there. The forecast travels."],
    mild: ["Oh, you are out in the middle of nowhere, huh? Found {place}.", "{place} located. Plenty of sky and not a damn thing blocking it.", "Way out there, huh? Fine. The forecast found you anyway.", "{place} found. That is a lot of damn horizon.", "You picked the scenic route to a weather forecast, huh?"],
    hot: ["You are way the hell out there. {place} is locked in.", "Found your middle-of-nowhere-ass forecast for {place}.", "{place} located. Nothing around but weather and probably one stubborn mailbox.", "{place} acquired. The forecast drove past three cows and a mailbox to get here.", "Way the fuck out there, but still under the same nosy sky."],
    spicy: ["Oh, you are out in the middle of fucking nowhere, huh? Found {place}.", "{place} located. You cannot hide from the goddamn atmosphere out there.", "Middle-of-fucking-nowhere forecast secured. The sky has a clear shot at you.", "Found {place}. Even the fucking tumbleweeds are getting a forecast.", "Coordinates confirmed. You and the goddamn horizon are officially covered."],
  },
  generic: {
    safe: ["Found {place}. The forecast knows where to look now.", "{place} is set. Time to ask the sky some questions.", "Location locked. Weather opinions incoming for {place}.", "{place} found and ready for a forecast.", "Coordinates accepted. The sky report is cleared to land."],
    mild: ["Found {place}. Now the sky has no damn excuse.", "{place} locked in. Let us see what the weather is up to.", "Got it. The atmosphere over {place} is officially on notice.", "There you are. The damn atmosphere cannot dodge us now.", "{place} confirmed. Forecast nonsense is cleared for delivery."],
    hot: ["Found {place}. Now tell us what the fuck the sky is doing.", "{place} is locked in. Atmospheric bullshit incoming.", "Location secured. The weather can stop hiding now.", "Found you. The fucking sky can start answering questions.", "{place} confirmed. Let the atmospheric shit-talking begin."],
    spicy: ["Found {place}. Time to interrogate the fucking atmosphere.", "{place} locked in. Let the goddamn forecast begin.", "Got your location. The sky is officially out of fucking excuses.", "Coordinates locked. Time to subpoena the fucking clouds.", "{place} found. Now drag the goddamn forecast into the light."],
  },
});

const savedDescriptions = Object.freeze({
  safe: ["Saved locally. The sky is ready.", "All set. Your forecast now knows the rules.", "Saved. The atmosphere has received your preferences.", "Preferences saved. Tomorrow's sky will get the same instructions.", "Done. Your forecast is configured and ready."],
  mild: ["Saved locally. The sky can get its act together now.", "All set. Your damn forecast knows the rules.", "Saved. Let the mildly rude weather reports begin.", "Saved. Your forecast can keep the damn personality.", "Locked in. The sky knows the house rules now."],
  hot: ["Saved. The forecast knows exactly how much shit it can talk.", "All set. The fucking sky has its instructions.", "Preferences locked. Let the atmosphere explain itself.", "Saved. Your fucking forecast is armed and opinionated.", "Locked in. The weather can talk its properly configured shit."],
  spicy: ["Saved. The fucking weather has been formally warned.", "All set. Maximum atmospheric bullshit is now authorized.", "Locked in. Let the goddamn sky say what it came to say.", "Saved. The goddamn atmosphere now has a profanity budget.", "Preferences locked. Release the fucking forecast."],
});

const missingLocationDescriptions = Object.freeze({
  safe: ["No location chosen yet. The sky does not know where to look.", "Pick a place so the forecast can get to work.", "Location needed. Even weather with personality needs coordinates.", "Choose a U.S. location and the forecast will take it from there.", "The sky is ready; it just needs an address."],
  mild: ["No location yet. Where the hell should the forecast look?", "Pick a place so the damn sky knows where to aim.", "Location missing. Cruddy is opinionated, not psychic.", "Pick a location. The damn forecast cannot read minds.", "Tell Cruddy where to look and the sky can start explaining itself."],
  hot: ["No location chosen. Where the fuck are we forecasting?", "Pick a place so the forecast can start talking shit.", "Coordinates needed. Cruddy cannot yell at the whole fucking country at once.", "Give us a fucking location and the forecast can do its job.", "Pick somewhere. The atmosphere has plenty of shit to say once it knows where."],
  spicy: ["Where the fuck are you? Pick a location.", "No location, no goddamn forecast. Fix that first.", "Drop a pin somewhere. Cruddy is loud as fuck, not omniscient.", "Choose a fucking dot on the map so we can get on with it.", "The goddamn weather is waiting. Where the hell are you?"],
});

let configuredSettingsCopy = null;

export function configureSettingsCopy(settings = null) {
  configuredSettingsCopy = settings && typeof settings === "object" ? settings : null;
}

function remoteBranch(path) {
  let value = configuredSettingsCopy;
  for (const key of path) value = value?.[key];
  return Array.isArray(value) && value.length >= 5
    && value.every((line) => typeof line?.id === "string" && typeof line?.text === "string")
    ? value
    : null;
}

function lineOptions(fallback, path) {
  return remoteBranch(path) || fallback.map((text, index) => ({ id: `builtin.${path.join(".")}.${index + 1}`, text }));
}

function lineTexts(fallback, path) {
  return lineOptions(fallback, path).map((line) => line.text);
}

function pick(lines, variant = 0) {
  const index = Math.abs(Number.isFinite(Number(variant)) ? Math.trunc(Number(variant)) : 0) % lines.length;
  return lines[index];
}

export function attitudeDescription(level, variant = 0) {
  return pick(lineTexts(attitudeDescriptions[level] || attitudeDescriptions.mild, ["attitudes", level]), variant);
}

export function attitudeDescriptionCount(level) {
  return attitudeDescriptionOptions(level).length;
}

export function attitudeDescriptionOptions(level) {
  const selectedLevel = attitudeDescriptions[level] ? level : "mild";
  return lineOptions(attitudeDescriptions[selectedLevel], ["attitudes", selectedLevel]);
}

function inventoryCounts(record) {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [
    key,
    Array.isArray(value) ? value.length : inventoryCounts(value),
  ]));
}

export function settingsCopyInventory() {
  return {
    attitudes: inventoryCounts(attitudeDescriptions),
    units: inventoryCounts(unitDescriptions),
    themes: inventoryCounts(themeDescriptions),
    locations: inventoryCounts(locationDescriptions),
    saved: inventoryCounts(savedDescriptions),
    missingLocations: inventoryCounts(missingLocationDescriptions),
  };
}

export function unitDescription(units, level, variant = 0) {
  const descriptions = unitDescriptions[level] || unitDescriptions.mild;
  const selectedUnits = descriptions[units] ? units : "us";
  const selectedLevel = unitDescriptions[level] ? level : "mild";
  return pick(lineTexts(descriptions[selectedUnits], ["units", selectedLevel, selectedUnits]), variant);
}

export function themeDescription(theme, level, variant = 0) {
  const descriptions = themeDescriptions[level] || themeDescriptions.mild;
  const selectedTheme = descriptions[theme] ? theme : "dark";
  const selectedLevel = themeDescriptions[level] ? level : "mild";
  return pick(lineTexts(descriptions[selectedTheme], ["themes", selectedLevel, selectedTheme]), variant);
}

export function locationFlavor(location) {
  const kind = String(location?.kind || "").toLowerCase();
  const label = String(location?.label || "");
  if (["city", "suburb", "borough"].includes(kind)) return "city";
  if (["town", "municipality"].includes(kind)) return "town";
  if (["village", "hamlet", "rural", "county", "isolated_dwelling"].includes(kind) || /\bcounty\b/i.test(label)) return "rural";
  return "generic";
}

export function locationDescription(location, level, variant = 0) {
  const selectedLevel = locationDescriptions.generic[level] ? level : "mild";
  if (!location) return pick(lineTexts(missingLocationDescriptions[selectedLevel], ["missingLocations", selectedLevel]), variant);
  const flavor = locationFlavor(location);
  const descriptions = locationDescriptions[flavor][selectedLevel];
  const place = String(location.label || "your location").split(",")[0].trim();
  return pick(lineTexts(descriptions, ["locations", flavor, selectedLevel]), variant).replaceAll("{place}", place);
}

export function savedDescription(level, variant = 0) {
  const selectedLevel = savedDescriptions[level] ? level : "mild";
  return pick(lineTexts(savedDescriptions[selectedLevel], ["saved", selectedLevel]), variant);
}

export function alertHeadline(alert = {}) {
  return String(alert.headline || alert.event || "Weather alert")
    .replace(/\s+by\s+NWS\b.*$/i, "")
    .replace(/\s+issued\s+by\s+the\s+National Weather Service\b.*$/i, "");
}

export function temperatureLabel(period) {
  if (!period) return "—";
  return `${period.temperature}°${period.temperatureUnit}`;
}

export function weatherGlyph(forecast = "") {
  const value = forecast.toLowerCase();
  if (/tornado|thunder|storm/.test(value)) return "ϟ";
  if (/snow|sleet|blizzard|ice/.test(value)) return "✳";
  if (/rain|shower|drizzle/.test(value)) return "╱╱";
  if (/fog|mist|haze/.test(value)) return "≋";
  if (/wind|breezy/.test(value)) return "〰";
  if (/sun|clear/.test(value)) return "☀";
  return "☁";
}

export function daylightPeriods(periods = []) {
  const daytime = periods.filter((period) => period.isDaytime);
  return (daytime.length >= 5 ? daytime : periods).slice(0, 7);
}

export function sourceAgeLabel(source, cache) {
  if (!source?.generatedAt) return "Forecast time unavailable";
  const formatted = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(source.generatedAt));
  const stale = cache?.status === "stale" ? " · cached copy" : "";
  return `Updated ${formatted}${stale}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
