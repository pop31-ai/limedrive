#!/usr/bin/env node
"use strict";
/*
 * integrity.js — генератор снимка целостности ядра LimeDrive.
 * Считает строки/символы/sha256 для ключевых файлов и инвентарь каталогов,
 * пишет docs/INTEGRITY.md. Перегенерация: node tools/integrity.js
 * Расхождение таблицы с деревом = сигнал дрейфа.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, "/"); }
function digest(p) {
  const buf = fs.readFileSync(p);
  const s = buf.toString("utf8");
  return {
    lines: s.split("\n").length,
    chars: [...s].length,
    sha: crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12)
  };
}
function row(p) { const d = digest(p); return `| ${rel(p)} | ${d.lines} | ${d.chars} | \`${d.sha}\` |`; }

const CORE = [
  "examples/player.html",
  "sw.js",
  "manifest.json",
  "index.html",
  ...fs.readdirSync(path.join(ROOT, "engine")).filter(f => f.endsWith(".js")).sort().map(f => "engine/" + f),
  "tools/validate.js",
  "tools/check-game.js",
  "tests/run-all.js",
  "README.md",
  "PROMPT.md",
  "docs/README.md",
  "docs/GAME-FORMAT.md"
].map(f => path.join(ROOT, f)).filter(p => fs.existsSync(p));

const count = (dir, pred) => fs.readdirSync(path.join(ROOT, dir)).filter(pred).length;

const games = count("examples", f => f.endsWith(".json") && !f.startsWith("_"));
const fixtures = count("examples", f => f.startsWith("_fixture-"));
const tests = count("tests", f => f.endsWith(".js") && f !== "run-all.js");
const toolsJs = count("tools", f => f.endsWith(".js"));

const now = new Date().toISOString().slice(0, 16).replace("T", " ");

let md = `# INTEGRITY — снимок ядра (${now})

Контроль дрейфа: перегенерируйте \`node tools/integrity.js\` и сравните diff.
Изменилась строка без соответствующего коммита — ядро тронули.

## Ядро

| Файл | Строки | Символы | sha256:12 |
|------|-------:|--------:|-----------|
${CORE.map(row).join("\n")}

## Инвентарь

| Категория | Кол-во |
|-----------|-------:|
| Игры (examples/*.json) | ${games} |
| Тестовые фикстуры (_fixture-*) | ${fixtures} |
| Тестовые файлы (tests/) | ${tests} |
| Скрипты QA/tools (tools/*.js) | ${toolsJs} |

Правила: файлы с префиксом \`_\` не считаются играми; \`reports/\`, \`node_modules/\`
вне контроля. sha256 — первые 12 hex от байтового содержимого файла.
`;

fs.writeFileSync(path.join(ROOT, "docs", "INTEGRITY.md"), md, "utf8");
console.log("OK docs/INTEGRITY.md:", CORE.length, "core files;", games, "games,", fixtures, "fixtures,", tests, "tests");
