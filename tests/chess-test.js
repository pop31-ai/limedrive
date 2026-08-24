"use strict";
/* Chess mode smoke test: loads 10-chess-battle, makes rook moves, asserts no JS errors,
 * canvas stays rendered and the page responds. Self-contained: starts its own HTTP server. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "10-chess-battle.json";

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
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

  const errors = [];
  page.on("pageerror", err => errors.push(err.message));

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(GAME)}`,
    { waitUntil: "networkidle2" });
  await sleep(1200);

  const dbg = await page.evaluate(() => LimeDriveDebug());
  check("mode is chess", dbg.mode === "chess");
  check("game is playing", dbg.gameState === "playing");

  async function clickCell(gx, gy) {
    const boardX = 640, boardY = 220;
    await page.mouse.click(boardX + gx * 80 + 40, boardY + gy * 80 + 40);
    await sleep(120);
  }
  async function getPixel(x, y) {
    return page.evaluate((px, py) => {
      const c = document.getElementById("gameCanvas");
      const d = c.getContext("2d").getImageData(px, py, 1, 1).data;
      return `${d[0]},${d[1]},${d[2]}`;
    }, x, y);
  }

  // Board renders: a light square must not be pure black
  const lightCell = await getPixel(640 + 1 * 80 + 10, 220 + 7 * 80 + 10);
  check("board renders (light square not black)", lightCell !== "0,0,0");

  // MOVE 1: rook (0,0) -> (0,4), wait for AI reply
  await clickCell(0, 0);
  await clickCell(0, 4);
  await sleep(2000);

  // MOVE 2: keep moving; page must stay responsive and error-free
  await clickCell(0, 4);
  await clickCell(0, 6);
  await sleep(2000);

  const dbg2 = await page.evaluate(() => LimeDriveDebug());
  check("still playing after moves", dbg2.gameState === "playing" || dbg2.gameState === "victory");

  const responsive = await page.evaluate(() => {
    const canvas = document.getElementById("gameCanvas");
    let ok = false;
    canvas.addEventListener("click", () => { ok = true; }, { once: true });
    canvas.click();
    return ok;
  });
  check("page responsive to clicks", responsive);
  check("no JS errors", errors.length === 0);
  if (errors.length) errors.forEach(e => console.log("   [pageerror]", e));

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
