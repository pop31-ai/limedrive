"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { canonicalize, sha256Hex } = require("../generator/patent-docs/hash");
const { referat, LIMIT } = require("../generator/patent-docs/referat");
const { listing } = require("../generator/patent-docs/listing");
const { description } = require("../generator/patent-docs/description");
const { Registry } = require("../generator/patent-docs/registry");
const { GenerationLog } = require("../generator/patent-docs/generation-log");
const { compare } = require("../generator/patent-docs/similarity");
const { buildPackage } = require("../generator/patent-docs/package");

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

check("sha256 known vectors", () => {
  assert.strictEqual(sha256Hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.strictEqual(sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

check("canonical hash independent of key order", () => {
  const a = { b: { d: 2, c: 3 }, a: 1, list: [3, 1, 2] };
  const b = { list: [3, 1, 2], a: 1, b: { c: 3, d: 2 } };
  assert.strictEqual(sha256Hex(canonicalize(a)), sha256Hex(canonicalize(b)));
});

const examplePath = path.join(__dirname, "..", "examples", "01-lime-platformer.json");
const example = JSON.parse(fs.readFileSync(examplePath, "utf8"));

check("referat within limit", () => {
  const r = referat(example);
  assert.ok(r.length <= LIMIT, "len=" + r.length);
  assert.ok(/Программа для ЭВМ/.test(r));
});

check("listing numbered with pages", () => {
  const l = listing(example, "1.0.0");
  assert.ok(l.startsWith("ДЕПОНИРУЕМЫЙ ЛИСТИНГ"));
  assert.ok(/страница/.test(l));
});

check("description sections present", () => {
  const d = description(example, "1.0.0");
  for (const sec of ["Общие сведения", "Назначение", "Структура данных", "Среда исполнения"]) {
    assert.ok(d.includes(sec), sec);
  }
});

check("registry resolves earliest fixation", () => {
  const reg = new Registry();
  reg.fix({ sha256: "X", author: "late", fixedAt: "2026-08-24T15:00:00Z" });
  reg.fix({ sha256: "X", author: "early", fixedAt: "2026-08-24T10:00:00Z" });
  assert.strictEqual(reg.resolvePriority("X").author, "early");
  assert.strictEqual(reg.resolvePriority("missing"), null);
});

check("registry seal detects tampering", () => {
  const reg = new Registry();
  reg.fix({ sha256: "Y" });
  const state = reg.exportState();
  assert.ok(Registry.verify(state));
  state.records[0].author = "evil";
  assert.ok(!Registry.verify(state));
});

check("generation log verifies dumps and detects forgery", () => {
  const log = new GenerationLog();
  log.addPrompt("make platformer", 1);
  log.addEdit("changed jump force");
  const dump = log.dump();
  assert.ok(GenerationLog.verify(dump));
  dump.entries.push({ ts: "now", type: "prompt", text: "forged" });
  assert.ok(!GenerationLog.verify(dump));
});

check("similarity ignores template zone", () => {
  const a = JSON.parse(JSON.stringify(example));
  const b = JSON.parse(JSON.stringify(example));
  if (b.settings) {
    b.settings.gravity = [99];
    b.settings.friction = [0.1];
  }
  assert.strictEqual(compare(a, b).score, 1);
  const c = JSON.parse(JSON.stringify(example));
  let shifted = false;
  for (const lv of c.levels || []) {
    lv.entities = (lv.entities || []).map((en, i) => ({ ...en, x: (en.x | 0) + 5000 + i }));
    shifted = true;
  }
  assert.ok(shifted);
  assert.ok(compare(a, c).score < 1, "score=" + compare(a, c).score);
});

check("end-to-end package build", () => {
  const pkg = buildPackage(example, { author: "Тест" });
  assert.strictEqual(pkg.deposit.sha256.length, 64);
  assert.ok(pkg.referat.length <= 700);
  assert.ok(pkg.listing.length > 0);
  assert.ok(pkg.checklist.length > 0);
  assert.strictEqual(pkg.fees.total > 0, true);
});

process.exit(failed ? 1 : 0);
