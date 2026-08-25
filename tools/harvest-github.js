#!/usr/bin/env node
"use strict";
/* Auto-harvest github clones -> standalone/ + merge into catalog.json */
const fs = require("fs");
const path = require("path");
const ROOT = [ "C:", "Users", "e", "Documents", "Projects", "limedrive" ].join("/");
const BASE = [ "C:", "Users", "e", "Documents", "Projects", "harvest", "github" ].join("/");
const OUT = path.join(ROOT, "standalone");
const CATALOG = path.join(OUT, "catalog.json");

const SKIP = new Set([ "bastion", "ice-curling", "mehamaster", "suitcase-game",
  "poliart-grumble", "polyart-spravka", "toy-solders", "stairway-quest",
  "The-Great-Crossing", "tinychat", "Campus-Voyager", "Flare2Fue", "maze_game",
  "poliart-atlet", "poliart-operator", "fotosafari", "polyart-live",
  "robot-factory", "builders-star", "dice-cards-game", "meridian",
  "GrimArt-", "poli", "shshki" ]);

function walk(dir, depth, out) {
  if (depth > 3) return;
  let items;
  try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const it of items) {
    if (it.name === ".git" || it.name === "node_modules") continue;
    const p = path.join(dir, it.name);
    if (it.isDirectory()) walk(p, depth + 1, out);
    else if (/\.html$/i.test(it.name)) out.push(p);
  }
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "game";
}

const cat = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const have = new Set(cat.map(c => c.title));
let added = 0, total = 0;

for (const proj of fs.readdirSync(BASE).sort()) {
  if (SKIP.has(proj)) continue;
  const pp = path.join(BASE, proj);
  if (!fs.statSync(pp).isDirectory()) continue;
  const htmls = [];
  walk(pp, 0, htmls);
  if (!htmls.length) continue;
  let main = htmls[0], sz = 0;
  for (const h of htmls) { const s2 = fs.statSync(h).size; if (s2 > sz) { sz = s2; main = h; } }
  const s = fs.readFileSync(main, "utf8");
  const title = ((s.match(/<title>([^<]*)<\/title>/i) || [])[1] || proj).trim();
  if (have.has(title)) continue;
  const ext = [...s.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map(m => m[1])
    .filter(u => !u.startsWith("#") && !u.startsWith("data:") && !u.endsWith(".html") && !/^https?:/i.test(u) && u !== "/" && !u.startsWith("${"));
  const relDir = path.dirname(main).slice(pp.length + 1);
  const multi = ext.length > 0 && !ext.every(e => e.startsWith("http"));
  const slugName = slug(proj);
  let file, kb;
  if (multi) {
    const srcDir = relDir ? path.join(pp, relDir) : pp;
    const dst = path.join(OUT, slugName);
    fs.mkdirSync(dst, { recursive: true });
    fs.cpSync(srcDir, dst, { recursive: true, filter: s2 =>
      !s2.includes(".git") && !s2.includes("__pycache__") && !s2.endsWith(".pyc") });
    file = "standalone/" + slugName + "/";
    let t = 0; (function w(d) { for (const f of fs.readdirSync(d)) { const p2 = path.join(d, f); const st = fs.statSync(p2); if (st.isDirectory()) w(p2); else t += st.size; } })(dst);
    kb = Math.round(t / 1024);
  } else {
    file = "standalone/" + slugName + ".html";
    fs.copyFileSync(main, path.join(OUT, slugName + ".html"));
    kb = Math.round(sz / 1024);
  }
  cat.push({ file, title, category: "харвест", kb });
  have.add(title);
  added++; total += kb;
  console.log("+" + slugName + " :: " + title + " (" + kb + " KB)");
}
cat.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(CATALOG, JSON.stringify(cat, null, 2), "utf8");
console.log("--- added", added, "games,", total, "KB; catalog total:", cat.length);
