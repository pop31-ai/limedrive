#!/usr/bin/env node
"use strict";
/* Regenerates docs/EXAMPLES.md from examples/*.json — always in sync. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "examples");
const OUT = path.join(ROOT, "docs", "EXAMPLES.md");

const MODE_LABEL = {
  platformer: "Платформер", puzzle: "Сокобан-головоломка",
  shooter: "Шутер / Tower Defense", racing: "Гонки",
  "turn-based-strategy": "Пошаговая тактика", "endless-runner": "Бесконечный раннер",
  rpg: "RPG"
};

const games = fs.readdirSync(DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).sort();

let md = `# Examples — игры LimeDrive

_Автогенерация: \`node tools/generate-examples-doc.js\`. Не править руками._
_Запуск игр: \`python -m http.server 8080\` → \`http://localhost:8080/examples/player.html?game=<файл>\`_

| # | Файл | Название | Режим | Уровней | Сущностей |
|---|------|----------|-------|---------|-----------|
`;

let i = 0;
for (const f of games) {
  const g = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8").replace(/^\uFEFF/, ""));
  i++;
  let ents = 0;
  for (const lvl of g.levels || []) ents += (lvl.entities || []).length;
  const label = MODE_LABEL[g.type] || g.type;
  md += `| ${String(i).padStart(2, "0")} | \`${f}\` | ${g.name} | ${label} | ${(g.levels || []).length} | ${ents} |\n`;
}

md += `\n## Механики по режимам\n\n`;
const byMode = {};
for (const f of games) {
  const g = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8").replace(/^\uFEFF/, ""));
  (byMode[g.type] = byMode[g.type] || []).push({ f, name: g.name });
}
for (const [type, list] of Object.entries(byMode)) {
  md += `- **${MODE_LABEL[type] || type}** (\`${type}\`): ${list.map(x => x.name).join(", ")}\n`;
}
md += `
Подробные схемы параметров каждого режима — в корневом PROMPT.md,
раздел «РЕЖИМЫ ДВИЖКА».
`;

fs.writeFileSync(OUT, md, "utf8");
console.log("written docs/EXAMPLES.md,", games.length, "games");
