"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const core = require("../lang/i18n.js");

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

const LANG_DIR = path.join(__dirname, "..", "lang");
const LOCALES = ["en", "ru", "es", "de"];

function loadDict(locale) {
  return JSON.parse(fs.readFileSync(path.join(LANG_DIR, locale + ".json"), "utf8"));
}

check("pickLocale exact match", () => {
  assert.strictEqual(core.pickLocale(core.SUPPORTED, ["ru-RU"]), "ru");
  assert.strictEqual(core.pickLocale(core.SUPPORTED, ["en"]), "en");
});

check("pickLocale base-language fallback", () => {
  assert.strictEqual(core.pickLocale(core.SUPPORTED, ["de-AT", "fr"]), "de");
});

check("pickLocale falls back to en", () => {
  assert.strictEqual(core.pickLocale(core.SUPPORTED, ["zh-CN", "ja"]), "en");
  assert.strictEqual(core.pickLocale(core.SUPPORTED, []), "en");
});

check("all locales share identical key sets", () => {
  const en = Object.keys(loadDict("en")).sort();
  for (const loc of LOCALES) {
    const keys = Object.keys(loadDict(loc)).sort();
    assert.deepStrictEqual(keys, en, loc + " key mismatch: " + keys.join(","));
  }
});

check("no empty translations", () => {
  for (const loc of LOCALES) {
    const dict = loadDict(loc);
    for (const [k, v] of Object.entries(dict)) {
      assert.ok(typeof v === "string" && v.trim().length > 0, loc + ":" + k);
    }
  }
});

check("i18n.js is browser-loadable (no module-only syntax)", () => {
  const src = fs.readFileSync(path.join(LANG_DIR, "i18n.js"), "utf8");
  assert.ok(/globalThis/.test(src));
  assert.ok(!/^require\(/m.test(src));
});

process.exit(failed ? 1 : 0);
