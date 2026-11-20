const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.JADE_TEST_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2});
   await page.goto(base,{waitUntil:'networkidle'});
   await page.locator('#enter-studio').click({force:true});
   await page.waitForFunction(()=>document.body.dataset.stage==='journal');
   await page.mouse.click(width/2,390);
   await page.waitForTimeout(500);
   assert.equal(await page.locator('#manifesto-type').evaluate(e=>getComputedStyle(e).opacity),'1','Clicking the manifesto must keep native vector lettering visible');
   assert.equal(await page.locator('.manifesto-elastic-canvas').count(),0,'Text must not switch to a lower-resolution raster canvas');
   assert.match(await page.locator('#manifesto-type').textContent(),/WE FIND WHAT/);
   assert.equal(await page.locator('#manifesto-type text').first().getAttribute('filter'),'url(#ink-wear)');
   await page.mouse.move(width-2,100);
   await page.waitForTimeout(700);
   await page.screenshot({path:`tmp/journal-clear-${width}.png`});
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.locator('#manifesto-type text').first().getAttribute('text-anchor'),'middle','Reduced motion restores the exact original centered layout');
   await page.close();
   console.log(`PASS vector clarity ${width}px at DPR 2`);
  }
 }finally{await browser.close()}
})();
