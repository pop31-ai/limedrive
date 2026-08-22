#!/usr/bin/env node
"use strict";
/*
 * LimeDrive game checker: validation + headless playtest + AI repair report.
 *
 * Usage:
 *   node tools/check-game.js examples/01-lime-platformer.json [more.json ...]
 *   node tools/check-game.js --all
 *
 * Layers:
 *   1) schema validation   (tools/validate.js validateGame)
 *   2) runtime playtest    (puppeteer: JS errors, failed requests,
 *                          requestAnimationFrame freeze, black screen)
 *   3) reports/*.repair.md — ready-to-paste repair prompt for the AI
 *
 * Exit code 1 if anything failed.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { validateGame } = require("./validate");

const ROOT = path.join(__dirname, "..");
const EXAMPLES = path.join(ROOT, "examples");
const REPORTS = path.join(ROOT, "reports");
const PLAY_MS = 6000;          // simulated gameplay duration per game
const SETTLE_MS = 1200;        // wait after networkidle before playing

function collectTargets(argv) {
  if (argv.includes("--all")) {
    return fs.readdirSync(EXAMPLES).filter(f => f.endsWith(".json"))
      .sort().map(f => path.join(EXAMPLES, f));
  }
  return argv.filter(a => !a.startsWith("--")).map(f => path.resolve(f));
}

function startServer() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      if (urlPath === "/favicon.ico") { res.writeHead(204); res.end(); return; }
      let fp = path.join(ROOT, urlPath === "/" ? "examples/index.html" : urlPath);
      if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        const ext = path.extname(fp).toLowerCase();
        const mime = { ".html": "text/html; charset=utf-8", ".json": "application/json",
          ".js": "text/javascript", ".css": "text/css", ".png": "image/png" }[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": mime });
        res.end(data);
      });
    });
    srv.listen(0, "127.0.0.1", () => resolve({ srv, port: srv.address().port }));
  });
}

async function playtest(browser, port, jsonName) {
  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];
  const failedRequests = [];

  page.on("pageerror", e => errors.push(String(e.message || e)));
  page.on("console", m => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("requestfailed", r => failedRequests.push(`${r.url()} — ${r.failure()?.errorText}`));

  await page.setViewport({ width: 1280, height: 800 });
  await page.evaluateOnNewDocument(() => {
    window.__raf = 0;
    const orig = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => orig(t => { window.__raf++; cb(t); });
  });

  const url = `http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(jsonName)}`;
  await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise(r => setTimeout(r, SETTLE_MS));

  // --- simulate gameplay ---
  const t0 = Date.now();
  await page.keyboard.down("ArrowRight");
  while (Date.now() - t0 < PLAY_MS) {
    await page.keyboard.press("Space");           // jump/shoot/confirm
    await page.keyboard.press("ArrowUp");
    await page.mouse.click(640, 400);             // menu/click-driven modes
    await new Promise(r => setTimeout(r, 700));
  }
  await page.keyboard.up("ArrowRight");

  const frames = await page.evaluate(() => window.__raf);

  // --- canvas sanity ---
  const pixels = await page.evaluate(() => {
    const c = document.getElementById("gameCanvas");
    if (!c) return null;
    const ctx = c.getContext("2d");
    const pts = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.75], [0.5, 0.9], [0.9, 0.1]];
    return pts.map(([fx, fy]) => {
      try {
        const d = ctx.getImageData(Math.floor(c.width * fx), Math.floor(c.height * fy), 1, 1).data;
        return `${d[0]},${d[1]},${d[2]}`;
      } catch { return "err"; }
    });
  });
  const blackScreen = !!pixels && pixels.every(p => p === "0,0,0" || p === "err");

  await page.close();

  const problems = [];
  for (const e of errors) problems.push(`JS exception: ${e}`);
  for (const e of consoleErrors.slice(0, 10)) problems.push(`console.error: ${e}`);
  for (const r of failedRequests.slice(0, 5)) problems.push(`request failed: ${r}`);
  if (frames < 20) problems.push(`game loop nearly idle: only ${frames} frames in ${Math.round((SETTLE_MS + PLAY_MS) / 1000)}s`);
  if (blackScreen) problems.push(`canvas fully black at ${pixels.join(" | ")}`);

  return { problems, frames };
}

function repairReport(relFile, rep, play) {
  let md = `# Ремонтный отчёт: ${relFile}\n\n`;
  md += `_Сгенерировано tools/check-game.js, ${new Date().toISOString()}_\n\n`;

  md += `## 1. Ошибки схемы (validate.js)\n`;
  if (rep.errors.length === 0 && rep.warnings.length === 0) md += "нет\n";
  else {
    rep.errors.forEach(e => (md += `- ERROR: ${e}\n`));
    rep.warnings.forEach(w => (md += `- warning: ${w}\n`));
  }

  md += `\n## 2. Ошибки выполнения (headless-плейтест)\n`;
  if (!play) md += "плейтест не запускался (сначала исправь схему)\n";
  else if (play.problems.length === 0) md += `нет (${play.frames} кадров за время теста)\n`;
  else play.problems.forEach(p => (md += `- ${p}\n`));

  md += `\n---\n\n## Промпт для ремонта (скопируй ИИ вместе с ошибками выше)\n\n`;
  md += "```\n";
  md += `Вот ошибки автоматической проверки игры LimeDrive "${path.basename(relFile)}":\n\n`;
  rep.errors.forEach(e => (md += `- ${e}\n`));
  if (play) play.problems.forEach(p => (md += `- ${p}\n`));
  md += `\nПравила: JSON должен грузиться в examples/player.html без ошибок;\n`;
  md += `цвета — #RGB/#RGBA/#RRGGBB/#RRGGBBAA/hsl()/rgb()/rgba();\n`;
  md += `width/height всех сущностей > 0; id уникальны; координаты в пределах мира.\n`;
  md += `Исправь только ошибки, не меняя задумку уровней.\n`;
  md += `Выведи ПОЛНЫЙ исправленный JSON без пояснений.\n`;
  md += "```\n";
  return md;
}

async function main() {
  const targets = collectTargets(process.argv.slice(2));
  if (targets.length === 0) {
    console.log("no targets; use --all or pass files");
    process.exit(1);
  }
  fs.mkdirSync(REPORTS, { recursive: true });

  let puppeteer;
  let browser = null, server = null, port = 0;
  let failed = 0;

  for (const t of targets) {
    const relFile = path.relative(ROOT, t);
    const name = path.basename(t);
    const rep = validateGame(t);
    const schemaOk = rep.ok;

    console.log(`\n=== ${name} ===`);
    console.log(`schema: ${schemaOk ? "PASS" : "FAIL"} (E:${rep.errors.length} W:${rep.warnings.length})`);

    let play = null;
    if (schemaOk) {
      try {
        if (!browser) { puppeteer = require("puppeteer"); browser = await puppeteer.launch(); ({ srv: server, port } = await startServer()); }
        play = await playtest(browser, port, name);
        console.log(`playtest: ${play.problems.length === 0 ? "PASS" : "FAIL"} (${play.frames} frames)`);
        play.problems.slice(0, 8).forEach(p => console.log(`   ! ${p}`));
      } catch (e) {
        play = { problems: [`playtest crashed: ${e.message}`], frames: -1 };
        console.log(`playtest: CRASHED — ${e.message}`);
      }
    } else {
      console.log("playtest: skipped");
    }

    const ok = schemaOk && (!play || play.problems.length === 0);
    if (!ok) {
      failed++;
      const md = repairReport(relFile, rep, play);
      const out = path.join(REPORTS, name.replace(/\.json$/, "") + ".repair.md");
      fs.writeFileSync(out, md, "utf8");
      console.log(`report: ${path.relative(ROOT, out)}`);
    }
  }

  if (browser) await browser.close();
  if (server) server.close();

  console.log(`\nSummary: ${targets.length} game(s), ${failed} need repair`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
