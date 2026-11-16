import {manifestoSVG,manifestoMetrics} from './journal-typography.mjs?v=jade-type-5';
import {playCompression} from './journal-transition.js?v=jade-type-5';
import {createManifestoMotion} from './manifesto-webgl.mjs?v=1';
import {createWorkRibbon} from './work-ribbon.mjs?v=9';
import {workURL} from './portfolio-exit.mjs';
import {createScrollDrag} from './journal-scroll.mjs?v=jade-members-7';
import {createBusinessPanel} from './business-filters.mjs?v=jade-business-8';

const $=selector=>document.querySelector(selector);
const content=window.JADE_CONTENT, intro=$('#intro'), main=$('#journal'), enter=$('#enter-studio');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'), dialog=$('#story-dialog');
let ring,transition,opener,paused=false,stage='intro';
const manifestoMotion=createManifestoMotion($('#manifesto'),{isActive:()=>stage==='journal'&&!dialog.open});
const workRibbon=createWorkRibbon($('#work-ribbon'),{portfolios:content.portfolios,isActive:()=>stage==='journal'&&!dialog.open,onSelect:openPortfolioPage});
const scrollDrag=createScrollDrag($('#journal-flow'),{isActive:()=>stage==='journal'&&!dialog.open});
if('scrollRestoration' in history)history.scrollRestoration='manual';
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderManifesto(){
 const rect=$('#manifesto').getBoundingClientRect(),w=rect.width||innerWidth,h=rect.height||innerHeight;
 $('#manifesto-type').innerHTML=manifestoSVG(w,h);
 $('.manifesto-chinese').style.top=`${manifestoMetrics(w,h).chineseTop}px`;
 manifestoMotion.refresh();
 workRibbon.refresh();
}
document.fonts.ready.then(()=>{if(stage==='journal')renderManifesto();});
function showJournal(){
 transition=null;stage='journal';document.body.dataset.stage=stage;
 intro.hidden=true;intro.inert=true;main.hidden=false;main.inert=false;ring?.pause();
 delete document.documentElement.dataset.entry;
 window.scrollTo({top:0,behavior:'instant'});scrollDrag.reset();renderManifesto();$('#manifesto').focus({preventScroll:true});
}
function selectImage(selection){
 if(stage!=='intro')return;
 stage='transition';document.body.dataset.stage=stage;intro.inert=true;ring?.pause();
 intro.dataset.selected=String(selection.index??'fallback');
 transition=playCompression({...selection,reducedMotion:reduce.matches,onComplete:showJournal});
}
function enterStudio(){
 if(stage!=='intro')return;
 if(ring?.selectFront())return;
 const image=$('.ring-fallback img');selectImage({image:image?.complete&&image.naturalWidth?image:null});
}
function returnToIntro(){
 scrollDrag.reset();
 transition?.cancel();transition=null;dialog.close();document.body.classList.remove('modal-open');
 stage='intro';document.body.dataset.stage=stage;main.hidden=true;main.inert=true;intro.hidden=false;intro.inert=false;
 window.scrollTo({top:0,behavior:'instant'});paused=false;$('#pause-intro').textContent='PAUSE Ⅱ';$('#pause-intro').setAttribute('aria-pressed','false');
 ring?.reset();if(reduce.matches)ring?.pause();enter.focus({preventScroll:true});
}
enter.addEventListener('click',enterStudio);
// The transparent canvas sits above the lettering for the original occlusion.
// A click through its empty centre still activates the visible entrance button.
intro.addEventListener('click',event=>{
 if(stage!=='intro'||event.target.tagName!=='CANVAS')return;
 const r=enter.getBoundingClientRect();
 if(event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom)enterStudio();
});
document.querySelectorAll('[data-return]').forEach(button=>button.addEventListener('click',returnToIntro));
$('#skip-to-work').addEventListener('click',event=>{event.preventDefault();transition?.cancel();showJournal();$('#portfolio-index').scrollIntoView({behavior:'instant'});$('#work-ribbon button')?.focus({preventScroll:true});});
$('#pause-intro').addEventListener('click',()=>{paused=!paused;if(paused)ring?.pause();else ring?.resume();$('#pause-intro').textContent=paused?'PLAY ▷':'PAUSE Ⅱ';$('#pause-intro').setAttribute('aria-pressed',String(paused));});
reduce.addEventListener('change',()=>{if(reduce.matches){ring?.pause();if(stage==='transition'){transition?.cancel();showJournal();}}else if(stage==='intro'&&!paused)ring?.resume();});
window.addEventListener('resize',renderManifesto);

// Six business destinations shared by the flowing image band.
function openPortfolioPage(key,trigger){
 const url=workURL(key);if(!url||stage!=='journal')return;
 const path=location.pathname+location.search;
 try{sessionStorage.setItem('jade-portfolio-return',JSON.stringify({path,y:scrollY,slot:trigger?.dataset.slot}));}catch{}
 history.replaceState(history.state,'',path+'#portfolio-index');
 location.assign(url);
}
function restorePortfolioPosition(){
 if(location.hash!=='#portfolio-index')return;
 showJournal();
 let saved;try{saved=JSON.parse(sessionStorage.getItem('jade-portfolio-return')||'null');}catch{}
 requestAnimationFrame(()=>{
  if(saved?.path===location.pathname+location.search&&Number.isFinite(saved.y))window.scrollTo({top:saved.y,behavior:'instant'});
  else $('#portfolio-index').scrollIntoView({behavior:'instant'});
  scrollDrag.reset();
 });
}
content.portfolios.forEach((portfolio,index)=>{
 const number=String(index+1).padStart(2,'0');
 content.stories[portfolio.id]={eyebrow:`STUDIO DISCIPLINE / ${number} OF ${String(content.portfolios.length).padStart(2,'0')}`,title:portfolio.subtitle,body:portfolio.body,note:'按分类浏览项目与作品。',portfolio};
});
function openStory(key,trigger){
 const story=content.stories[key];if(!story||stage!=='journal')return;opener=trigger;
 const title=escapeHTML(story.title).replace(/&lt;br&gt;/g,'<br>');
 $('#story-content').innerHTML=`<p class="story-eyebrow">${escapeHTML(story.eyebrow)}</p><h2 class="story-heading" id="story-title">${title}</h2><p class="story-body">${escapeHTML(story.body)}</p><p class="story-note">${escapeHTML(story.note)}</p>`;
 if(story.portfolio){
  $('#story-title').lang='zh-CN';$('.story-body').lang='zh-CN';$('.story-note').lang='zh-CN';
  $('#story-content').append(createBusinessPanel(story.portfolio));
 }
 dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');$('#close-dialog').focus();
}
function closeStory(){dialog.close();document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});}
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{
 if(button.dataset.open==='contact'){
  try{sessionStorage.setItem('jade-portfolio-return',JSON.stringify({path:location.pathname+location.search,y:scrollY}));}catch{}
  location.assign('contact.html');return;
 }
 openStory(button.dataset.open,button);
}));
$('#close-dialog').addEventListener('click',closeStory);$('#back-journal').addEventListener('click',closeStory);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeStory();});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeStory();});

function showFallback(){
 $('#film-orbit').innerHTML='<div class="ring-fallback"><img src="assets/fashion-cutout.webp" alt=""><img src="assets/atelier-sketch.webp" alt=""></div>';
 $('#intro-status').textContent='ENTER TO EXPLORE THE ATELIER';
}
// The return route belongs to the staircase, not the entrance. Restore it
// before loading entrance-only textures so a slow GPU/network cannot flash it.
if(location.hash==='#portfolio-index')restorePortfolioPosition();
try{
 const {createJournalRing}=await import('./journal-ring.js?v=jade-webp-2');
 ring=await createJournalRing($('#film-orbit'),{onSelect:selectImage,reducedMotion:reduce.matches});
 if(stage!=='intro')ring.pause();
 $('#intro-status').textContent='SELECT A FRAME / STEP INSIDE THE ATELIER';$('#pause-intro').hidden=reduce.matches;
}catch(error){console.warn('Using still-image entrance:',error);showFallback();}
window.addEventListener('pageshow',event=>{if(event.persisted)restorePortfolioPosition();});
window.addEventListener('pagehide',()=>{transition?.cancel();ring?.pause();});
window.addEventListener('pageshow',()=>{if(stage==='transition')showJournal();else if(stage==='intro'&&!paused&&!reduce.matches)ring?.resume();});
