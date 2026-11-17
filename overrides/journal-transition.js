import {entryLayout,entrySVG} from './journal-typography.mjs?v=jade-type-5';
let active;
export function playCompression({image,sourceBounds,onComplete=()=>{},reducedMotion=false}){
 active?.cancel();
 const layer=document.createElement('div'),canvas=document.createElement('canvas'),type=document.createElement('div');
 const chinese=document.querySelector('.manifesto-chinese').cloneNode(true);
 chinese.style.opacity='0';
 layer.className='compression';layer.setAttribute('aria-hidden','true');type.className='compression-final';type.style.opacity='1';layer.append(canvas,type,chinese);document.body.append(layer);
 const ctx=canvas.getContext('2d');let frame,ended=false;const start=performance.now();
 const initial=sourceBounds??{x:innerWidth*.25,y:innerHeight*.25,width:innerWidth*.5,height:innerHeight*.5};
 function size(){const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 size();window.addEventListener('resize',size);
 function stop(){if(ended)return;ended=true;cancelAnimationFrame(frame);window.removeEventListener('resize',size);layer.remove();if(active===controller)active=null;}
 const controller={cancel:stop};active=controller;
 function draw(now){
  if(ended)return;const ms=reducedMotion?1400:now-start,w=innerWidth,h=innerHeight,p=entryLayout(ms,w,h,initial);
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#BCB893';ctx.fillRect(0,0,w,h);
  if(image&&p.image.width>0&&p.image.height>0)ctx.drawImage(image,p.image.x,p.image.y,p.image.width,p.image.height);
  type.innerHTML=entrySVG(p,w,h);
  chinese.style.top=`${p.chinese.top}px`;
  chinese.style.transform=`translateY(${p.chinese.offsetY}px)`;
  chinese.style.opacity=String(p.chinese.opacity);
  if(ms>=1400){stop();onComplete();return;}frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);return controller;
}
