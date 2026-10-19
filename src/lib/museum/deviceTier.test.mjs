// Quality-tier selection. Run with `npm test` (Node's built-in test runner; no dependencies).
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectQualityTier } from "./deviceTier.ts";

/** A desktop that qualifies for the high tier; each case changes one signal. */
const desktop = { coarsePointer: false, screenShortSide: 1080, cores: 8, memoryGB: 8 };

test("a 1366x768 laptop gets the high tier, however short its browser window", () => {
  // Intel UHD 620 laptop (i5-8265U: 8 logical processors, 8 GB): the display, not the 657 px window, decides.
  assert.equal(selectQualityTier({ ...desktop, screenShortSide: 768 }), "high");
});

test("desktops with large displays get the high tier", () => {
  assert.equal(selectQualityTier(desktop), "high");
  assert.equal(selectQualityTier({ ...desktop, screenShortSide: 720 }), "high");
});

test("phones get the low tier", () => {
  assert.equal(selectQualityTier({ ...desktop, coarsePointer: true, screenShortSide: 390 }), "low");
  // A phone-sized display is low even if it reports a fine pointer (e.g. a stylus or a connected mouse).
  assert.equal(selectQualityTier({ ...desktop, screenShortSide: 390 }), "low");
  assert.equal(selectQualityTier({ ...desktop, screenShortSide: 699 }), "low");
});

test("tablets and touch-first devices get the low tier, whatever their display size", () => {
  assert.equal(selectQualityTier({ ...desktop, coarsePointer: true, screenShortSide: 1024 }), "low");
});

test("machines with few cores or little memory get the low tier", () => {
  assert.equal(selectQualityTier({ ...desktop, cores: 4 }), "low");
  assert.equal(selectQualityTier({ ...desktop, cores: 2 }), "low");
  assert.equal(selectQualityTier({ ...desktop, memoryGB: 4 }), "low");
  assert.equal(selectQualityTier({ ...desktop, memoryGB: 2 }), "low");
  assert.equal(selectQualityTier({ ...desktop, cores: 6, memoryGB: 8 }), "high");
});
