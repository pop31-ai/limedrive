#!/usr/bin/env node
"use strict";
/* Generates root landing (index.html) listing all example games for PWA/Pages. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "examples");

const MODE = {
  platformer: "Платформер", puzzle: "Головоломка", shooter: "Шутер/TD",
  racing: "Гонки", "turn-based-strategy": "Тактика", "endless-runner": "Раннер", rpg: "RPG"
};
const games = fs.readdirSync(DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).sort();

let cards = "";
for (const f of games) {
  let g;
  try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8").replace(/^\uFEFF/, "")); } catch { continue; }
  const label = MODE[g.type] || g.type || "";
  cards += `<a class="card" href="examples/player.html?game=${encodeURIComponent(f)}">
    <span class="t">${g.name || f}</span><span class="m">${label} · ${(g.levels || []).length} ур.</span></a>\n`;
}

const html = `<!DOCTYPE html>
<html lang="ru"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<meta name="theme-color" content="#00ff88">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/icon-192.png">
<title>LimeDrive Games</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:#0a0a14;color:#e8e8f0;font-family:monospace;padding:16px;touch-action:manipulation}
h1{color:#00ff88;font-size:22px;margin-bottom:4px}
p.sub{color:#888;font-size:12px;margin-bottom:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
.card{display:flex;flex-direction:column;gap:4px;background:#141424;border:1px solid #262640;
 border-radius:10px;padding:12px;text-decoration:none;color:#e8e8f0}
.card:active{background:#1c1c34}
.card .t{font-weight:bold;font-size:14px}
.card .m{color:#7799;font-size:11px}
.hint{margin-top:14px;color:#556;font-size:11px}
</style></head><body>
<h1>◆ LimeDrive</h1>
<p class="sub">${games.length} игр · работает офлайн</p>
<div class="grid">
${cards}</div>
<p class="hint">Android: меню браузера → «Добавить на главный экран»</p>
<script>
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
</script>
</body></html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), html, "utf8");
console.log("index.html written,", games.length, "games");
