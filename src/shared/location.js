import { fetchApproximateLocation } from "./api.js";

function browserPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!globalThis.navigator?.geolocation) {
      reject(Object.assign(new Error("Browser location is unavailable."), { code: 2 }));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 300_000,
      ...options,
    });
  });
}

export async function resolveCurrentLocation({ precise = browserPosition, approximate = fetchApproximateLocation, onProgress = () => {} } = {}) {
  onProgress("Requesting browser location…");
  try {
    const position = await precise();
    return {
      location: {
        label: "Current location",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      accuracy: "precise",
    };
  } catch (error) {
    if (Number(error?.code) === 1) {
      throw new Error("Location permission was denied. You can still search for your city below.");
    }
    onProgress("Browser location missed. Trying an approximate network location…");
    try {
      const body = await approximate();
      return { location: body.data, accuracy: "approximate" };
    } catch (fallbackError) {
      throw new Error(fallbackError?.message || "Location is unavailable right now. Search for your city instead.");
    }
  }
}
