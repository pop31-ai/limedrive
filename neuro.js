/* LimeDrive Neuro — browser runtime for the level draft generator.
 * Weights: neuro-weights.json (trained offline by tools/neuro-game-nn.js export).
 * Usage: NeuroGen.generate("platformer") -> draft game JSON.
 */
(function () {
  "use strict";
  var W = null; // weights

  function mulberry32(state) {
    return function () {
      state |= 0; state = state + 0x6D2B79F5 | 0;
      var t = Math.imul(state ^ state >>> 15, 1 | state);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function load() {
    if (W) return Promise.resolve(W);
    return fetch("neuro-weights.json").then(function (r) { return r.json(); }).then(function (j) {
      W = j;
      return W;
    });
  }

  function forward(x) {
    var h = W.W1.map(function (row, j) {
      var s = W.b1[j];
      for (var i = 0; i < row.length; i++) s += row[i] * x[i];
      return Math.tanh(s);
    });
    var z = W.W2.map(function (row, k) {
      var s = W.b2[k];
      for (var j = 0; j < row.length; j++) s += row[j] * h[j];
      return s;
    });
    var m = Math.max.apply(null, z);
    var ex = z.map(function (v) { return Math.exp(v - m); });
    var sum = ex.reduce(function (a, b) { return a + b; }, 0);
    return ex.map(function (v) { return v / sum; });
  }

  function polyColor(rnd, l) {
    // полиарт: каждый персонаж — свой яркий оттенок
    var h = Math.floor(rnd() * 360);
    return "hsl(" + h + ", 75%, " + (l || 58) + "%)";
  }

  function buildDraft(genre, feat, rnd) {
    var c = {};
    W.vocab.forEach(function (t, i) { c[t] = Math.max(0, Math.round(feat[i] * 70)); });
    var Wd = 3840, H = 1080, groundY = H - 100;
    var ents = [];
    var heroCol = polyColor(rnd, 62);
    ents.push({ id: "hero_1", type: "hero", x: 120, y: groundY - 64, width: 48, height: 64,
      color: heroCol, health: 100, speed: 5, components: ["PlayerInput"], properties: { jumps: 2 } });
    ents.push({ id: "spawn_1", type: "spawn_point", x: 120, y: groundY - 32, width: 32, height: 32, color: heroCol, properties: {} });
    var groundCols = ["#4a7c3f", "#3f6b7c", "#7c6b3f", "#6b3f7c"];
    var segs = Math.max(3, c.platform);
    for (var i = 0; i < segs; i++) {
      var w = Math.floor((Wd - 200) / segs) - 60;
      ents.push({ id: "ground_" + i, type: "platform", x: 100 + i * Math.floor((Wd - 200) / segs),
        y: groundY, width: w, height: 100, color: groundCols[i % groundCols.length], properties: { surface: "grass" } });
    }
    for (i = 0; i < Math.min(8, c.platform); i++) {
      ents.push({ id: "plat_" + i, type: "platform", x: 300 + i * 380 + ((i * 97) % 120),
        y: groundY - 140 - ((i * 73) % 180), width: 160, height: 28, color: polyColor(rnd, 42), properties: {} });
    }
    for (i = 0; i < c.moving_platform; i++) {
      ents.push({ id: "mplat_" + i, type: "moving_platform", x: 500 + i * 500, y: groundY - 200,
        width: 120, height: 24, color: polyColor(rnd, 48), speed: 2,
        properties: { axis: i % 2 ? "vertical" : "horizontal", range: 120 } });
    }
    for (i = 0; i < c.enemy; i++) {
      ents.push({ id: "enemy_" + i, type: "enemy", x: 400 + i * 420, y: groundY - 40, width: 40, height: 40,
        color: polyColor(rnd, 55), health: 30, damage: 10, speed: 2,
        components: ["EnemyAI", "Patrol"], properties: { patrolRange: 120, direction: i % 2 ? 1 : -1 } });
    }
    for (i = 0; i < c.boss; i++) {
      ents.push({ id: "boss_" + i, type: "boss", x: Wd - 300, y: groundY - 80, width: 80, height: 80,
        color: polyColor(rnd, 45), health: 250, damage: 20, components: ["BossAI"], properties: {} });
    }
    for (i = 0; i < c.pickup; i++) {
      ents.push({ id: "coin_" + i, type: "pickup", x: 260 + i * 240, y: groundY - 60 - ((i * 53) % 140),
        width: 22, height: 22, color: "hsl(" + ((i * 47) % 360) + ", 85%, 62%)", components: ["Pickup"], properties: { pickupType: "coin", value: 10 } });
    }
    for (i = 0; i < c.hazard; i++) {
      ents.push({ id: "haz_" + i, type: "hazard", x: 600 + i * 520, y: groundY - 30, width: 44, height: 30,
        color: "hsl(" + (10 + ((i * 37) % 40)) + ", 80%, 55%)", damage: 20, properties: {} });
    }
    for (i = 0; i < c.checkpoint; i++) {
      ents.push({ id: "cp_" + i, type: "checkpoint", x: 900 + i * 1200, y: groundY - 60, width: 30, height: 60,
        color: "hsl(" + ((i * 67 + 170) % 360) + ", 80%, 60%)", components: ["Checkpoint"], properties: {} });
    }
    for (i = 0; i < c.decoration; i++) {
      ents.push({ id: "dec_" + i, type: "decoration", x: (i * 331) % (Wd - 100), y: groundY - 220 - ((i * 47) % 200),
        width: 60, height: 60, color: "hsl(" + ((i * 91) % 360) + ", 60%, 45%)", properties: { parallaxLayer: -1 } });
    }
    ents.push({ id: "finish_1", type: "finish", x: Wd - 140, y: groundY - 80, width: 48, height: 80,
      color: "#FFD700", components: ["Goal"], properties: { nextLevel: -1 } });
    return {
      name: "Neuro Draft — " + genre,
      version: "0.1",
      type: genre,
      description: "Уровень сгенерирован нейросетью LimeDrive на устройстве.",
      author: "neuro",
      settings: { gravity: 1, friction: 0.82, airResistance: 0.05, jumpForce: 16, maxSpeed: 7,
        worldWidth: Wd, worldHeight: H, theme: "forest" },
      levels: [{ name: "Neuro Level", timeLimit: 180, par: 5,
        background: { type: "gradient", colors: ["#1a5c2a", "#2d8a4e", "#87CEEB"] },
        entities: ents }],
      cameras: [{ type: "follow", target: "hero", smooth: 0.08, offset: { x: 0, y: -150 } }],
      ai: { globalDifficulty: "medium", adaptToPlayer: true }
    };
  }

  window.NeuroGen = {
    ready: load,
    genres: function () { return W ? W.genres.filter(function (g) { return g !== "turn-based-strategy"; }) : []; },
    generate: function (genre, seed) {
      if (!W) throw new Error("NeuroGen not loaded — call ready() first");
      var gi = W.genres.indexOf(genre);
      if (gi < 0) gi = 0;
      var cen = W.centroids[genre] || W.centroids[W.genres[0]];
      var rnd = mulberry32(seed || (Date.now() & 0xffffffff));
      var feat = cen.map(function (v) { return Math.max(0, v + (rnd() * 2 - 1) * 0.02); });
      return buildDraft(genre, feat, rnd);
    }
  };
})();
