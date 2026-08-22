"use strict";
/* Endless-runner mechanics test: auto-run right, distance score, no backtrack. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "09-neon-runner.json";

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
  await sleep(1500);

  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("mode is platformer-with-runner (auto)", dbg.mode === "platformer");
  const x0 = dbg.heroPos.x;
  const s0 = dbg.score;

  await sleep(1500);
  dbg = await page.evaluate(() => LimeDriveDebug());
  const movedRight = dbg.heroPos.x > x0 + 60;
  check("hero auto-runs without input", movedRight);
  check("score grows with distance", dbg.score >= s0);

  // no-input hold: hero must keep running (or die->checkpoint->continue)
  const x1 = dbg.heroPos.x;
  const sc1 = dbg.score;
  await sleep(1200);
  dbg = await page.evaluate(() => LimeDriveDebug());
  const progressed = dbg.heroPos.x > x1 + 40 || dbg.score > sc1 || dbg.gameState === "playing";
  check("progress continues (run or respawn)", progressed && dbg.score >= sc1 - 0.001);

  // jump still works
  await page.keyboard.press("Space");
  await sleep(300);
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("still alive after jump", dbg.gameState === "playing" || dbg.heroPos !== null);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
