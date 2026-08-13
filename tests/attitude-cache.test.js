import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAttitudeCopyCache, selectAttitudeVariant } from "../src/shared/attitude-cache.js";

const phrases = (prefix = "mild") => Array.from({ length: 5 }, (_, index) => ({ id: `${prefix}.${index}`, text: `${prefix} phrase number ${index}` }));

test("keeps the cached phrase stable until attitude changes", () => {
  const first = selectAttitudeVariant({}, "mild", phrases(), false);
  const unchanged = selectAttitudeVariant(first.cache, "mild", phrases("replacement"), false);
  assert.equal(first.variant, 0);
  assert.equal(unchanged.phrase.text, first.phrase.text);
  assert.deepEqual(unchanged.cache.mild.seen, []);
});

test("uses five unseen phrases before beginning a new cycle", () => {
  let cache = {};
  const variants = [];
  for (let index = 0; index < 5; index += 1) {
    const selection = selectAttitudeVariant(cache, "spicy", phrases("spicy"), index > 0);
    cache = selection.cache;
    variants.push(selection.variant);
  }
  assert.deepEqual(variants, [0, 1, 2, 3, 4]);
  const nextCycle = selectAttitudeVariant(cache, "spicy", phrases("spicy"), true);
  assert.equal(nextCycle.variant, 0);
  assert.notEqual(nextCycle.variant, variants.at(-1));
});

test("tracks unseen phrases independently for each attitude", () => {
  const mildFirst = selectAttitudeVariant({}, "mild", phrases("mild"), false);
  const hotFirst = selectAttitudeVariant(mildFirst.cache, "hot", phrases("hot"), false);
  const mildSecond = selectAttitudeVariant(hotFirst.cache, "mild", phrases("mild"), true);
  assert.equal(hotFirst.variant, 0);
  assert.equal(mildSecond.variant, 1);
  assert.deepEqual(mildSecond.cache.hot.seen, ["hot.0"]);
});

test("drops malformed cached phrases", () => {
  const cache = normalizeAttitudeCopyCache({ safe: { current: -3, seen: [0, "safe.0", "safe.0", null] } });
  assert.deepEqual(cache.safe, { current: null, seen: ["safe.0"] });
});
