"use strict";
/* Sokoban mechanics test: push block -> switch -> door opens -> finish. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-puzzle.json";

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
async function press(page, key) {
  await page.keyboard.down(key);
  await sleep(60);
  await page.keyboard.up(key);
  await sleep(120);
}
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
  await sleep(1500);

  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("mode is puzzle", dbg.mode === "puzzle");
  check("hero starts at (96,96)", dbg.heroPos && dbg.heroPos.x === 96 && dbg.heroPos.y === 96);
  const moves0 = dbg.movesLeft;

  await press(page, "ArrowRight"); // push block onto switch
  await press(page, "ArrowRight"); // hero steps onto freed cell? no - block now on switch; hero blocked
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("block pushed (score+100 door opened)", dbg.score >= 100);

  await press(page, "ArrowDown");
  await press(page, "ArrowRight");
  await press(page, "ArrowRight");
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("hero passed open door corridor", dbg.heroPos && dbg.heroPos.x >= 224);

  await press(page, "ArrowUp");
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("moves decremented", dbg.movesLeft === moves0 - 5);

  await press(page, "ArrowRight"); // onto finish
  await sleep(800);
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("victory reached", dbg.gameState === "victory");

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
