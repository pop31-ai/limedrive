"use strict";

const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  fs.readFile(path.join(ROOT, u.slice(1)), (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    const ct = u.endsWith(".json") ? "application/json" : u.endsWith(".js") ? "application/javascript" : "text/html";
    res.writeHead(200, { "Content-Type": ct });
    res.end(d);
  });
});

let failed = 0;
function check(name, cond) {
  console.log((cond ? "PASS" : "FAIL") + " " + name);
  if (!cond) failed++;
}

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let pageErrors = 0;
  page.on("pageerror", e => { console.log("[pageerror]", e.message); pageErrors++; });

  await page.goto(`http://127.0.0.1:${port}/generator/generator.html`, { waitUntil: "networkidle2" });
  await page.waitForFunction("!!window.LimeHash && !!window.LimeRegistry", { timeout: 5000 }).catch(() => {});

  check("patent modules loaded in generator", await page.evaluate("!!window.LimeHash && !!window.LimeRegistry"));

  const rec = await page.evaluate(`(() => {
    const r = fixPriority();
    return r ? { sha256: r.sha256, title: r.title } : null;
  })()`);
  check("fixPriority returns record", !!rec && rec.sha256.length === 64);
  check("record has game title", !!rec && rec.title.length > 0);

  const stored = await page.evaluate("JSON.parse(localStorage.getItem('limedrive-patent-registry') || '[]')");
  check("registry persisted to localStorage", stored.length >= 1 && stored[stored.length - 1].sha256.length === 64);

  check("collection buttons present", await page.evaluate("document.body.innerHTML.indexOf('exportToCollection()') >= 0"));

  const metaCheck = await page.evaluate(`(() => {
    project.author = "Тест Автор";
    project.promptLog = "создай платформер\\nдобавь босса";
    switchTab("project");
    const panel = document.getElementById("tab-project");
    return {
      authorShown: panel.innerHTML.indexOf('Тест Автор') >= 0,
      logShown: panel.innerHTML.indexOf('добавь босса') >= 0,
      hasAuthorshipSection: panel.innerHTML.indexOf("Authorship") >= 0
    };
  })()`);
  check("authorship section renders", !!metaCheck && metaCheck.hasAuthorshipSection && metaCheck.authorShown && metaCheck.logShown);

  check("generator page no js errors", pageErrors === 0);

  await browser.close();
  srv.close();
  process.exit(failed ? 1 : 0);
});
