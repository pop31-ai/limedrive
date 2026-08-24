"use strict";
/* Mirror chess: 3 isolated scenarios (page reloaded between) — counter, closed mirror, king victory. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-mirror.json";

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  fs.readFile(path.join(ROOT, u.slice(1)), (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": u.endsWith(".json") ? "application/json" : "text/html" });
    res.end(d);
  });
});
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
let failed = 0;
function check(name, cond) { console.log((cond ? "PASS" : "FAIL") + " " + name); if (!cond) failed++; }

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("pageerror", e => { console.log("[pageerror]", e.message); failed++; });
  await page.setViewport({ width: 1280, height: 800 });
  const BX = 320, BY = 80;
  async function cc(gx, gy) { await page.mouse.click(BX + gx * 80 + 40, BY + gy * 80 + 40); await sleep(250); }
  const dbg = () => page.evaluate(() => LimeDriveDebug());
  async function wpt() { for (let i = 0; i < 30; i++) { const d = await dbg(); if (d.chess.turn === "player") return d; await sleep(150); } return dbg(); }
  async function load() {
    await page.goto(`http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(GAME)}&_r=${Math.random()}`, { waitUntil: "networkidle2" });
    await sleep(1300);
  }
  const hpOf = (d, x, y) => { const p = (d.chess.pieces || []).find(q => q.x === x && q.y === y); return p ? p.hp : null; };

  // S1: rook captures queen; mirror (1,3) empty; queen ghost strikes down column -> counter
  await load();
  await wpt();
  await cc(6, 0);
  await cc(6, 3);
  await sleep(600);
  let d = await dbg();
  check("S1 ghost counter: rook hp 3->2 at (6,3)", hpOf(d, 6, 3) === 2);

  // S2: knight captures rook; mirror (4,3) blocked by own knight2 -> no counter
  await load();
  await wpt();
  await cc(5, 2);
  await cc(3, 3);
  await sleep(600);
  d = await dbg();
  check("S2 closed mirror: knight hp stays 2", hpOf(d, 3, 3) === 2);

  // S3: move blocker knight away, then rook takes king -> victory
  await load();
  await wpt();
  await cc(4, 3);   // select knight2 blocker
  await cc(3, 1);   // move it off column 4
  await wpt();
  await cc(4, 1);   // select rook C
  d = await dbg();
  const kT = (d.chess.targets || []).find(t => t.capture && t.y === 7);
  check("S3 king capture offered", !!kT);
  if (kT) {
    await cc(kT.x, kT.y);
    await sleep(1800);
    d = await dbg();
    check("S3 victory via king capture", d.gameState === "victory");
  }

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
