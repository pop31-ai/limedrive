const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:8080/player.html?game=10-chess-battle.json', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  // Helper: check if game loop is alive by sampling pixels over time
  async function isAlive() {
    const s1 = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      const x = c.getContext('2d').getImageData(960, 540, 1, 1).data;
      return `${x[0]},${x[1]},${x[2]}`;
    });
    await new Promise(r => setTimeout(r, 100));
    const s2 = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      const x = c.getContext('2d').getImageData(960, 540, 1, 1).data;
      return `${x[0]},${x[1]},${x[2]}`;
    });
    return true; // If we get here, page isn't frozen
  }

  // Helper: inject chess state reader via overriding IIFE
  // We can't read vars directly from IIFE, but we can check game behavior
  async function clickCell(gx, gy) {
    const boardX = 640, boardY = 220;
    await page.mouse.click(boardX + gx * 80 + 40, boardY + gy * 80 + 40);
    await new Promise(r => setTimeout(r, 100));
  }

  async function getPixelColor(x, y) {
    return page.evaluate((px, py) => {
      const c = document.getElementById('gameCanvas');
      const d = c.getContext('2d').getImageData(px, py, 1, 1).data;
      return `rgb(${d[0]},${d[1]},${d[2]})`;
    }, x, y);
  }

  const boardX = 640, boardY = 220;

  // Board layout for level 0:
  // Player: King(4,0), Rook(0,0), Rook(7,0)
  // Enemy: King(3,7)

  console.log('=== MOVE 1: Select rook (0,0) ===');
  await clickCell(0, 0);
  let c = await getPixelColor(boardX + 0*80 + 10, boardY + 0*80 + 10);
  console.log('Rook cell highlight:', c);

  console.log('=== MOVE 1: Move rook to (0,4) ===');
  await clickCell(0, 4);
  console.log('Waiting 2s for AI...');
  await new Promise(r => setTimeout(r, 2000));
  
  c = await getPixelColor(boardX + 0*80 + 40, boardY + 4*80 + 40);
  console.log('Cell (0,4) after move:', c);

  // Check if we can still click (game not frozen)
  console.log('\n=== MOVE 2: Select rook (0,4) ===');
  await clickCell(0, 4);
  await new Promise(r => setTimeout(r, 200));
  
  // Check for green selection highlight
  c = await getPixelColor(boardX + 0*80 + 10, boardY + 4*80 + 10);
  console.log('Rook cell (0,4) after re-select:', c);

  console.log('=== MOVE 2: Move rook to (0,6) ===');
  await clickCell(0, 6);
  console.log('Waiting 2s for AI...');
  await new Promise(r => setTimeout(r, 2000));

  // MOVE 3
  console.log('\n=== MOVE 3: Select rook (0,6) ===');
  await clickCell(0, 6);
  await new Promise(r => setTimeout(r, 200));
  
  console.log('=== MOVE 3: Move rook to (3,6) to attack enemy king column ===');
  await clickCell(3, 6);
  console.log('Waiting 2s...');
  await new Promise(r => setTimeout(r, 2000));

  // Try MOVE 4
  console.log('\n=== MOVE 4: Select rook (7,0) ===');
  await clickCell(7, 0);
  await new Promise(r => setTimeout(r, 200));

  console.log('=== MOVE 4: Move to (7,4) ===');
  await clickCell(7, 4);
  console.log('Waiting 2s...');
  await new Promise(r => setTimeout(r, 2000));

  // MOVE 5
  console.log('\n=== MOVE 5: Select rook (7,4) ===');
  await clickCell(7, 4);
  await new Promise(r => setTimeout(r, 200));

  console.log('=== MOVE 5: Move to (3,4) ===');
  await clickCell(3, 4);
  console.log('Waiting 2s...');
  await new Promise(r => setTimeout(r, 2000));

  // Final check
  console.log('\n=== FINAL CHECK ===');
  const finalAlive = await page.evaluate(() => {
    // Try to trigger a click handler and see if it responds
    const canvas = document.getElementById('gameCanvas');
    let responded = false;
    canvas.addEventListener('click', () => { responded = true; }, { once: true });
    canvas.click();
    return true; // page is responsive
  });
  console.log('Page responsive:', finalAlive);

  if (errors.length > 0) {
    console.log('\n=== JS ERRORS ===');
    errors.forEach(e => console.log(e));
  } else {
    console.log('No JS errors');
  }

  await browser.close();
  console.log('\nTest complete.');
})();
