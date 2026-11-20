import {smoothValue,loopPosition,clamp,pointerVelocity} from './elastic-field.mjs';
import {ribbonLayout,hitRibbon,inversePoint} from './ribbon-field.mjs';
import {createRibbonRenderer} from './ribbon-renderer.mjs?v=covers-1';
import {loadRibbonImage} from './ribbon-images.mjs?v=covers-1';
import {createLockupRenderer} from './lockup-renderer.mjs';
import {stepPortfolioMotion} from './portfolio-motion.mjs';
import {portfolioExit} from './portfolio-exit.mjs';
// The six full-bleed ink collages are the approved second-act covers.
export const imageSlots=[
 {id:'portfolio-01',src:null,preview:'assets/second-act/01-accounts.jpg',crop:[.5,.5],zoom:1},
 {id:'portfolio-02',src:null,preview:'assets/second-act/02-content-editing.jpg',crop:[.5,.5],zoom:1},
 {id:'portfolio-03',src:null,preview:'assets/second-act/03-film-edit.jpg',crop:[.5,.5],zoom:1},
 {id:'portfolio-04',src:null,preview:'assets/second-act/04-planning.jpg',crop:[.5,.5],zoom:1},
 {id:'portfolio-05',src:null,preview:'assets/second-act/05-design.jpg',crop:[.5,.5],zoom:1},
 {id:'portfolio-06',src:null,preview:'assets/second-act/06-portfolio-design.jpg',crop:[.5,.5],zoom:1}
].map(slot=>({...slot,fallback:slot.preview,preview:slot.preview.replace(/\.jpg$/,'.webp')}));
export function createWorkRibbon(host,{portfolios,isActive,onSelect}){
 const section=host.closest('.portfolio-index'),lockup=section.querySelector('.studio-lockup');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const track=document.createElement('div');track.className='work-ribbon-track';host.append(track);
 const imageLoads=[];
 const buttons=imageSlots.map((slot,index)=>{
  const portfolio=portfolios.find(p=>p.id===slot.id)||portfolios[index],button=document.createElement('button');
  button.className='work-ribbon-card';button.dataset.slot=String(index+1);button.setAttribute('aria-label',portfolio.subtitle+' — '+portfolio.types.join('、'));
  const image=document.createElement('img');image.alt='';image.draggable=false;image.style.objectPosition=(slot.crop[0]*100)+'% '+(slot.crop[1]*100)+'%';
  image.style.transform='scale('+(slot.zoom||1)+')';
  const label=document.createElement('span');label.className='ribbon-slot-label';
  const labelPrimary=document.createElement('span');labelPrimary.className='ribbon-slot-label-primary';labelPrimary.textContent=portfolio.title;
  const labelSecondary=document.createElement('span');labelSecondary.className='ribbon-slot-label-secondary';labelSecondary.textContent=portfolio.types.join(' ／ ');
  label.append(labelPrimary,labelSecondary);
  const hint=document.createElement('span');hint.className='ribbon-slot-hint';hint.textContent='点击查看作品集';hint.setAttribute('aria-hidden','true');
  const status=document.createElement('span');status.className='ribbon-cover-status';status.textContent=portfolio.subtitle+' · 封面加载中';
  button.append(image,label,hint,status);track.append(button);
  imageLoads.push(loadRibbonImage(image,slot).then(()=>{button.classList.add('cover-ready');return image;}).catch(error=>{status.textContent=portfolio.subtitle+' · 点击查看作品集';throw error;}));
  button.addEventListener('click',event=>{if(event.detail===0)select(index,button);});
  return button;
 });
 const coversReady=Promise.all(imageLoads);coversReady.catch(()=>{});
 let renderer,loading=false,failed=false,frame=0,last=0,w=0,h=0,offset=0,direction=1,speed=1,paused=false,focused=false,visible=false,mouse=null,rows=[],pending=null;
 const state={width:1,mx:0,my:0,pullX:0,pullY:0,hover:0,arch:0,ripple:0,rippleX:0,rippleY:0,shiftX:0};
 let lockupRenderer,lockupLoading=false,lockupFailed=false,motion={shiftX:0,direction:1},wheel={vx:0,at:0},touch=null,dragged=false;
 const lower={mx:0,my:0,pullX:0,pullY:0,hover:0,arch:0,shiftX:0};
 const pause=document.querySelector('#pause-ribbon'),reverse=document.querySelector('#reverse-ribbon');
 pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'PLAY ▷':'PAUSE Ⅱ';wake();});
 function setDirection(value){direction=value;motion.direction=value;reverse.textContent=direction===1?'FLOW →':'FLOW ←';reverse.setAttribute('aria-label',direction===1?'Flowing left to right. Reverse direction':'Flowing right to left. Reverse direction');}
 reverse.addEventListener('click',()=>{setDirection(-direction);wake();});
 function measure(){const box=host.getBoundingClientRect();if(box.width&&box.height){w=box.width;h=box.height;state.width=w;}lockupRenderer?.refresh();wake();}
 function select(index,button,point){
  if(pending||!isActive())return;
  if(reduce.matches){onSelect(imageSlots[index].id,button);return;}
  const r=rows.find(r=>r.index===index&&r.x+r.width>0&&r.x<w);
  state.rippleX=point?.x??((r?.x||0)+(r?.width||w)/2);
  state.rippleY=point?.y??(r?.height||h)*.4;
  pending={index,button,at:performance.now()};document.body.classList.add('portfolio-departing');host.setAttribute('aria-busy','true');wake();
 }
 function tick(now){
  frame=0;if(!isActive()||document.hidden||!visible){last=0;return;}
  if(!w||!h){measure();return;}
  const dt=Math.min(now-(last||now-16),40);last=now;state.width=w;
  const box=host.getBoundingClientRect(),px=mouse?mouse.x-box.left:state.mx,py=mouse?mouse.y-box.top:state.my;
  const moving=mouse&&now-mouse.at<70&&!reduce.matches;
  motion=stepPortfolioMotion(motion,now-wheel.at<80?wheel.vx:(moving?mouse.vx:0),dt,reduce.matches);
  if(motion.direction!==direction)setDirection(motion.direction);
  state.shiftX=motion.shiftX;
  const previousHit=mouse&&hitRibbon(px,py,rows,state),hover=Boolean(previousHit);
  speed=pending?0:smoothValue(speed,(paused||hover||focused||reduce.matches)?0:direction,dt,160);
  const cw=w<=600?w*.72:w*.29;offset=loopPosition(offset+dt*.042*speed,0,cw*imageSlots.length);
  rows=ribbonLayout(w,h,offset,imageSlots);
  state.mx=smoothValue(state.mx,px,dt,80);state.my=smoothValue(state.my,py,dt,80);
  state.hover=smoothValue(state.hover,hover&&!reduce.matches?1:0,dt,150);
  state.pullX=smoothValue(state.pullX,moving?mouse.vx*.65:0,dt,150);
  state.pullY=smoothValue(state.pullY,moving?mouse.vy*1.2:0,dt,150);
  state.arch=smoothValue(state.arch,reduce.matches?0:clamp(-box.top/innerHeight,0,1)*35,dt,200);
  state.ripple=pending?(now-pending.at)/1000:0;
  const exit=pending?portfolioExit(now-pending.at):null;
  state.exit=exit;state.selectedIndex=pending?.index;
  lockup.style.opacity=exit?String(exit.surround):'';
  buttons.forEach((button,index)=>{
   const r=rows.find(r=>r.index===index&&r.x+r.width>0&&r.x<w)||rows.find(r=>r.index===index);
   button.style.left=(r?.x??-2000)+'px';button.style.width=(r?.width??cw)+'px';button.style.height=(r?.height??h)+'px';
   button.classList.toggle('is-hovered',hover&&previousHit.index===index);
   button.style.opacity=exit?String(index===pending.index?exit.selected:exit.others):'';
  });
  if(renderer)renderer.render(rows,state,h);
  else if(!loading&&!failed){loading=true;createRibbonRenderer(host,imageSlots,coversReady).then(r=>{renderer=r;wake();}).catch(error=>{failed=true;console.warn('Using accessible image ribbon fallback:',error);});}
  host.style.cursor=hover?'pointer':'';
  const lb=lockup.getBoundingClientRect(),lx=mouse?mouse.x-lb.left:lower.mx,ly=mouse?mouse.y-lb.top:lower.my;
  const over=mouse&&lx>=0&&lx<=lb.width&&ly>=0&&ly<=lb.height;
  lower.mx=smoothValue(lower.mx,lx,dt,80);lower.my=smoothValue(lower.my,ly,dt,80);
  lower.hover=smoothValue(lower.hover,over&&!reduce.matches?1:0,dt,150);
  lower.pullX=smoothValue(lower.pullX,moving?mouse.vx*.65:0,dt,150);lower.pullY=smoothValue(lower.pullY,moving?mouse.vy*1.2:0,dt,150);
  lower.shiftX=state.shiftX;lower.arch=smoothValue(lower.arch,reduce.matches?0:clamp(-lb.top/innerHeight,0,1)*24,dt,200);
  if(lockupRenderer)lockupRenderer.render(lower);
  else if(!lockupLoading&&!lockupFailed){lockupLoading=true;createLockupRenderer(lockup).then(r=>{lockupRenderer=r;wake();}).catch(error=>{lockupFailed=true;console.warn('Using accessible logo fallback:',error);});}
  section.dataset.flow=direction===1?'right':'left';section.dataset.shift=state.shiftX.toFixed(2);
  if(pending&&exit.done){const selected=pending;pending=null;onSelect(imageSlots[selected.index].id,selected.button);return;}
  if(!reduce.matches||pending)frame=requestAnimationFrame(tick);
 }
 function wake(){if(!frame&&isActive()&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
 function move(event){if(!fine.matches||event.pointerType==='touch')return;
  const now=performance.now(),old=mouse,recent=old&&now-old.at<140;
  mouse={x:event.clientX,y:event.clientY,vx:recent?pointerVelocity(event.clientX-old.x,now-old.at):0,vy:recent?pointerVelocity(event.clientY-old.y,now-old.at):0,at:now};wake();
 }
 section.addEventListener('pointerenter',move);section.addEventListener('pointermove',move,{passive:true});section.addEventListener('pointerleave',()=>{mouse=null;wake();});
 section.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)&&Math.abs(event.deltaX)>1){wheel={vx:clamp(event.deltaX,-42,42),at:performance.now()};wake();}},{passive:true});
 section.addEventListener('pointerdown',event=>{dragged=false;if(event.pointerType==='touch')touch={x:event.clientX,y:event.clientY,at:performance.now()};},{passive:true});
 section.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'||!touch)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y,now=performance.now();if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>3){dragged=true;wheel={vx:pointerVelocity(dx,now-touch.at),at:now};wake();}touch={x:event.clientX,y:event.clientY,at:now};},{passive:true});
 section.addEventListener('pointerup',()=>{touch=null;});section.addEventListener('pointercancel',()=>{touch=null;});
 host.addEventListener('click',event=>{if(!event.detail||dragged)return;const box=host.getBoundingClientRect(),hitState=renderer?state:{...state,hover:0,pullX:0,pullY:0,arch:0,ripple:0,shiftX:0},x=event.clientX-box.left,y=event.clientY-box.top,hit=hitRibbon(x,y,rows,hitState);if(hit)select(hit.index,buttons[hit.index],inversePoint(x,y,hitState));});
 host.addEventListener('focusin',event=>{
  focused=event.target.matches(':focus-visible');
  if(focused){const i=buttons.indexOf(event.target);if(i>=0){const cw=w<=600?w*.72:w*.29;offset=loopPosition(-i*cw+cw*.35,0,cw*imageSlots.length);}}
  wake();
 });
 host.addEventListener('focusout',event=>{if(!host.contains(event.relatedTarget)){focused=false;wake();}});
 const sizes=new ResizeObserver(measure);sizes.observe(host);sizes.observe(lockup);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake();});intersection.observe(section);
 const stage=new MutationObserver(()=>{if(!isActive()){pending=null;state.ripple=0;}measure();});stage.observe(document.body,{attributes:true,attributeFilter:['data-stage','class']});
 function resetExit(){pending=null;state.ripple=0;state.exit=null;state.selectedIndex=undefined;mouse=null;lockup.style.opacity='';buttons.forEach(b=>b.style.opacity='');host.removeAttribute('aria-busy');document.body.classList.remove('portfolio-departing');}
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;resetExit();});
 window.addEventListener('pageshow',()=>{resetExit();wake();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetExit();wake();});reduce.addEventListener('change',wake);
 return {refresh:measure};
}
