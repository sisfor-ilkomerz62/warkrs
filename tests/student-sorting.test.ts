import { test } from "node:test";
import assert from "node:assert/strict";
import { sortStudents } from "../lib/student-sorting";
const students = [
  { id: "a", name: "zara", nim: "0010", email: "z@example.invalid", active: false },
  { id: "b", name: "Andi", nim: "002", email: "A@example.invalid", active: true },
  { id: "c", name: "budi", nim: null, email: "b@example.invalid", active: false },
];
test("text sorts case-insensitively and status sorts by displayed account state", () => {
  for (const key of ["name", "email", "active"] as const) {
    assert.equal(sortStudents(students, { key, direction: "asc" })[0].id, "b");
    assert.equal(sortStudents(students, { key, direction: "desc" })[0].id, "a");
  }
});
test("NIM uses numeric-aware strings and keeps missing values last both ways", () => {
  assert.deepEqual(sortStudents(students, { key: "nim", direction: "asc" }).map(s => s.nim), ["002", "0010", null]);
  assert.deepEqual(sortStudents(students, { key: "nim", direction: "desc" }).map(s => s.nim), ["0010", "002", null]);
  assert.equal(students[0].nim, "0010");
});
test("sorting covers the complete dataset before incremental display and never mutates input", () => {
  const rows = Array.from({ length: 65 }, (_, i) => ({ ...students[0], id: String(i), name: `Nama ${i}` }));
  const filtered = rows.filter(s => s.name.includes("Nama"));
  const shown = sortStudents(filtered, { key: "name", direction: "desc" }).slice(0, 50);
  assert.equal(shown[0].name, "Nama 64");
  assert.equal(shown[49].name, "Nama 15");
  assert.equal(rows[0].name, "Nama 0");
});
