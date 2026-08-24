"use strict";
/* Core features test: audio synth + mute persistence, progress save/load,
 * auto-pause on tab blur, fullscreen toggle safety. Uses _fixture-shooter.json
 * for a fast deterministic victory. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
let failed = 0;
function check(name, cond) { console.log((cond ? "PASS" : "FAIL") + " " + name); if (!cond) failed++; }

async function tap(page, code, holdMs = 130) {
  await page.keyboard.down(code);
  await sleep(holdMs);
  await page.keyboard.up(code);
  await sleep(80);
}

async function main() {
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
    fs.readFile(path.join(ROOT, u.slice(1)), (e, d) => {
      if (e) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "Content-Type": u.endsWith(".json") ? "application/json" : "text/html" });
      res.end(d);
    });
  });
  await new Promise(r => srv.listen(0, "127.0.0.1", r));
  const port = srv.address().port;
  const url = g => `http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(g)}`;

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", e => errors.push(e.message));
    await page.setViewport({ width: 1280, height: 800 });

    // ---- AUDIO ----
    await page.goto(url("_fixture-shooter.json"), { waitUntil: "networkidle2" });
    await sleep(1300);
    let dbg = await page.evaluate(() => LimeDriveDebug());
    check("audio starts unmuted", dbg.audio && dbg.audio.muted === false);

    await page.keyboard.press("Space"); // user gesture -> context created/resumed
    await sleep(400);
    dbg = await page.evaluate(() => LimeDriveDebug());
    check("audio context running after gesture", dbg.audio.ready === true);

    await tap(page, "KeyM");
    await sleep(150);
    dbg = await page.evaluate(() => LimeDriveDebug());
    check("KeyM mutes", dbg.audio.muted === true);
    check("no JS errors so far", errors.length === 0);

    // mute persists across reload
    await page.reload({ waitUntil: "networkidle2" });
    await sleep(1100);
    dbg = await page.evaluate(() => LimeDriveDebug());
    check("mute persists after reload", dbg.audio.muted === true);
    await tap(page, "KeyM"); // unmute for the rest of the run
    await sleep(150);

    // ---- PROGRESS: win shooter -> saved ----
    // kill both static enemies: park under each column holding fire
    async function driveTo(targetX, key, maxMs) {
      await page.keyboard.down(key);
      const start = Date.now();
      while (Date.now() - start < maxMs) {
        await sleep(80);
        const d = await page.evaluate(() => LimeDriveDebug());
        if (d.gameState !== "playing") break;
        if (key === "ArrowLeft" ? d.heroPos.x <= targetX : d.heroPos.x >= targetX) break;
      }
      await page.keyboard.up(key);
    }
    await page.keyboard.down("Space");
    await driveTo(180, "ArrowLeft", 3000);
    await driveTo(420, "ArrowRight", 3000);
    let won = false;
    for (let i = 0; i < 20; i++) {
      await sleep(250);
      const d = await page.evaluate(() => LimeDriveDebug());
      if (d.gameState === "victory") { won = true; break; }
    }
    await page.keyboard.up("Space");
    check("shooter fixture won", won);

    dbg = await page.evaluate(() => LimeDriveDebug());
    check("progress saved on victory", !!(dbg.progress && dbg.progress.completed === true && (dbg.progress.bestScore || 0) >= 60));

    // persistence across reload
    await page.reload({ waitUntil: "networkidle2" });
    await sleep(1100);
    dbg = await page.evaluate(() => LimeDriveDebug());
    check("progress survives reload", !!(dbg.progress && (dbg.progress.bestScore || 0) >= 60));

    // ---- AUTO-PAUSE on tab blur ----
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await sleep(200);
    dbg = await page.evaluate(() => LimeDriveDebug());
    check("auto-pause on hidden", dbg.gameState === "playing" && dbg.paused === true);

    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await sleep(200);
    dbg = await page.evaluate(() => LimeDriveDebug());
    check("stays paused until user resumes", dbg.paused === true);

    // ---- FULLSCREEN toggle safety ----
    await tap(page, "Escape"); // unpause
    await sleep(150);
    await tap(page, "KeyF");
    await sleep(500);
    await tap(page, "KeyF");
    await sleep(300);
    dbg = await page.evaluate(() => LimeDriveDebug());
    check("fullscreen toggle does not crash (flag exposed)", typeof dbg.fullscreen === "boolean");
    check("no JS errors at end", errors.length === 0);
    if (errors.length) errors.forEach(e => console.log("   [pageerror]", e));
  } finally {
    await browser.close();
    srv.close();
  }

  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
