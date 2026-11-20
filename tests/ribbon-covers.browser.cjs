const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve('tmp/site-preview');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),attempts=new Map();
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url()),file=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
   const cover=file.match(/\/second-act\/(01-accounts|06-portfolio-design)\./)?.[1];
   if(cover){const n=(attempts.get(cover)||0)+1;attempts.set(cover,n);if(n===1)return route.abort('failed');}
   try{return route.fulfill({body:await fs.readFile(path.join(root,file)),contentType:mime[path.extname(file)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:'Not found'});}
  });
  await page.goto('http://jade.test/',{waitUntil:'domcontentloaded'});
  await page.locator('#enter-studio').click({force:true});
  await page.locator('#portfolio-index').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelectorAll('.work-ribbon-card img').length===6&&[...document.querySelectorAll('.work-ribbon-card img')].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:12000});
  assert.equal(attempts.get('01-accounts'),2,'A failed cover must recover with one backup request');
  assert.equal(attempts.get('06-portfolio-design'),2,'A failed cover must recover with one backup request');
  await page.waitForFunction(()=>document.querySelector('#work-ribbon').classList.contains('ribbon-gpu'));
  await page.locator('#pause-ribbon').click();
  await page.screenshot({path:'tmp/ribbon-covers-recovered.png'});
  await page.locator('.ribbon-canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForFunction(()=>!document.querySelector('#work-ribbon').classList.contains('ribbon-gpu'));
  assert.deepEqual(await page.locator('.work-ribbon-card img').evaluateAll(images=>images.map(i=>({loaded:i.naturalWidth>0,opacity:getComputedStyle(i).opacity}))),Array(6).fill({loaded:true,opacity:'1'}),'GPU loss must retain all six native cover images');
  console.log('PASS failed covers recover and remain visible without WebGL');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
