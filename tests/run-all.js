#!/usr/bin/env node
"use strict";
/*
 * LimeDrive test runner: runs every tests/*.test.js + chess-test.js + patent-docs.test.js
 * sequentially (each puppeteer test starts its own HTTP server on an ephemeral port)
 * and reports a summary. Exit code 1 if any test fails.
 *
 * Usage:
 *   node tests/run-all.js            # all tests
 *   node tests/run-all.js mode-td    # only matching files (substring)
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const TESTS_DIR = __dirname;
const filter = process.argv.slice(2).map(s => s.toLowerCase());

const files = fs.readdirSync(TESTS_DIR)
  .filter(f => f.endsWith(".js"))
  .filter(f => f !== "run-all.js")
  .filter(f => filter.length === 0 || filter.some(q => f.toLowerCase().includes(q)))
  .sort();

if (files.length === 0) {
  console.error("No test files matched:", filter.join(", ") || "(all)");
  process.exit(1);
}

console.log(`LimeDrive test runner — ${files.length} file(s)\n`);
let failedFiles = 0;
const failed = [];

for (const f of files) {
  console.log(`\n=== ${f} ===`);
  const r = spawnSync(process.execPath, [path.join(TESTS_DIR, f)], {
    stdio: "inherit",
    timeout: 120000
  });
  if (r.status !== 0) {
    failedFiles++;
    failed.push(f);
    if (r.error && r.error.code === "ETIMEDOUT") console.log(`(timed out after 120s)`);
  }
}

console.log(`\n================ SUMMARY ================`);
console.log(`${files.length - failedFiles}/${files.length} test file(s) passed.`);
if (failed.length) {
  console.log("FAILED:");
  failed.forEach(f => console.log("  - " + f));
}
process.exit(failedFiles ? 1 : 0);
