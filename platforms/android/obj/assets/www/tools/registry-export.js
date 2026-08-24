"use strict";

const fs = require("fs");
const path = require("path");
const Jsonl = require("../generator/patent-docs/jsonl");
const { canonicalize, sha256Hex } = require("../generator/patent-docs/hash");

function arg(name, def) {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

function readChain(regPath) {
  if (!fs.existsSync(regPath)) return [];
  return Jsonl.parseChain(fs.readFileSync(regPath, "utf8")).records;
}

function writeChain(regPath, records) {
  const lines = Jsonl.rebuildChain(records);
  fs.mkdirSync(path.dirname(path.resolve(regPath)), { recursive: true });
  fs.writeFileSync(path.resolve(regPath), lines.join("\n") + (lines.length ? "\n" : ""), "utf8");
  return lines.length;
}

function main() {
  const cmd = process.argv[2];
  const regPath = arg("registry", Jsonl.DEFAULT_REGISTRY_PATH);

  if (cmd === "verify") {
    const file = process.argv[3] || regPath;
    if (!fs.existsSync(file)) {
      console.log("EMPTY " + file + " (no chain yet) -> OK");
      return;
    }
    const res = Jsonl.verifyChainText(fs.readFileSync(file, "utf8"));
    console.log((res.ok ? "OK" : "CORRUPT") + " " + file + " · records: " + res.count);
    res.errors.forEach(e => console.log("  ! " + e));
    process.exit(res.ok ? 0 : 1);
  }

  if (cmd === "add") {
    const input = process.argv[3];
    if (!input || input.startsWith("--")) {
      console.error("usage: node tools/registry-export.js add <game.json> [--title T] [--author A] [--method M] [--registry P]");
      process.exit(1);
    }
    const game = JSON.parse(fs.readFileSync(path.resolve(input), "utf8"));
    const rec = {
      sha256: sha256Hex(canonicalize(game)),
      title: arg("title", game.name || path.basename(input, ".json")),
      author: arg("author", "[АВТОР]"),
      engineVersion: JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8")).version || "1.0.0",
      origin: arg("method", "manual"),
      fixedAt: new Date().toISOString()
    };
    const existing = readChain(regPath);
    const key = Jsonl.dupeKey(rec);
    if (existing.some(r => Jsonl.dupeKey(Jsonl.normalizeRecord(r)) === key)) {
      console.log("DUPLICATE skipped: " + key);
      return;
    }
    const total = writeChain(regPath, existing.concat([rec]));
    console.log("FIXED " + rec.sha256.slice(0, 16) + "… «" + rec.title + "» by " + rec.author);
    console.log("chain size: " + total + " · registry: " + regPath);
    console.log("next: git commit + push/PR — дата коммита подтверждает приоритет");
    return;
  }

  if (cmd === "import-browser") {
    const dumpPath = process.argv[3];
    if (!dumpPath || dumpPath.startsWith("--")) {
      console.error("usage: node tools/registry-export.js import-browser <dump.json> [--registry P]");
      console.error("dump.json — это exportState() из localStorage браузера (кнопка/скрипт экспорта)");
      process.exit(1);
    }
    const dump = JSON.parse(fs.readFileSync(path.resolve(dumpPath), "utf8"));
    const records = Array.isArray(dump) ? dump : dump.records;
    if (!Array.isArray(records)) {
      console.error("bad dump shape: expected {records:[...]} or [...]");
      process.exit(1);
    }
    const merged = Jsonl.mergeRecordLists(readChain(regPath), records.map(r => ({
      sha256: r.sha256,
      title: r.title,
      author: r.author,
      engineVersion: r.engineVersion,
      origin: "browser",
      fixedAt: r.fixedAt
    })));
    const total = writeChain(regPath, merged);
    console.log("MERGED · chain size: " + total);
    return;
  }

  console.error("commands: verify [file] | add <game.json> | import-browser <dump.json>");
  console.error("options: --author NAME --title T --method M --registry PATH");
  process.exit(1);
}

main();
