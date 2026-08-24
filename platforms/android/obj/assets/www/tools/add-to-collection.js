"use strict";

const fs = require("fs");
const path = require("path");
const { canonicalize, sha256Hex } = require("../generator/patent-docs/hash");

function arg(name, def) {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

function slugify(name) {
  return String(name || "game").replace(/[^\wа-яё]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase() || "game";
}

const input = process.argv[2];
if (!input || input.startsWith("--")) {
  console.error("usage: node tools/add-to-collection.js <game.json> --author NAME [--method generator|manual|hybrid] [--force]");
  process.exit(1);
}

const gamePath = path.resolve(input);
const game = JSON.parse(fs.readFileSync(gamePath, "utf8"));
const title = game.name || path.basename(gamePath, ".json");
const dir = path.join(path.resolve("games"), slugify(title));

if (fs.existsSync(dir) && !process.argv.includes("--force")) {
  console.error("already exists: " + dir + " (use --force to overwrite)");
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

const engineVersion = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8")).version || "1.0.0";
const sha256 = sha256Hex(canonicalize(game));
const now = new Date();

fs.writeFileSync(path.join(dir, "game.json"), JSON.stringify(game, null, 2) + "\n", "utf8");

const meta = {
  title,
  author: arg("author", "[УКАЖИТЕ АВТОРА]"),
  date: now.toISOString().slice(0, 10),
  engineVersion,
  origin: {
    method: arg("method", "manual"),
    prompts: [
      { text: "(история промптов не сохранялась при создании; фиксируйте промпты в следующих генерациях)", iteration: 1 }
    ],
    manualEdits: []
  },
  fixation: {
    sha256,
    fixedAt: now.toISOString(),
    evmRegistration: { filed: false, certNumber: null }
  },
  rights: "Творческий вклад принадлежит автору. Совпадение результатов генератора у разных пользователей не является нарушением (см. docs/legal/04)."
};

fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n", "utf8");

console.log("OK " + dir);
console.log("sha256: " + sha256);
console.log("fixedAt: " + meta.fixation.fixedAt);
