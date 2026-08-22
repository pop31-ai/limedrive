"use strict";
/* Shooter mechanics test: move, shoot, kill formation, level clear -> victory. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-shooter.json";

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
  await sleep(1200);

  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("mode is shooter", dbg.mode === "shooter");

  // movement: hold ArrowLeft, hero x must decrease
  const x0 = dbg.heroPos.x;
  await page.keyboard.down("ArrowLeft");
  await sleep(500);
  await page.keyboard.up("ArrowLeft");
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("hero moves left", dbg.heroPos.x < x0 - 40);

  // hold fire; park under enemy columns (poll-based, deterministic)
  await page.keyboard.down("Space");
  let cleared = false;
  const t0 = Date.now();
  async function driveTo(targetX, key, maxMs) {
    await page.keyboard.down(key);
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      await sleep(80);
      dbg = await page.evaluate(() => LimeDriveDebug());
      if (dbg.gameState !== "playing" || dbg.score >= 60) break;
      if (key === "ArrowLeft" ? dbg.heroPos.x <= targetX : dbg.heroPos.x >= targetX) break;
    }
    await page.keyboard.up(key);
  }
  while (Date.now() - t0 < 20000) {
    if (dbg.score >= 60 || dbg.gameState !== "playing") { cleared = true; break; }
    await driveTo(180, "ArrowLeft", 2500);   // under en_1 (ox=200)
    if (dbg.score >= 60 || dbg.gameState !== "playing") { cleared = true; break; }
    await driveTo(420, "ArrowRight", 2500);  // under en_2 (ox=400)
    if (dbg.score >= 60 || dbg.gameState !== "playing") { cleared = true; break; }
  }
  await page.keyboard.up("Space");
  console.log("final:", JSON.stringify(dbg.sh), "score=" + dbg.score, "state=" + dbg.gameState);
  check("level cleared via shooting", cleared && (dbg.gameState === "victory" || dbg.score >= 60));
  check("kills counted", dbg.score >= 60);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
