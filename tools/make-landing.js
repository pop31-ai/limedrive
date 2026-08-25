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

// standalone games (harvested originals)
let standalone = "";
let catCount = 0;
const catPath = path.join(ROOT, "standalone", "catalog.json");
if (fs.existsSync(catPath)) {
  const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
  catCount = cat.length;
  standalone = `<h1 style="margin-top:22px">🎲 Автономные игры</h1>
<p class="sub">оригинальные сборки — клик открывает в новой вкладке</p>
<div class="grid">
${cat.map(c => `<a class="card" href="${c.file}" target="_blank"><span class="t">${c.title}</span><span class="m">${c.category} · ${c.kb} KB</span></a>`).join("\n")}
</div>`;
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
.neuro{cursor:pointer;border-color:#00ff88}.neuro:active{background:#00331f}
.hint{margin-top:14px;color:#556;font-size:11px}
</style></head><body>
<h1>◆ LimeDrive</h1>
<p class="sub">${games.length} JSON-игр${catCount ? " + " + catCount + " автономных" : ""} · работает офлайн</p>
<div class="grid">
${cards}</div>
${standalone}
<div class="card neuro" id="neuroCard"><span class="t">⚡ НЕЙРО-УРОВЕНЬ</span><span class="m">сгенерировать и играть</span></div>
<p class="hint">Android: меню браузера → «Добавить на главный экран»</p>
<script src="neuro.js"></script>
<script>
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
if (window.NeuroGen) {
  NeuroGen.ready().then(() => {
    const card = document.getElementById("neuroCard");
    if (card) card.addEventListener("click", () => {
      const genres = NeuroGen.genres();
      const g = genres[Math.floor(Math.random() * genres.length)];
      const draft = NeuroGen.generate(g, Date.now() & 0xffffffff);
      try { localStorage.setItem("currentGame", JSON.stringify(draft)); } catch (e) {}
      location.href = "examples/player.html";
    });
  });
}
</script>
</body></html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), html, "utf8");
console.log("index.html written,", games.length, "games");
