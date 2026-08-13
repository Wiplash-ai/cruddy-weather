export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

const apiOrigin = globalThis.CruddyWeatherConfig?.apiOrigin || "https://labs.wiplash.ai/cruddy-weather/api/";

async function request(path) {
  let response;
  try {
    response = await fetch(new URL(path.replace(/^\//, ""), apiOrigin));
  } catch {
    throw new ApiError("Cruddy Weather could not reach its forecast service. Try again in a moment.");
  }
  let body;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok) {
    throw new ApiError(body?.error?.message || `Cruddy Weather API returned ${response.status}.`, response.status);
  }
  return body;
}

export function fetchWeather(settings) {
  if (!settings.location) throw new ApiError("Choose a U.S. location before asking the sky for opinions.");
  const params = new URLSearchParams({
    lat: String(settings.location.latitude),
    lon: String(settings.location.longitude),
    label: settings.location.label,
    units: settings.units,
    level: settings.level,
  });
  return request(`/app/v1/weather?${params}`);
}

export function searchLocations(query) {
  return request(`/app/v1/locations?q=${encodeURIComponent(query)}`);
}

export function fetchApproximateLocation() {
  return request("/app/v1/location");
}

export async function fetchSettingsCopy(etag = null) {
  let response;
  try {
    response = await fetch(new URL("app/v1/copy/settings", apiOrigin), {
      headers: etag ? { "If-None-Match": etag } : {},
      cache: "no-cache",
    });
  } catch {
    throw new ApiError("Cruddy Weather could not refresh its copy library.");
  }
  if (response.status === 204 || response.status === 304) {
    return { status: response.status, etag: response.headers.get("etag"), body: null };
  }
  let body;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok) throw new ApiError(body?.error?.message || `Copy refresh returned ${response.status}.`, response.status);
  return { status: response.status, etag: response.headers.get("etag"), body };
}
