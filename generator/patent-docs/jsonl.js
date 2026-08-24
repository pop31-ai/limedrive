"use strict";

const DEFAULT_REGISTRY_PATH = "registry/fixations.jsonl";
const GENESIS_SEAL = "LIMEDRIVE-REGISTRY-GENESIS";

let sha256HexRef =
  typeof module !== "undefined" && module.exports
    ? require("./hash").sha256Hex
    : null;
let canonicalizeRef =
  typeof module !== "undefined" && module.exports
    ? require("./hash").canonicalize
    : null;

function ensureHash() {
  if (!sha256HexRef && typeof globalThis !== "undefined" && globalThis.LimeHash) {
    sha256HexRef = globalThis.LimeHash.sha256Hex;
    canonicalizeRef = globalThis.LimeHash.canonicalize;
  }
  if (!sha256HexRef || !canonicalizeRef) throw new Error("hash provider unavailable");
}

function normalizeRecord(rec) {
  return {
    sha256: String(rec.sha256 || ""),
    title: String(rec.title || ""),
    author: String(rec.author || "[АВТОР]"),
    engineVersion: String(rec.engineVersion || "1.0.0"),
    origin: rec.origin || "manual",
    fixedAt: String(rec.fixedAt || new Date().toISOString())
  };
}

function dupeKey(rec) {
  return rec.sha256 + "|" + rec.fixedAt + "|" + rec.author;
}

function rebuildChain(records) {
  ensureHash();
  const seen = new Set();
  const unique = [];
  for (const raw of records) {
    const rec = normalizeRecord(raw);
    const key = dupeKey(rec);
    if (seen.has(key)) continue;
    if (!/^[0-9a-f]{64}$/.test(rec.sha256)) continue;
    seen.add(key);
    unique.push(rec);
  }
  unique.sort((a, b) => String(a.fixedAt).localeCompare(String(b.fixedAt)) || a.sha256.localeCompare(b.sha256));
  let seal = GENESIS_SEAL;
  return unique.map(rec => {
    seal = sha256HexRef(seal + canonicalizeRef(rec));
    return JSON.stringify(Object.assign({}, rec, { seal }));
  });
}

function parseChain(text) {
  const lines = String(text || "").split(/\r?\n/).filter(l => l.trim().length > 0);
  const errors = [];
  const records = [];
  let expected = GENESIS_SEAL;
  lines.forEach((line, idx) => {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch (e) {
      errors.push("line " + (idx + 1) + ": invalid JSON");
      return;
    }
    const seal = obj.seal;
    const body = Object.assign({}, obj);
    delete body.seal;
    ensureHash();
    const expect = sha256HexRef(expected + canonicalizeRef(body));
    if (expect !== seal) {
      errors.push("line " + (idx + 1) + ": seal mismatch (chain broken)");
    }
    if (!/^[0-9a-f]{64}$/.test(String(obj.sha256))) {
      errors.push("line " + (idx + 1) + ": bad sha256");
    }
    if (!(obj.fixedAt && !isNaN(Date.parse(obj.fixedAt)))) {
      errors.push("line " + (idx + 1) + ": bad fixedAt");
    }
    expected = seal || expected;
    records.push(body);
  });
  return { records, errors, count: lines.length, lastSeal: expected };
}

function verifyChainText(text) {
  const res = parseChain(text);
  return { ok: res.errors.length === 0, errors: res.errors, count: res.count, lastSeal: res.lastSeal };
}

function mergeRecordLists(listA, listB) {
  return rebuildChain((listA || []).concat(listB || []));
}

const LimeJsonl = {
  DEFAULT_REGISTRY_PATH,
  GENESIS_SEAL,
  normalizeRecord,
  dupeKey,
  rebuildChain,
  parseChain,
  verifyChainText,
  mergeRecordLists
};

if (typeof module !== "undefined" && module.exports) module.exports = LimeJsonl;
if (typeof globalThis !== "undefined") globalThis.LimeJsonl = LimeJsonl;
