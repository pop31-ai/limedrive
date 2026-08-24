#!/usr/bin/env node
/*
 * LimeDrive game JSON validator.
 * Validates every examples/*.json against the format consumed by examples/player.html
 * (see PROMPT.md). Exit code 1 if any errors found; warnings alone pass.
 *
 * Usage:
 *   node tools/validate.js                 # validate all examples/*.json
 *   node tools/validate.js path/to.json    # validate specific file(s)
 *   node tools/validate.js --strict        # treat warnings as errors
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const EXAMPLES_DIR = path.join(ROOT, "examples");

const GAME_TYPES = new Set([
  "platformer", "puzzle", "shooter", "rpg", "racing", "turn-based-strategy",
  "endless-runner"
]);

// Types observed across shipped examples + documented in PROMPT.md.
const ENTITY_TYPES = new Set([
  "hero", "player", "enemy", "platform", "pickup", "collectible", "powerup",
  "decoration", "trigger", "spawn_point", "boss", "projectile",
  "moving_platform", "checkpoint", "finish", "portal", "hazard",
  "grid", "piece", "boundary", "effect", "highlight", "ui", "zone"
]);

const HERO_TYPES = new Set(["hero", "player"]);
const CHESS_GAME = "turn-based-strategy";
const CHESS_PIECE_TYPES = new Set(["king", "queen", "rook", "bishop", "knight", "pawn",
  "checker", "damka", "fighter", "elemental", "core"]);
const NUMERIC_SETTINGS = ["gravity", "friction", "airResistance", "jumpForce", "maxSpeed"];

function isHexColor(v) {
  return typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v);
}

function isValidColorValue(v) {
  if (typeof v !== "string") return false;
  const s = v.trim().toLowerCase();
  return isHexColor(s) || ["hsl(", "hsla(", "rgb(", "rgba("].some(p => s.startsWith(p));
}

class Report {
  constructor(file) { this.file = file; this.errors = []; this.warnings = []; }
  err(msg, where) { this.errors.push(`${where ? where + ": " : ""}${msg}`); }
  warn(msg, where) { this.warnings.push(`${where ? where + ": " : ""}${msg}`); }
  get ok() { return this.errors.length === 0; }
}

function validateGame(filePath) {
  const rep = new Report(path.relative(ROOT, filePath));
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    rep.err(`cannot read file: ${e.message}`);
    return rep;
  }

  // BOM check (bit a real bug before — commit 5b64740).
  if (raw.charCodeAt(0) === 0xfeff) {
    rep.warn("file starts with UTF-8 BOM (breaks some JSON parsers)");
  }

  let g;
  try {
    g = JSON.parse(raw);
  } catch (e) {
    rep.err(`invalid JSON: ${e.message}`);
    return rep;
  }

  const gameType = g.type;

  // --- top level ---
  if (typeof g.name !== "string" || !g.name.trim()) rep.err('missing "name"');
  if (typeof g.version !== "string" || !g.version.trim()) rep.warn('missing "version"');
  if (!GAME_TYPES.has(gameType)) {
    rep.err(`unknown type "${gameType}" (expected one of: ${[...GAME_TYPES].join(", ")})`);
  } else {
    rep.warn; // no-op, keeps structure symmetric
  }
  if (typeof g.description !== "string" || !g.description.trim()) rep.warn('missing "description"');
  if (typeof g.author !== "string" || !g.author.trim()) rep.warn('missing "author"');

  // --- settings ---
  const st = g.settings;
  if (st === undefined || st === null || typeof st !== "object") {
    rep.err('missing "settings" object');
  } else {
    for (const k of NUMERIC_SETTINGS) {
      if (typeof st[k] !== "number") rep.warn(`settings.${k} is not a number`);
    }
    if (!(Number(st.worldWidth) > 0)) rep.err("settings.worldWidth must be > 0");
    if (!(Number(st.worldHeight) > 0)) rep.err("settings.worldHeight must be > 0");
  }
  const worldW = Number(st && st.worldWidth) || 0;
  const worldH = Number(st && st.worldHeight) || 0;

  // --- levels ---
  if (!Array.isArray(g.levels) || g.levels.length === 0) {
    rep.err('"levels" must be a non-empty array');
    return rep;
  }
  if (gameType !== CHESS_GAME && g.levels.length < 2) {
    rep.warn("fewer than 3 levels (PROMPT.md recommends >= 3)");
  }

  g.levels.forEach((lvl, li) => {
    const where = `level[${li}]`;
    if (!lvl || typeof lvl !== "object") { rep.err("level is not an object", where); return; }
    const lname = lvl.name || `#${li}`;
    const w = `${where} ("${lname}")`;

    if (typeof lvl.name !== "string" || !lvl.name.trim()) rep.warn('missing "name"', w);

    const bg = lvl.background;
    if (bg !== undefined) {
      if (!bg || bg.type !== "gradient" || !Array.isArray(bg.colors)) {
        rep.warn('background should be {"type":"gradient","colors":[...]}', w);
      } else {
        bg.colors.forEach((c, ci) => {
          if (!isValidColorValue(c)) rep.err(`background.colors[${ci}] is not a valid color: ${JSON.stringify(c)}`, w);
        });
      }
    } else {
      rep.warn("no background defined", w);
    }

    if (!Array.isArray(lvl.entities) || lvl.entities.length === 0) {
      rep.err('"entities" must be a non-empty array', w);
      return;
    }

    const seenIds = new Set();
    let heroes = 0, finishes = 0, grids = 0, pieces = 0, aiPieces = 0, playerPieces = 0;

    lvl.entities.forEach((e, ei) => {
      const ew = `${w}, entity[${ei}]`;
      if (!e || typeof e !== "object") { rep.err("entity is not an object", ew); return; }

      if (typeof e.id !== "string" || !e.id.trim()) {
        rep.err('missing "id"', ew);
      } else if (seenIds.has(e.id)) {
        rep.err(`duplicate entity id "${e.id}"`, w);
      } else {
        seenIds.add(e.id);
      }

      if (typeof e.type !== "string" || !ENTITY_TYPES.has(e.type)) {
        rep.err(`unknown entity type ${JSON.stringify(e.type)} (allowed: ${[...ENTITY_TYPES].sort().join(", ")})`, ew);
      }

      for (const k of ["x", "y"]) {
        if (typeof e[k] !== "number") rep.err(`"${k}" must be a number`, ew);
      }
      for (const k of ["width", "height"]) {
        if (!(Number(e[k]) > 0)) rep.err(`"${k}" must be > 0`, ew);
      }

      // Out-of-world coordinates are suspicious but sometimes intentional (parallax decor).
      if (worldW > 0 && worldH > 0 &&
          (e.x < -worldW * 0.5 || e.x > worldW * 1.5 || e.y < -worldH || e.y > worldH * 1.5)) {
        rep.warn(`position (${e.x}, ${e.y}) far outside world ${worldW}x${worldH}`, ew);
      }

      if (e.color !== undefined && !isValidColorValue(e.color)) {
        rep.err(`invalid color value: ${JSON.stringify(e.color)}`, ew);
      }

      if (e.components !== undefined) {
        if (!Array.isArray(e.components) || e.components.some(c => typeof c !== "string")) {
          rep.err('"components" must be an array of strings', ew);
        }
      } else {
        rep.warn("no components array", ew);
      }

      if (e.properties !== undefined && (typeof e.properties !== "object" || Array.isArray(e.properties))) {
        rep.err('"properties" must be an object', ew);
      }
      if (e.health !== undefined && typeof e.health !== "number") rep.err('"health" must be a number', ew);
      if (e.damage !== undefined && typeof e.damage !== "number") rep.err('"damage" must be a number', ew);

      if (HERO_TYPES.has(e.type)) heroes++;
      if (e.type === "finish") finishes++;
      if (e.type === "grid") grids++;
      if (e.type === "piece") {
        pieces++;
        const p = e.properties || {};
        if (!CHESS_PIECE_TYPES.has(p.pieceType)) {
          rep.err(`piece needs properties.pieceType in {${[...CHESS_PIECE_TYPES].join(", ")}}`, ew);
        }
        if (!Array.isArray(e.components) ||
            e.components.some(c => c === "AIControlled")) aiPieces++;
        else if (Array.isArray(e.components) &&
            e.components.some(c => c === "PlayerControlled")) playerPieces++;
        if (typeof p.movePattern !== "string") rep.warn('piece missing properties.movePattern', ew);
        if (typeof p.maxMoveDistance !== "number") rep.warn('piece missing numeric properties.maxMoveDistance', ew);
      }
    });

    // Per-genre structural rules.
    if (gameType === CHESS_GAME) {
      if (grids === 0) rep.err("turn-based-strategy level has no grid entity", w);
      if (pieces < 2) rep.err("chess level needs at least 2 piece entities", w);
      if (aiPieces === 0) rep.err("chess level has no AIControlled pieces", w);
      if (playerPieces === 0) rep.err("chess level has no PlayerControlled pieces", w);
    } else {
      if (heroes === 0) rep.err("no hero/player entity in level", w);
      if (heroes > 1) rep.err(`multiple hero entities (${heroes})`, w);
      if (finishes === 0) rep.warn("no finish entity in level", w);
    }
  });

  return rep;
}

function collectTargets(argv) {
  const files = argv.filter(a => !a.startsWith("--"));
  if (files.length > 0) return files.map(f => path.resolve(f));
  return fs.readdirSync(EXAMPLES_DIR)
    .filter(f => f.endsWith(".json") && !f.startsWith("_"))
    .map(f => path.join(EXAMPLES_DIR, f))
    .sort();
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes("--strict");
  const targets = collectTargets(argv);

  console.log(`LimeDrive validator — ${targets.length} file(s)\n`);

  let failed = 0;
  let totalErrors = 0, totalWarnings = 0;

  for (const t of targets) {
    const rep = validateGame(t);
    totalErrors += rep.errors.length;
    totalWarnings += rep.warnings.length;
    const bad = rep.errors.length > 0 || (strict && rep.warnings.length > 0);
    if (bad) failed++;

    const status = bad ? "FAIL" : "PASS";
    const extra = strict
      ? `E:${rep.errors.length} W:${rep.warnings.length}`
      : `E:${rep.errors.length} W:${rep.warnings.length}`;
    console.log(`[${status}] ${rep.file}  (${extra})`);
    for (const e of rep.errors) console.log(`   ERROR   ${e}`);
    for (const wn of rep.warnings) console.log(`   warning ${wn}`);
  }

  console.log(`\nSummary: ${targets.length} file(s), ` +
    `${failed} failed, ${totalErrors} error(s), ${totalWarnings} warning(s)` +
    (strict ? " [strict mode: warnings count as failures]" : ""));

  process.exit(failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { validateGame, GAME_TYPES, ENTITY_TYPES };
