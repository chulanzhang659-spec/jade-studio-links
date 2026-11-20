const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1280,height:900},deviceScaleFactor:2});
  await p.goto(new URL('work.html?project=portfolio-02',process.env.JADE_TEST_URL||'http://127.0.0.1:8765/').href,{waitUntil:'networkidle'});
  await p.waitForFunction(()=>document.querySelector('#wave-stage').dataset.ready==='true');
  const initial=await p.locator('#wave-stage').getAttribute('data-page-index');
  await p.mouse.move(800,280);await p.mouse.down();await p.mouse.move(770,280,{steps:3});
  await p.waitForTimeout(150);
  assert.equal(await p.locator('#project-catalog').evaluate(e=>getComputedStyle(e).filter),'none','A small click/drag must not rasterize the entire page through a displacement filter');
  await p.mouse.up();await p.waitForTimeout(500);
  assert.equal(await p.locator('#wave-stage').getAttribute('data-page-index'),initial);
  await p.mouse.move(1000,280);await p.mouse.down();await p.mouse.move(250,280,{steps:20});await p.mouse.up();
  await p.waitForFunction(n=>Number(document.querySelector('#wave-stage').dataset.pageIndex)===Number(n)+1,initial);
  await p.screenshot({path:'tmp/catalog-clear-after-turn.png'});
  console.log('PASS catalog clarity and deliberate page turn');
 }finally{await b.close()}
})();
