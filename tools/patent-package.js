"use strict";

const fs = require("fs");
const path = require("path");
const { buildPackage } = require("../generator/patent-docs/package");

function arg(name, def) {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const input = process.argv[2];
if (!input || input.startsWith("--")) {
  console.error("usage: node tools/patent-package.js <game.json> [--author NAME] [--engine-version V] [--out DIR]");
  process.exit(1);
}

const game = JSON.parse(fs.readFileSync(path.resolve(input), "utf8"));
const pkg = buildPackage(game, {
  author: arg("author", ""),
  engineVersion: arg("engine-version", "1.0.0")
});

const line = "=".repeat(70);
const text = [
  line,
  `ПАКЕТ РЕГИСТРАЦИИ ПРОГРАММЫ ДЛЯ ЭВМ: ${pkg.title}`,
  `Автор: ${pkg.author || "(не указан)"}; движок LimeDrive v${pkg.engineVersion}`,
  `Фиксация приоритета: sha256=${pkg.deposit.sha256} (${pkg.deposit.fixedAt})`,
  line,
  "",
  "--- 1. РЕФЕРАТ ---",
  pkg.referat,
  "",
  "--- 2. ОПИСАНИЕ ---",
  pkg.description,
  "",
  "--- 3. ЧЕК-ЛИСТ ПОДАЧИ ---",
  ...pkg.checklist.map((s, i) => `${i + 1}. ${s}`),
  "",
  "--- 4. ПОШЛИНЫ ---",
  pkg.fees.note,
  ...pkg.fees.items.map(i => `- ${i.label}: ${i.amount} ${pkg.fees.currency}`),
  `Итого: ${pkg.fees.total} ${pkg.fees.currency}`,
  "",
  "--- 5. ДЕПОНИРУЕМЫЙ ЛИСТИНГ ---",
  pkg.listing
].join("\n");

const outDir = path.resolve(arg("out", "reports"));
fs.mkdirSync(outDir, { recursive: true });
const base = (pkg.title || "game").replace(/[^\wа-яё]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase() || "game";
const outFile = path.join(outDir, `${base}.patent.txt`);
fs.writeFileSync(outFile, text, "utf8");

console.log(`OK ${outFile}`);
console.log(`sha256: ${pkg.deposit.sha256}`);
console.log(`referat: ${pkg.referat.length}/700`);
