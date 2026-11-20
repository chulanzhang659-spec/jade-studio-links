import {smoothValue,pointerVelocity,clamp} from './elastic-field.mjs';

// Keep the original SVG glyphs and ink filter at the screen's native resolution.
// Move glyph positions, never replace the type with a stretched bitmap.
export function createManifestoMotion(section,{isActive}){
 const host=section.querySelector('#manifesto-type');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 let rows=[],mouse=null,frame=0,last=0,visible=true,disposed=false;
 const state={x:0,y:0,vx:0,vy:0,hover:0,arch:0};
 const active=()=>!disposed&&isActive()&&visible&&!document.hidden&&!reduce.matches;
 function restore(){
  for(const row of rows){
   row.node.setAttribute('x',row.x);row.node.setAttribute('y',row.y);
   row.node.setAttribute('text-anchor','middle');
  }
 }
 function refresh(){
  restore();host.style.opacity='';
  rows=[...host.querySelectorAll('text')].map(node=>({
   node,x:node.getAttribute('x'),y:node.getAttribute('y'),
   points:Array.from({length:node.getNumberOfChars()},(_,i)=>{
    const p=node.getStartPositionOfChar(i);return {x:p.x,y:p.y};
   }),box:node.getBBox()
  }));
  mouse=null;Object.assign(state,{vx:0,vy:0,hover:0,arch:0});wake();
 }
 function tick(now){
  frame=0;if(!active()){restore();last=0;return;}
  const dt=Math.min(now-(last||now-16),50);last=now;
  const rect=section.getBoundingClientRect();
  const px=mouse?mouse.x-rect.left:state.x,py=mouse?mouse.y-rect.top:state.y;
  let distance=Infinity;
  for(const {box:b} of rows)distance=Math.min(distance,Math.hypot(Math.max(b.x-px,0,px-b.x-b.width),Math.max(b.y-py,0,py-b.y-b.height)));
  const moving=mouse&&now-mouse.at<65;
  const targets={x:px,y:py,vx:moving?mouse.vx:0,vy:moving?mouse.vy:0,hover:mouse?clamp(1-distance/90,0,1):0,arch:clamp(-rect.top/(rect.height*.55),0,1)*Math.min(30,rect.height*.04)};
  let unsettled=false;
  for(const key of Object.keys(targets)){
   state[key]=smoothValue(state[key],targets[key],dt,120);
   if(Math.abs(state[key]-targets[key])>.002)unsettled=true;else state[key]=targets[key];
  }
  if(!state.hover&&!state.arch&&Math.abs(state.vx)+Math.abs(state.vy)<.002)restore();
  else for(const row of rows){
   const xs=[],ys=[];
   for(const p of row.points){
    const dx=p.x-state.x,dy=p.y-state.y;
    const local=Math.exp(-((dx/170)**2+(dy/100)**2)*1.5)*state.hover;
    xs.push((p.x+clamp(state.vx*.5,-3,3)*local).toFixed(3));
    ys.push((p.y+clamp(state.vy*.5,-3,3)*local-4*local-Math.sin(p.x/rect.width*Math.PI)*state.arch).toFixed(3));
   }
   row.node.setAttribute('text-anchor','start');
   row.node.setAttribute('x',xs.join(' '));row.node.setAttribute('y',ys.join(' '));
  }
  if(unsettled||moving)frame=requestAnimationFrame(tick);else last=0;
 }
 function wake(){if(active()&&!frame)frame=requestAnimationFrame(tick);}
 function move(event){
  if(!active()||!fine.matches||event.pointerType==='touch')return;
  const now=performance.now(),old=mouse,recent=old&&now-old.at<140;
  mouse={x:event.clientX,y:event.clientY,vx:recent?pointerVelocity(event.clientX-old.x,now-old.at):0,vy:recent?pointerVelocity(event.clientY-old.y,now-old.at):0,at:now};
  if(!old){const rect=section.getBoundingClientRect();state.x=mouse.x-rect.left;state.y=mouse.y-rect.top;}
  wake();
 }
 function reset(){mouse=null;wake();}
 function sync(){
  if(active())wake();else{cancelAnimationFrame(frame);frame=0;last=0;mouse=null;restore();}
 }
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(section);
 const stages=new MutationObserver(sync);stages.observe(document.body,{attributes:true,attributeFilter:['data-stage','class']});
 section.addEventListener('pointermove',move,{passive:true});section.addEventListener('pointerleave',reset);
 window.addEventListener('scroll',wake,{passive:true});window.addEventListener('blur',reset);
 document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
 return {refresh,dispose(){disposed=true;cancelAnimationFrame(frame);restore();observer.disconnect();stages.disconnect();section.removeEventListener('pointermove',move);section.removeEventListener('pointerleave',reset);window.removeEventListener('scroll',wake);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',sync);reduce.removeEventListener('change',sync);}};
}
