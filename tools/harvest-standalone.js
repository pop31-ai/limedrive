#!/usr/bin/env node
"use strict";
/* Harvest -> limedrive/standalone: copies self-contained games, builds catalog. */
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects";
const HARVEST = path.join(ROOT, "harvest");
const OUT = path.join(ROOT, "limedrive", "standalone");
const CATALOG = path.join(OUT, "catalog.json");

fs.mkdirSync(OUT, { recursive: true });

// [source, title, category, outName]  — source: "H:..." = harvest-relative, "R:..." = repo-root-relative
const GAMES = [
  ["H:4a/poliart-holo/index.html", "Голоциадель — Архитектор голограмм", "настолка", "poliart-holo.html"],
  ["H:4a/safari-marathon/index.html", "Сафари-Марафон", "аркада", "safari-marathon.html"],
  ["H:4a/poliart-atlet/index.html", "Φ-Атлет — Корпус в движении", "арт-3D", "poliart-atlet.html"],
  ["H:4a/poliart-fotosafari/index.html", "Фотосафари", "аркада", "poliart-fotosafari.html"],
  ["H:4a/poliart-dragon/index.html", "Дракон — Змеиные Врата", "викторина", "poliart-dragon.html"],
  ["H:4a/poliart-lotto/index.html", "Лотто — Золотая викторина", "викторина", "poliart-lotto.html"],
  ["H:4a/poliart-ogon/index.html", "Огонь — Викторина огня", "викторина", "poliart-ogon.html"],
  ["H:4a/poliart-grumble/index.html", "Грумбл — Грустные портреты", "настолка", "poliart-grumble.html"],
  ["H:4a/poliart-operator/index.html", "Оператор ночного объекта", "3D", "poliart-operator.html"],
  ["H:4a/builders-star/index.html", "Звезда Строителей", "настолка", "builders-star.html"],
  ["H:4a/poliart-phi/index.html", "Φ — Сетка золотого сечения", "арт-тул", "poliart-phi.html"],
  ["H:4a/basketball.html", "Баскетбол ПолиАрт", "спорт", "basketball.html"],
  ["H:4a/meridian", "Меридиан — Золотое Сечение", "арт", "meridian/"],
  ["H:4a/dice-cards-game", "Кубик-Карты", "настолка", "dice-cards/"],
  ["R:kandinsky-train.html", "Kandinsky Train — паровозик", "раннер", "kandinsky-train.html"],
  ["H:fingerdraw/index.html", "FingerDraw — рисование", "тул", "fingerdraw.html"],
  ["H:polygray/template", "ПолиГрей — шаблон настолки", "настолка", "polygray/"],
  ["H:polyart-live", "PolyArt Live — 49 живых галерей", "арт", "polyart-live/"],
  ["H:4a/GrimArt/ui", "GrimArt — генератор грима (эксперимент)", "арт", "grimart/"]
];

const catalog = [];
let total = 0;
for (const [src, title, cat, outName] of GAMES) {
  const srcPath = src.startsWith("H:") ? path.join(HARVEST, src.slice(2))
    : src.startsWith("R:") ? path.join(ROOT, src.slice(2)) : src;
  if (!fs.existsSync(srcPath)) { console.log("MISS " + src); continue; }
  const isDir = outName.endsWith("/");
  const dst = path.join(OUT, outName);
  if (isDir) {
    fs.mkdirSync(dst, { recursive: true });
    fs.cpSync(srcPath, dst, { recursive: true, filter: (s) =>
      !s.includes("\\.git") && !s.includes("__pycache__") && !s.endsWith(".pyc") });
  } else {
    fs.copyFileSync(srcPath, dst);
  }
  const size = outName.endsWith("/")
    ? (() => { let t = 0; (function w(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); const st = fs.statSync(p); if (st.isDirectory()) w(p); else t += st.size; } })(dst); return t; })()
    : fs.statSync(dst).size;
  total += size;
  catalog.push({ file: "standalone/" + outName, title, category: cat, kb: Math.round(size / 1024) });
  console.log("+" + outName + " (" + Math.round(size / 1024) + " KB)");
}
catalog.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2), "utf8");
console.log("--- catalog:", catalog.length, "games,", Math.round(total / 1024 / 1024 * 10) / 10, "MB total");
