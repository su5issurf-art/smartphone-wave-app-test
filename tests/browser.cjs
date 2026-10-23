const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
 const server = http.createServer((req,res) => {
  const name = req.url === '/' ? 'index.html' : req.url.slice(1);
  if (!['index.html','styles.css','app.js'].includes(name)) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':'text/html');
  res.end(fs.readFileSync(path.resolve(__dirname,'..',name)));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url = `http://127.0.0.1:${server.address().port}`;
 const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
 const errors = [], external = [];
 const page = await browser.newPage();
 page.on('pageerror', e => errors.push(e.message));
 page.on('request', r => {if(/^https?:/.test(r.url()) && !r.url().startsWith(url)) external.push(r.url());});
 for(const width of [320,375,390,430,768,1280]) {
  await page.setViewportSize({width,height:844});
  await page.goto(url);
  await page.waitForSelector('.hour');
  assert.equal(await page.locator('.hour').count(),24);
  assert(await page.getByText('表示データは架空です',{exact:true}).isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
  for(const [hour,rating,height] of [[6,'◎','1.1'],[9,'○','1.1'],[14,'△','1.4'],[19,'×','1.2'],[0,'○','0.6'],[23,'△','0.8']]) {
   await page.locator(`[data-hour="${hour}"]`).click();
   assert.equal(await page.locator('#rating').textContent(),rating);
   assert.equal(await page.locator('#height').textContent(),height);
   assert.equal(await page.locator('.hour[aria-pressed=true]').count(),1);
   assert.equal(await page.locator('#selected-time').textContent(),`${String(hour).padStart(2,'0')}:00 のサンプル予報`);
  }
  console.log(`PASS: ${width}px — layout, 24 hours, 4 ratings and selection`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(url);
 await page.screenshot({path:path.resolve(__dirname,'mobile-preview.png'),fullPage:true});
 await page.locator('[data-hour="10"]').focus();
 await page.keyboard.press('Enter');
 assert.equal(await page.locator('[data-hour="10"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-hour="11"]').focus();
 await page.keyboard.press('Space');
 assert.equal(await page.locator('[data-hour="11"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
 console.log('PASS: keyboard activation, no JavaScript errors, zero external requests');
 await browser.close();
 server.close();
})().catch(e=>{console.error(e); process.exit(1);});
