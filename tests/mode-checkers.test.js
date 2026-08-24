"use strict";
/* Checkers test: mandatory jump capture, chain lock off, promotion to damka. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-checkers.json";

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
  await page.goto(`http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(GAME)}`, { waitUntil: "networkidle2" });
  await sleep(1400);

  // board geometry: cell 80, board centered
  const BX = 320, BY = 80;
  async function clickCell(gx, gy) {
    await page.mouse.click(BX + gx * 80 + 40, BY + gy * 80 + 40);
    await sleep(250);
  }
  const dbg = () => page.evaluate(() => LimeDriveDebug());

  let d = await dbg();
  check("chess mode", d.mode === "chess");
  check("pieces 3v3", d.chess.playerPieces === 3 && d.chess.enemyPieces === 3);

  // select P1 (2,2): mandatory jump over e1(3,3) -> (4,4). valid must be exactly 1 capture
  await clickCell(2, 2);
  d = await dbg();
  check("mandatory capture filter: only jump offered", d.chess.valid === 1 && d.chess.chainLock === false);

  // execute jump
  await clickCell(4, 4);
  await sleep(600);
  d = await dbg();
  check("enemy captured by jump", d.chess.enemyPieces === 2);

  // wait for AI move
  await sleep(1600);
  d = await dbg();
  check("turn returned to player", d.chess.turn === "player");

  // promotion: select P3 (6,6), move to (7,7)
  await clickCell(6, 6);
  d = await dbg();
  check("P3 has moves", d.chess.valid >= 1);
  await clickCell(7, 7);
  await sleep(600);
  await sleep(1600);
  d = await dbg();
  check("promoted to damka", d.chess.damkas >= 1);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
