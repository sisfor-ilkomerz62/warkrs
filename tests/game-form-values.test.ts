import { test } from "node:test";
import assert from "node:assert/strict";
import { validWarTime, warDatePayload, quotaDigits } from "../lib/game-form-values";
import { draftInput } from "../lib/game-validation";
test("direct HH:mm accepts every minute and rejects invalid or incomplete hours", () => {
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m++)
    assert.ok(validWarTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`));
  for (const value of ["24:00", "23:60", "-1:00", "1:00", "12:", "", "aa:bb"])
    assert.equal(validWarTime(value), false);
  assert.equal(warDatePayload("2026-11-19T00:00"), "2026-11-18T17:00:00.000Z");
  assert.equal(warDatePayload("2026-11-19T23:59"), "2026-11-19T16:59:00.000Z");
  assert.equal(warDatePayload("2026-11-19T24:00"), "");
});
test("quota editing supports empty strings, removes leading zeros and rejects non-digits", () => {
  assert.equal(quotaDigits(""), "");
  assert.equal(quotaDigits("00012"), "12");
  assert.equal(quotaDigits("0"), "0");
  for (const value of ["-1", "1.5", "1e3", "abc"]) assert.equal(quotaDigits(value), null);
  const schema = draftInput.shape.packages.element.shape.capacity;
  for (const value of ["", "0", "100001"]) assert.equal(schema.safeParse(Number(value)).success, false);
  for (const value of ["1", "100000"]) assert.equal(schema.safeParse(Number(value)).success, true);
});
