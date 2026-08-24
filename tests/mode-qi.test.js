"use strict";
/* Qi duel test: approach, attack resolves with energy spend and one of outcomes. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-qi.json";

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
  const BX = 320, BY = 80; // 8x8 board always centered: 80..720
  async function clickCell(gx, gy) {
    await page.mouse.click(BX + gx * 80 + 40, BY + gy * 80 + 40);
    await sleep(250);
  }
  const dbg = () => page.evaluate(() => LimeDriveDebug());

  async function waitPlayerTurn() {
    for (let i = 0; i < 30; i++) {
      const d = await dbg();
      if (d.chess.turn === "player") return d;
      await sleep(150);
    }
    return dbg();
  }

  let d = await dbg();
  check("qi mode, fighters present", d.chess.qi && d.chess.qi.pHp > 0 && d.chess.qi.eHp > 0);
  const e0 = d.chess.qi.pEnergy;

  // walk right toward foe(6,0): each step = select, move, wait for AI
  let cur = 1;
  for (let step = 2; step <= 5; step++) {
    d = await waitPlayerTurn();
    await clickCell(cur, 0);   // select
    await clickCell(step, 0);  // move
    cur = step;
    await waitPlayerTurn();
  }
  d = await dbg();
  check("adjacent to foe", d.chess.turn === "player" && d.chess.qi.x === 5);

  // attack: select own fighter, click the CAPTURE target (from debug)
  d = await waitPlayerTurn();
  await clickCell(d.chess.qi.x, d.chess.qi.y); // select
  await sleep(200);
  d = await dbg();
  const before = d.chess.qi;
  const atk = (d.chess.targets || []).find(t => t.capture);
  check("capture target offered", !!atk);
  if (!atk) { console.log("targets:", JSON.stringify(d.chess.targets)); await browser.close(); srv.close(); process.exit(1); }
  await clickCell(atk.x, atk.y);
  await sleep(500);
  d = await dbg();
  const q = d.chess.qi;
  check("attack resolved: energy spent", q.pEnergy === before.pEnergy - 1);
  check("outcome applied (hp/tempo changed)",
    q.eHp < before.eHp || q.pTempo > 0 || q.pHp < before.pHp);

  // fight to conclusion: each turn pick capture if offered, else step toward foe
  let finished = false;
  for (let i = 0; i < 40 && !finished; i++) {
    d = await waitPlayerTurn();
    if (d.gameState !== "playing") break;
    if (d.chess.qi.eHp <= 0 || d.chess.qi.pHp <= 0) { finished = true; break; }
    const me = d.chess.qi;
    await clickCell(me.x, me.y); // select
    await sleep(200);
    d = await dbg();
    const ts = d.chess.targets || [];
    const foe = (d.chess.pieces || []).find(p => p.side === "enemy");
    if (!foe) { finished = true; break; }
    let pick = ts.find(t => t.capture);
    if (!pick && ts.length) {
      pick = ts.reduce((best, t) => {
        const dd = t => Math.abs(t.x - foe.x) + Math.abs(t.y - foe.y);
        return !best || dd(t) < dd(best) ? t : best;
      }, null);
    }
    if (!pick) break;
    await clickCell(pick.x, pick.y);
    await sleep(400);
    d = await dbg();
    if (d.chess.qi.eHp <= 0 || d.chess.qi.pHp <= 0 || d.gameState === "victory") finished = true;
  }
  check("duel reaches conclusion", finished);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
