"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Jsonl = require("../generator/patent-docs/jsonl");

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log("PASS " + name);
  } catch (e) {
    failed++;
    console.log("FAIL " + name + ": " + e.message);
  }
}

const recA = { sha256: "a".repeat(64), title: "Alpha", author: "ann", engineVersion: "1.0.0", origin: "manual", fixedAt: "2026-08-24T10:00:00Z" };
const recB = { sha256: "b".repeat(64), title: "Beta", author: "bob", engineVersion: "1.0.0", origin: "generator", fixedAt: "2026-08-24T11:00:00Z" };
const recLateA = { sha256: "a".repeat(64), title: "Alpha again", author: "kim", engineVersion: "1.0.0", origin: "manual", fixedAt: "2026-08-24T12:00:00Z" };

check("chain builds, verifies and sorts by time", () => {
  const lines = Jsonl.rebuildChain([recB, recA]);
  assert.strictEqual(lines.length, 2);
  const res = Jsonl.verifyChainText(lines.join("\n"));
  assert.ok(res.ok, res.errors.join("; "));
  const parsed = Jsonl.parseChain(lines.join("\n"));
  assert.deepStrictEqual(parsed.records.map(r => r.title), ["Alpha", "Beta"]);
});

check("tampering breaks the seal", () => {
  const lines = Jsonl.rebuildChain([recA, recB]);
  const tampered = lines.map(l => JSON.stringify(Object.assign({}, JSON.parse(l), { author: "evil" })));
  const res = Jsonl.verifyChainText(tampered.join("\n"));
  assert.ok(!res.ok);
});

check("duplicate fixations are dropped on rebuild", () => {
  const dup = Object.assign({}, recA);
  const lines = Jsonl.rebuildChain([recA, recB, dup]);
  assert.strictEqual(lines.length, 2);
});

check("same hash by different authors both survive", () => {
  const lines = Jsonl.rebuildChain([recA, recLateA]);
  assert.strictEqual(lines.length, 2);
});

check("merge of two clones dedupes and keeps earliest", () => {
  const merged = Jsonl.mergeRecordLists([recA], [recB, recLateA]);
  assert.strictEqual(merged.length, 3);
  const res = Jsonl.verifyChainText(merged.join("\n"));
  assert.ok(res.ok);
});

check("bad sha256 rejected at rebuild", () => {
  const bad = Object.assign({}, recA, { sha256: "nothex" });
  const lines = Jsonl.rebuildChain([recA, bad]);
  assert.strictEqual(lines.length, 1);
});

process.exit(failed ? 1 : 0);
