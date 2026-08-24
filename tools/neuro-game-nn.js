#!/usr/bin/env node
"use strict";
/*
 * neuro-game-nn — маленькая нейросеть (MLP, чистый JS, без зависимостей).
 * Train:     учится определять жанр игры по распределению сущностей уровня.
 * Generate:  по жанру — центроид + шум -> черновик уровня (_neuro-draft-*.json).
 *
 * Usage:
 *   node tools/neuro-game-nn.js train
 *   node tools/neuro-game-nn.js generate platformer
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "examples");

const VOCAB = ["platform", "enemy", "boss", "pickup", "collectible", "powerup",
  "hazard", "decoration", "trigger", "checkpoint", "finish", "moving_platform",
  "spawn_point", "portal", "other"];
const GENRES = ["platformer", "shooter", "rpg", "puzzle", "racing",
  "turn-based-strategy", "endless-runner"];

// ---------- data ----------
function loadSamples() {
  const X = [], Y = [], files = [];
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).sort()) {
    let g;
    try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8").replace(/^\uFEFF/, "")); } catch { continue; }
    const gi = GENRES.indexOf(g.type);
    if (gi < 0) continue;
    for (const lvl of g.levels || []) {
      const counts = new Array(VOCAB.length).fill(0);
      let total = 0;
      for (const e of lvl.entities || []) {
        const i = VOCAB.indexOf(e.type);
        counts[i >= 0 ? i : VOCAB.length - 1]++;
        total++;
      }
      if (total < 5) continue;
      X.push(counts.map(c => c / total));
      Y.push(gi);
      files.push(f);
    }
  }
  return { X, Y, files };
}

// ---------- MLP ----------
function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

class MLP {
  constructor(nin, nh, nout) {
    this.W1 = Array.from({ length: nh }, () => Array.from({ length: nin }, () => randn() * 0.3));
    this.b1 = new Array(nh).fill(0);
    this.W2 = Array.from({ length: nout }, () => Array.from({ length: nh }, () => randn() * 0.3));
    this.b2 = new Array(nout).fill(0);
  }
  forward(x) {
    this.h = this.W1.map((row, j) => Math.tanh(row.reduce((s, w, i) => s + w * x[i], this.b1[j])));
    const z = this.W2.map((row, k) => row.reduce((s, w, j) => s + w * this.h[j], this.b2[k]));
    const m = Math.max(...z);
    const ex = z.map(v => Math.exp(v - m));
    const sum = ex.reduce((a, b) => a + b, 0);
    this.p = ex.map(v => v / sum);
    return this.p;
  }
  trainSample(x, label, lr) {
    const p = this.forward(x);
    const dz = p.map((v, k) => v - (k === label ? 1 : 0));
    for (let k = 0; k < this.W2.length; k++) {
      for (let j = 0; j < this.h.length; j++) this.W2[k][j] -= lr * dz[k] * this.h[j];
      this.b2[k] -= lr * dz[k];
    }
    const dh = new Array(this.h.length).fill(0);
    for (let k = 0; k < this.W2.length; k++)
      for (let j = 0; j < this.h.length; j++) dh[j] += this.W2[k][j] * dz[k];
    for (let j = 0; j < this.h.length; j++) {
      const g = dh[j] * (1 - this.h[j] * this.h[j]);
      for (let i = 0; i < x.length; i++) this.W1[j][i] -= lr * g * x[i];
      this.b1[j] -= lr * g;
    }
    return -Math.log(Math.max(1e-9, p[label]));
  }
}

// ---------- generation ----------
function centroidFor(X, Y, gi) {
  const cls = X.filter((_, i) => Y[i] === gi);
  if (!cls.length) return null;
  return cls[0].map((_, d) => cls.reduce((s, v) => s + v[d], 0) / cls.length);
}

function buildDraft(genre, feat) {
  const c = {};
  VOCAB.forEach((t, i) => c[t] = Math.max(0, Math.round(feat[i] * 70)));
  const W = 3840, H = 1080, groundY = H - 100;
  const ents = [];
  ents.push({ id: "hero_1", type: "hero", x: 120, y: groundY - 64, width: 48, height: 64,
    color: "#8BC34A", health: 100, speed: 5, components: ["PlayerInput"], properties: { jumps: 2 } });
  ents.push({ id: "spawn_1", type: "spawn_point", x: 120, y: groundY - 32, width: 32, height: 32, color: "#FFD700", properties: {} });
  // ground segments
  const segs = Math.max(3, c.platform);
  for (let i = 0; i < segs; i++) {
    const w = Math.floor((W - 200) / segs) - 60;
    ents.push({ id: `ground_${i}`, type: "platform", x: 100 + i * Math.floor((W - 200) / segs),
      y: groundY, width: w, height: 100, color: "#4a7c3f", properties: { surface: "grass" } });
  }
  // floating platforms
  for (let i = 0; i < Math.min(8, c.platform); i++) {
    ents.push({ id: `plat_${i}`, type: "platform", x: 300 + i * 380 + ((i * 97) % 120),
      y: groundY - 140 - ((i * 73) % 180), width: 160, height: 28, color: "#6b4226", properties: {} });
  }
  for (let i = 0; i < c.moving_platform; i++) {
    ents.push({ id: `mplat_${i}`, type: "moving_platform", x: 500 + i * 500, y: groundY - 200,
      width: 120, height: 24, color: "#9c7b4d", speed: 2,
      properties: { axis: i % 2 ? "vertical" : "horizontal", range: 120 } });
  }
  for (let i = 0; i < c.enemy; i++) {
    ents.push({ id: `enemy_${i}`, type: "enemy", x: 400 + i * 420, y: groundY - 40, width: 40, height: 40,
      color: "#e53935", health: 30, damage: 10, speed: 2,
      components: ["EnemyAI", "Patrol"], properties: { patrolRange: 120, direction: i % 2 ? 1 : -1 } });
  }
  for (let i = 0; i < c.boss; i++) {
    ents.push({ id: `boss_${i}`, type: "boss", x: W - 300, y: groundY - 80, width: 80, height: 80,
      color: "#b71c1c", health: 250, damage: 20, components: ["BossAI"], properties: {} });
  }
  for (let i = 0; i < c.pickup; i++) {
    ents.push({ id: `coin_${i}`, type: "pickup", x: 260 + i * 240, y: groundY - 60 - ((i * 53) % 140),
      width: 22, height: 22, color: "#FFD700", components: ["Pickup"], properties: { pickupType: "coin", value: 10 } });
  }
  for (let i = 0; i < c.hazard; i++) {
    ents.push({ id: `haz_${i}`, type: "hazard", x: 600 + i * 520, y: groundY - 30, width: 44, height: 30,
      color: "#ff7043", damage: 20, properties: {} });
  }
  for (let i = 0; i < c.checkpoint; i++) {
    ents.push({ id: `cp_${i}`, type: "checkpoint", x: 900 + i * 1200, y: groundY - 60, width: 30, height: 60,
      color: "#4FC3F7", components: ["Checkpoint"], properties: {} });
  }
  for (let i = 0; i < c.decoration; i++) {
    ents.push({ id: `dec_${i}`, type: "decoration", x: (i * 331) % (W - 100), y: groundY - 220 - ((i * 47) % 200),
      width: 60, height: 60, color: "rgba(255,255,255,0.15)", properties: { parallaxLayer: -1 } });
  }
  ents.push({ id: "finish_1", type: "finish", x: W - 140, y: groundY - 80, width: 48, height: 80,
    color: "#FFD700", components: ["Goal"], properties: { nextLevel: -1 } });

  return {
    name: `Neuro Draft — ${genre}`,
    version: "0.1",
    type: genre === "endless-runner" ? "endless-runner" : genre,
    description: `Черновик уровня, сгенерированный нейросетью (MLP 15-16-7) по центроиду жанра «${genre}».`,
    author: "neuro-game-nn",
    settings: { gravity: 1, friction: 0.82, airResistance: 0.05, jumpForce: 16, maxSpeed: 7,
      worldWidth: W, worldHeight: H, theme: "forest" },
    levels: [{ name: "Neuro Level 1", timeLimit: 180, par: 5,
      background: { type: "gradient", colors: ["#1a5c2a", "#2d8a4e", "#87CEEB"] },
      entities: ents }],
    cameras: [{ type: "follow", target: "hero", smooth: 0.08, offset: { x: 0, y: -150 } }],
    ai: { globalDifficulty: "medium", adaptToPlayer: true }
  };
}

// ---------- main ----------
const mode = process.argv[2] || "train";
const { X, Y } = loadSamples();
console.log(`samples: ${X.length} levels from ${new Set(Y).size} genres`);

const nn = new MLP(VOCAB.length, 16, GENRES.length);
const EPOCHS = 400;
for (let ep = 0; ep < EPOCHS; ep++) {
  let loss = 0;
  for (let i = 0; i < X.length; i++) loss += nn.trainSample(X[i], Y[i], 0.08);
  if ((ep + 1) % 100 === 0) console.log(`epoch ${ep + 1}: loss ${ (loss / X.length).toFixed(3) }`);
}
let correct = 0;
for (let i = 0; i < X.length; i++) {
  const p = nn.forward(X[i]);
  if (p.indexOf(Math.max(...p)) === Y[i]) correct++;
}
console.log(`train accuracy: ${correct}/${X.length} (${Math.round(correct / X.length * 100)}%)`);

if (mode === "generate") {
  const genre = process.argv[3] || "platformer";
  const gi = GENRES.indexOf(genre);
  if (gi < 0) { console.log("unknown genre:", genre, "— available:", GENRES.join(", ")); process.exit(1); }
  const cen = centroidFor(X, Y, gi);
  const noisy = cen.map(v => Math.max(0, v + randn() * 0.02));
  const draft = buildDraft(genre, noisy);
  const out = path.join(DIR, `_neuro-draft-${genre}.json`);
  fs.writeFileSync(out, JSON.stringify(draft, null, 2), "utf8");
  console.log(`draft written: ${path.relative(ROOT, out)} (${draft.levels[0].entities.length} entities)`);
  // prove structural validity via the project's validator
  const { validateGame } = require("./validate");
  const rep = validateGame(out);
  console.log(`validator: ${rep.ok ? "PASS" : "FAIL"} (E:${rep.errors.length} W:${rep.warnings.length})`);
  rep.errors.slice(0, 5).forEach(e => console.log("  ERROR", e));
}
