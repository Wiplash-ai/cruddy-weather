import assert from "node:assert/strict";
import test from "node:test";
import { resolveCurrentLocation } from "../src/shared/location.js";

test("uses precise browser coordinates when the provider succeeds", async () => {
  const result = await resolveCurrentLocation({
    precise: async () => ({ coords: { latitude: 30.2672, longitude: -97.7431 } }),
    approximate: async () => { throw new Error("fallback should not run"); },
  });
  assert.equal(result.accuracy, "precise");
  assert.equal(result.location.latitude, 30.2672);
});

test("falls back to approximate network location for provider failures", async () => {
  const progress = [];
  const result = await resolveCurrentLocation({
    precise: async () => { throw Object.assign(new Error("network service"), { code: 2 }); },
    approximate: async () => ({ data: { label: "Austin, TX", latitude: 30.2, longitude: -97.7 } }),
    onProgress: (message) => progress.push(message),
  });
  assert.equal(result.accuracy, "approximate");
  assert.equal(result.location.label, "Austin, TX");
  assert.match(progress.at(-1), /approximate network/i);
});

test("does not bypass an explicit location denial", async () => {
  await assert.rejects(resolveCurrentLocation({
    precise: async () => { throw Object.assign(new Error("denied"), { code: 1 }); },
    approximate: async () => ({ data: {} }),
  }), /permission was denied/i);
});
