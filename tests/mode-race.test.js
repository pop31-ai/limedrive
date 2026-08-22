"use strict";
/* Racing mechanics test: throttle, steering, checkpoints, lap -> victory. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-race.json";

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
  check("mode is racing", dbg.mode === "racing");
  const x0 = dbg.heroPos.x;

  // throttle straight through cp1 -> cp2 -> lap done -> victory
  await page.keyboard.down("ArrowUp");
  let victorySeen = false;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.gameState === "victory") { victorySeen = true; break; }
  }
  await page.keyboard.up("ArrowUp");
  check("car moved forward fast", dbg.heroPos.x > x0 + 300 || victorySeen);
  check("lap completed via checkpoints -> victory", victorySeen);

  if (!victorySeen) {
    // steering sanity on fresh attempt
    await page.keyboard.press("KeyR");
    await sleep(600);
    dbg = await page.evaluate(() => LimeDriveDebug());
    const y0 = dbg.heroPos.y;
    await page.keyboard.down("ArrowUp");
    await page.keyboard.down("ArrowLeft");
    await sleep(900);
    await page.keyboard.up("ArrowLeft");
    dbg = await page.evaluate(() => LimeDriveDebug());
    await page.keyboard.up("ArrowUp");
    check("steering turns the car (y changes)", Math.abs(dbg.heroPos.y - y0) > 10);
  }

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
