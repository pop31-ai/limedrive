"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { canonicalize, sha256Hex } = require("../generator/patent-docs/hash");

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

const GAMES_DIR = path.join(__dirname, "..", "games");
const entries = fs.readdirSync(GAMES_DIR).filter(d => fs.statSync(path.join(GAMES_DIR, d)).isDirectory());

check("collection has at least one entry", () => {
  assert.ok(entries.length >= 1);
});

check("every entry is game.json + valid meta.json with matching fixation", () => {
  assert.ok(entries.length > 0);
  for (const dir of entries) {
    const base = path.join(GAMES_DIR, dir);
    const game = JSON.parse(fs.readFileSync(path.join(base, "game.json"), "utf8"));
    const meta = JSON.parse(fs.readFileSync(path.join(base, "meta.json"), "utf8"));
    for (const field of ["title", "author", "date", "engineVersion", "origin", "fixation", "rights"]) {
      assert.ok(meta[field] !== undefined, dir + ": missing meta." + field);
    }
    const recomputed = sha256Hex(canonicalize(game));
    assert.strictEqual(meta.fixation.sha256, recomputed, dir + ": sha256 mismatch");
  }
});

process.exit(failed ? 1 : 0);
