"use strict";
/* Tower Defense mechanics test: build tower -> wave kills -> victory. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-td.json";

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
function check(name, cond) {
  console.log((cond ? "PASS" : "FAIL") + " " + name);
  if (!cond) failed++;
}

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("pageerror", e => { console.log("[pageerror]", e.message); failed++; });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(GAME)}`, { waitUntil: "networkidle2" });
  await sleep(1200);

  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("mode is td", dbg.mode === "td");
  check("gold loaded (100)", dbg.td.gold === 100);
  check("lives loaded (5)", dbg.td.lives === 5);
  check("wave pending in intermission", dbg.td.wave === 0 && dbg.td.intermission > 0);

  // skip countdown
  await page.keyboard.press("Space");
  await sleep(400);

  // build arrow tower on slot at (350,120)+24
  dbg = await page.evaluate(() => LimeDriveDebug());
  if (dbg.td.intermission > 0) { /* wave already started; fine */ }
  await page.mouse.click(350 + 24, 120 + 24);
  await sleep(200);
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("tower built, gold spent", dbg.td.towers === 1 && dbg.td.gold === 50);

  // wait for wave to play out (4 grunts, spawn 0.6s, walk ~2s each)
  let victorySeen = false;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.gameState === "victory") { victorySeen = true; break; }
    if (dbg.td && dbg.td.gameOver) break;
  }
  check("victory after clearing wave (tower kills all)", victorySeen);
  check("kills rewarded gold/score", dbg.score >= 60);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
