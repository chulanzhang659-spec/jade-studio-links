import * as THREE from './assets/vendor/three.module.min.js';
import {normalizePointerVelocity,advanceHoverSweep,sweepDecision,stepSweepTransition,idleSweepExpired,permittedSweep,rolledPaperState} from './wave-drag.mjs?v=4';
import {pageFrame} from './page-frame.mjs';
import {createPaperPreview} from './portfolio-catalog.mjs?v=15';
import {createGallery} from './river/arc-gallery.js?v=21';
import {loadArtworks} from './river/artwork.js?v=4';
import './correspondence-type.mjs';
import {createRiverEnding} from './river-ending.mjs?v=18';

const stage=document.querySelector('#wave-stage');
const canvas=document.querySelector('#wave-canvas');
const catalogPaper=document.querySelector('#project-catalog');
const DOM_WAVE=true;
const portfolios=window.JADE_CONTENT.portfolios;
const params=new URLSearchParams(location.search);
const requestedProject=params.get('project')||params.get('from');
const initialPage=Math.max(0,portfolios.findIndex(project=>project.id===requestedProject));
const paperView=document.querySelector('#paper-view');
const riverView=document.querySelector('#river-view');
let riverGallery,riverArtworks=[],view='paper';
let carriedPaper=null;
const riverEnding=createRiverEnding(document.querySelector('.river-contact'));
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const frameParam=new URLSearchParams(location.search).get('frame');
const debugProgress=frameParam===null?null:Math.max(-1,Math.min(1,Number(frameParam)||0));
const PAGE_WIDTH=5.9;
const PAGE_HEIGHT=7.5;

const scene=new THREE.Scene();
scene.background=new THREE.Color('#BCB893');
const camera=new THREE.PerspectiveCamera(34,1,.1,50);
camera.position.set(0,.08,10.4);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;

function mulberry32(seed){
 return()=>{let value=seed+=0x6D2B79F5;value=Math.imul(value^value>>>15,value|1);value^=value+Math.imul(value^value>>>7,value|61);return((value^value>>>14)>>>0)/4294967296;};
}

function loadImage(url){
 return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url;});
}

function cover(ctx,image,x,y,width,height){
 const sourceRatio=image.width/image.height,targetRatio=width/height;
 let sx=0,sy=0,sw=image.width,sh=image.height;
 if(sourceRatio>targetRatio){sw=image.height*targetRatio;sx=(image.width-sw)/2;}
 else{sh=image.width/targetRatio;sy=(image.height-sh)/2;}
 ctx.drawImage(image,sx,sy,sw,sh,x,y,width,height);
}

function line(ctx,x1,y1,x2,y2,width=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=width;ctx.stroke();}

function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=5){
 const glyphs=[...text];let lineText='',lineIndex=0;
 for(const glyph of glyphs){
  const candidate=lineText+glyph;
  if(ctx.measureText(candidate).width>maxWidth&&lineText){ctx.fillText(lineText,x,y+lineIndex*lineHeight);lineText=glyph;lineIndex+=1;if(lineIndex>=maxLines)return;}
  else lineText=candidate;
 }
 if(lineIndex<maxLines)ctx.fillText(lineText,x,y+lineIndex*lineHeight);
}

const CONTENT_SCALE=.5;
const coverBounds={x:(1400-1230*CONTENT_SCALE)/2,y:470,width:1230*CONTENT_SCALE,height:705*CONTENT_SCALE};
function paperTexture({variant,project}){
 const surface=document.createElement('canvas');
 surface.width=1400;surface.height=1780;
 const ctx=surface.getContext('2d');
 const lettering=document.createElement('canvas');
 lettering.width=surface.width;lettering.height=surface.height;
 const inkContext=lettering.getContext('2d');
 // A temporary ink plate is used only to make the worn print. It is baked
 // into the paper before upload; the renderer has exactly one UV surface.
 const inkRuns=[];
 ctx.fillText=function(text,x,y){
  inkContext.font=this.font.replace(/([\d.]+)px/,(_,size)=>`${Number(size)*CONTENT_SCALE}px`);inkContext.fillStyle=this.fillStyle;
  inkContext.textAlign=this.textAlign;inkContext.textBaseline=this.textBaseline;
  if(text==='JADE STUDIO'){
   const j=inkContext.measureText('J'),a=inkContext.measureText('A');
   const ratio=(a.actualBoundingBoxAscent+a.actualBoundingBoxDescent)/(j.actualBoundingBoxAscent+j.actualBoundingBoxDescent);
   inkContext.save();
   inkContext.translate(x,y-a.actualBoundingBoxAscent);
   inkContext.scale(1,ratio);
   inkContext.fillText('J',0,j.actualBoundingBoxAscent);
   inkContext.restore();
   inkContext.fillText(text.slice(1),x+j.width,y);
  }else inkContext.fillText(text,x,y);
  inkRuns.push({text,x,y,font:inkContext.font});
 };
 const ink='#BCB893',paper=variant===0?'#e9dfc4':'#ded5bb';
 ctx.fillStyle=paper;ctx.fillRect(0,0,surface.width,surface.height);
 const random=mulberry32(7301+variant*97);
 for(let index=0;index<18000;index+=1){
  const alpha=random()*.055;
  ctx.fillStyle=`rgba(71,67,41,${alpha})`;
  const size=random()*1.8+.25;
  ctx.fillRect(random()*surface.width,random()*surface.height,size,size);
 }
 // Preserve the broad newspaper grid and full-width rules for future content.
 ctx.fillStyle=ink;ctx.strokeStyle=ink;
 ctx.font='38px JadeHeadline, serif';ctx.fillText('JADE STUDIO',78,92);
 ctx.font='16px JadeType, monospace';ctx.fillText(`SELECTED WORK / 0${variant+1} — 0${portfolios.length}`,1010,88);
 line(ctx,75,120,1325,120,5);line(ctx,75,130,1325,130,1);

 ctx.font='18px JadeType, monospace';ctx.fillText('JADE STUDIO / CREATIVE ATELIER',78,185);
 let titleSize=128;ctx.font=`700 ${titleSize}px JadeHeadline, serif`;
 while(ctx.measureText(project.subtitle).width>1230){titleSize-=2;ctx.font=`700 ${titleSize}px JadeHeadline, serif`;}
 ctx.fillText(project.subtitle,70,325);
 ctx.font='36px JadeType, monospace';
 ctx.fillText(project.title,76,385);
 line(ctx,75,420,1325,420,2);

 const {x:imageX,y:imageY,width:imageWidth,height:imageHeight}=coverBounds;
 ctx.fillStyle=variant%2===0?'#BCB893':'#474329';ctx.fillRect(imageX,imageY,imageWidth,imageHeight);
 const typeInk=variant%2===0?'#e9dfc4':'#BCB893';ctx.fillStyle=typeInk;
 ctx.font='18px JadeType, monospace';ctx.fillText('SECONDARY INDEX / 二级标题',imageX+34,imageY+48);
 const types=project.types||[];
 types.forEach((type,index)=>{
  const row=index%3,column=Math.floor(index/3),x=imageX+34+column*285,y=imageY+105+row*76;
  ctx.strokeStyle=typeInk;ctx.lineWidth=1;ctx.strokeRect(x,y-31,250,50);
  ctx.font='24px JadeType, monospace';ctx.fillStyle=typeInk;ctx.fillText(type,x+16,y+4);
 });
 ctx.font='14px JadeType, monospace';ctx.fillText('作品封面与项目内容见报纸正文',imageX+34,imageY+imageHeight-28);

 line(ctx,75,1260,1325,1260,2);
 ctx.font='42px JadeType, monospace';
 wrapText(ctx,project.body,78,1340,620,57,6);
 ctx.font='23px JadeType, monospace';
 wrapText(ctx,[...project.types,...project.tags].join(' / '),790,1332,520,44,7);
 line(ctx,75,1675,1325,1675,5);line(ctx,75,1685,1325,1685,1);
 ctx.font='16px JadeType, monospace';ctx.fillText('JADE CREATIVE ATELIER',1080,1735);

 const wear=mulberry32(2903+variant);
 inkContext.save();inkContext.globalCompositeOperation='destination-out';
 for(const run of inkRuns){
  inkContext.font=run.font;
  let x=run.x;
  for(const glyph of run.text){
   const metrics=inkContext.measureText(glyph),size=parseFloat(run.font.match(/([\d.]+)px/)[1]);
   const height=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
   const chinese=/\p{Script=Han}/u.test(glyph);
   const marks=Math.max(4,Math.round(metrics.width*height/(chinese?100:180)));
   for(let n=0;n<marks;n++){
    const fleck=Math.max(.65,size*(.009+wear()*.016));
    inkContext.fillStyle=`rgba(0,0,0,${.45+wear()*.5})`;
    inkContext.fillRect(x+wear()*metrics.width,run.y-metrics.actualBoundingBoxAscent+wear()*height,fleck,fleck*(.5+wear()));
   }
   x+=metrics.width;
  }
 }
 inkContext.restore();
 ctx.drawImage(lettering,0,0);
 const coverSurface=document.createElement('canvas');
 coverSurface.width=1230;coverSurface.height=705;
 coverSurface.getContext('2d').drawImage(surface,coverBounds.x,coverBounds.y,coverBounds.width,coverBounds.height,0,0,1230,705);
 const full=new THREE.CanvasTexture(surface);
 full.colorSpace=THREE.SRGBColorSpace;
 full.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 return {full,cover:coverSurface};
}

const vertexShader=`
 uniform float uProgress;
 uniform float uDirection;
 uniform float uPointerY;
 uniform float uVelocity;
 uniform float uReducedMotion;
 uniform float uWidth;
 uniform vec2 uMouse;
 uniform vec2 uPull;
 varying vec2 vUv;
 varying float vBend;
 varying float vWrinkle;
 varying float vVisible;
 varying float vCreaseDistance;
 void main(){
  vUv=uv;
  float progress=clamp(uProgress,0.0,1.0);
  float crease=1.0-progress;
  float pageU=uDirection<0.0?uv.x:1.0-uv.x;
  float crestRipple=(sin((uv.y-uPointerY)*9.0)*.012+sin((uv.y-uPointerY)*22.0)*.004)*sin(progress*3.14159265);
  crease=clamp(crease+crestRipple,0.0,1.0);
  float distance=max(0.0,crease-pageU);
  float trail=.18+.82*exp(-distance*3.6);
  float speed=min(.55,abs(uVelocity)*.09);
  float wrinkle=sin(distance*31.0+(uv.y-uPointerY)*10.5)*.58
   +sin(distance*67.0-(uv.y-uPointerY)*23.0)*.27
   +sin(distance*14.0+(uv.y-uPointerY)*41.0)*.15;
  float bindingGuard=smoothstep(0.0,.065,uv.x)*smoothstep(0.0,.065,1.0-uv.x);
  float remaining=smoothstep(0.0,.22,1.0-progress);
  float bend=progress*trail*(.55+speed*.25)*bindingGuard*remaining*(1.0-uReducedMotion);
  vec2 delta=uv-uMouse;
  float local=exp(-dot(delta/vec2(.28,.21),delta/vec2(.28,.21))*1.5);
  float amount=min(progress*3.0,1.0)*remaining*(1.0-uReducedMotion);
  float edge=sin(uv.x*3.14159265);
  vec3 p=position;
  // All ink, images, rules and paper share these same physical vertices.
  // Pin both outer edges, so reversing cannot pull an extra strip outside.
  p.x+=uDirection*amount*.055*(.45+.55*sin(uv.y*3.14159265))*edge*uWidth;
  p.y+=amount*.034*sin(uv.x*5.8+uDirection*.7)*edge*uWidth;
  // Radial swelling stretches the printed surface itself, never a text overlay.
  p.xy+=(uPull*local*.55+delta*vec2(.34,.42)*local)*amount*bindingGuard*uWidth;
  p.z+=local*amount*bindingGuard*.10*uWidth;
  p.x+=uDirection*wrinkle*bend*.012*uWidth;
  p.y+=wrinkle*bend*.014*uWidth;
  // Keep every trough above the next sheet; neither texture can poke through.
  p.z+=(.08+wrinkle*.07)*bend*uWidth;
  // The separate binding remains; the printed sheet is exactly flat at rest.
  p.z+=exp(-pow((uv.x-.015)/.018,2.0))*.045*uWidth*amount;
  vBend=bend;
  vWrinkle=wrinkle;
  vVisible=crease-pageU;
  vCreaseDistance=distance;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
 }
`;

const fragmentShader=`
 uniform sampler2D uFrontMap;
 uniform float uExit;
 uniform float uProgress;
 uniform float uReducedMotion;
 varying vec2 vUv;
 varying float vBend;
 varying float vWrinkle;
 varying float vVisible;
 varying float vCreaseDistance;
 void main(){
  if(uExit<.5){if(vVisible<0.0||uProgress>=.999)discard;}
  vec4 paper=texture2D(uFrontMap,vUv);
  float gutter=exp(-pow((vUv.x-.025)/.013,2.0));
  paper.rgb*=1.0-gutter*.16;
  float wrinkleLight=1.0+vWrinkle*vBend*.25-abs(vWrinkle)*vBend*.045;
  float creaseShade=1.0-exp(-vCreaseDistance*72.0)*.2*vBend;
  paper.rgb*=wrinkleLight*creaseShade;
  float reducedAlpha=mix(1.0,1.0-clamp(uProgress,0.0,1.0),uReducedMotion);
  gl_FragColor=vec4(paper.rgb,paper.a*reducedAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }
`;

function createTurningPage(frontTexture){
 const geometry=new THREE.PlaneGeometry(PAGE_WIDTH,PAGE_HEIGHT,96,40);
 const material=new THREE.ShaderMaterial({
  uniforms:{
   uFrontMap:{value:frontTexture.full},uExit:{value:0},uMouse:{value:new THREE.Vector2(.45,.84)},uPull:{value:new THREE.Vector2()},uProgress:{value:0},uDirection:{value:-1},
   uPointerY:{value:.5},uVelocity:{value:0},uReducedMotion:{value:reducedMotion?1:0},uWidth:{value:PAGE_WIDTH}
  },
  vertexShader,fragmentShader,side:THREE.FrontSide,transparent:true,depthWrite:true
 });
 const mesh=new THREE.Mesh(geometry,material);
 mesh.renderOrder=2;
 return mesh;
}

function createUnderPage(texture){
 const geometry=new THREE.PlaneGeometry(PAGE_WIDTH,PAGE_HEIGHT,1,1);
 const material=new THREE.MeshBasicMaterial({map:texture.full,transparent:reducedMotion,opacity:1,depthWrite:true});
 const mesh=new THREE.Mesh(geometry,material);
 mesh.position.z=-.002;
 mesh.renderOrder=1;
 return mesh;
}

let motion={progress:debugProgress??0,velocity:0};
let turningPage;
let underPage;
let spine;
let textures=[];
let anchorX=null,lastPointerX=null,lastPointerAt=0,lastMoveAt=-Infinity,completedAt=-Infinity;
let hoverSweep=null,pageIndex=initialPage;
let dragPointer=null,dragConsumed=false,grabBlend=0;
let wheelSweep=null,wheelPosition=0,lastWheelAt=-Infinity;
let pointerY=.5,pointerHistory=[],settling=false,settleTarget=0,lastDirection=debugProgress?Math.sign(debugProgress):-1;
let buttonSweep=false;
 let pointerX=.45,inkPointerY=.84,pullX=0,pullY=0,lastPointerY=null;
 const smoothMouse=new THREE.Vector2(.45,.84),smoothPull=new THREE.Vector2();

// Keep the live newspaper at native resolution throughout a page turn.
// Reveal the next sheet without rasterizing text/video through an SVG filter.
let underPaper=null,underPaperIndex=-1;
function renderDomWave(progress,direction){
 const active=progress>.001;
 stage.classList.toggle('is-wave-active',active);
 const nextIndex=pageIndex+(direction<0?1:-1);
 if(active&&nextIndex>=0&&nextIndex<portfolios.length&&underPaperIndex!==nextIndex){
  underPaper?.remove();underPaper=createPaperPreview(portfolios[nextIndex]);underPaperIndex=nextIndex;stage.prepend(underPaper);
 }
 if(!active){clearDomWave();return;}
 catalogPaper.style.clipPath=nextIndex>=0&&nextIndex<portfolios.length?(direction<0?`inset(0 ${progress*100}% 0 0)`:`inset(0 0 0 ${progress*100}%)`):'';
}
function clearDomWave(){
 underPaper?.remove();underPaper=null;underPaperIndex=-1;catalogPaper.style.clipPath='';
 catalogPaper.style.filter='';catalogPaper.style.transform='';catalogPaper.style.transformOrigin='';
 catalogPaper.classList.remove('is-wave-turning');stage.classList.remove('is-wave-active','is-wave-forward','is-wave-reverse','is-dragging');
}
function domWaveTurn(direction){
 if(view!=='paper'||settling||(direction>0&&pageIndex===0))return;
 buttonSweep=true;settling=true;settleTarget=direction;lastDirection=direction;
}
document.querySelector('.wave-turn-next').addEventListener('click',()=>{
 domWaveTurn(-1);
});
document.querySelector('.wave-turn-prev').addEventListener('click',()=>{
 domWaveTurn(1);
});

function resize(){
 const rect=stage.getBoundingClientRect();
 renderer.setSize(rect.width,rect.height,false);
 camera.aspect=rect.width/rect.height;
 const portrait=innerWidth<680;
 camera.fov=portrait?49:34;
 camera.position.z=portrait?11.8:10.4;
 camera.updateProjectionMatrix();
 const frame=pageFrame(rect.width,rect.height,{
  fov:camera.fov,distance:camera.position.z,pageWidth:PAGE_WIDTH,pageHeight:PAGE_HEIGHT,coverage:portrait?.96:.92
 });
 for(const mesh of [turningPage,underPage]){
  if(!mesh)continue;
  mesh.scale.set(frame.scaleX,frame.scaleY,1);
  mesh.position.y=frame.centerY;
 }
 if(underPage)underPage.position.z=-.002;
 updateSpine();
}

function createSpine(){
 const surface=document.createElement('canvas');surface.width=128;surface.height=8;
 const ctx=surface.getContext('2d');
 const gradient=ctx.createLinearGradient(0,0,128,0);
 for(const [stop,color] of [[0,'#696047'],[.14,'#b7ab88'],[.24,'#f4ebd0'],[.38,'#b1a786'],[.5,'#f4ebd0'],[.66,'#ddd2b4'],[.84,'#8c8163'],[1,'#c1b696']])gradient.addColorStop(stop,color);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,128,8);
 const map=new THREE.CanvasTexture(surface);map.colorSpace=THREE.SRGBColorSpace;
 const geometry=new THREE.PlaneGeometry(.12,PAGE_HEIGHT,12,1);
 const positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++)positions.setZ(i,Math.sin((positions.getX(i)/.12+.5)*Math.PI)*.075);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map}));mesh.renderOrder=3;return mesh;
}

function updateSpine(){
 if(!spine||!turningPage)return;
 const roll=rolledPaperState(pageIndex,motion.progress+grabBlend);
 document.querySelector('.paper-shell')?.style.setProperty('--roll-width',`${24+roll.pages*3}px`);
 const scale=turningPage.scale;
 spine.scale.set(scale.x*roll.width/.12,scale.y,1);
 // Grow into the left margin; the right lip stays against the paper edge.
 spine.position.set((-PAGE_WIDTH/2+.03-roll.width/2)*scale.x,turningPage.position.y,.12);
 spine.position.x+=turningPage.position.x;
 const positions=spine.geometry.attributes.position;
 for(let i=0;i<positions.count;i++)positions.setZ(i,Math.sin((positions.getX(i)/.12+.5)*Math.PI)*roll.depth);
 positions.needsUpdate=true;
 const layerCount=Math.min(12,Math.floor(roll.pages));
 if(spine.userData.layers!==layerCount){
  const surface=spine.material.map.image,ctx=surface.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,128,0);
  for(const [stop,color] of [[0,'#696047'],[.18,'#b7ab88'],[.40,'#f4ebd0'],[.72,'#ddd2b4'],[1,'#8c8163']])gradient.addColorStop(stop,color);
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,8);
  for(let i=0;i<=layerCount;i++){
   const x=104-i*80/(layerCount+1);
   ctx.fillStyle='#746a4d';ctx.fillRect(x,0,1,8);
   ctx.fillStyle='#f4ebd0';ctx.fillRect(x+1,0,1.5,8);
  }
  spine.material.map.needsUpdate=true;spine.userData.layers=layerCount;
 }
 stage.dataset.rollWidth=roll.width.toFixed(5);
 stage.dataset.rolledPages=roll.pages.toFixed(3);
}

stage.addEventListener('pointerdown',event=>{
 if(view!=='paper'||event.button!==0||debugProgress!==null)return;
 if(event.target.closest?.('a,button,video,summary,input,select,textarea'))return;
 // A deliberate grab takes precedence over a hover-triggered auto turn.
 // Preserve its visible shape briefly while establishing a fresh drag origin.
 grabBlend+=motion.progress;
 motion={progress:0,velocity:0};settling=false;settleTarget=0;
 dragPointer=event.pointerId;dragConsumed=false;
 hoverSweep=advanceHoverSweep(null,event.clientX,stage.clientWidth);
 lastPointerX=event.clientX;lastPointerAt=performance.now();
 if(event.isTrusted)stage.setPointerCapture(event.pointerId);
 stage.classList.add('is-dragging');
});
function endDrag(event){
 if(event.pointerId!==dragPointer)return;
 dragPointer=null;dragConsumed=false;stage.classList.remove('is-dragging');
 if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
 if(!(settling&&Math.abs(settleTarget)===1)&&Math.abs(motion.progress)>.001){settling=true;settleTarget=0;}
 hoverSweep=advanceHoverSweep(null,event.clientX,stage.clientWidth);
}
stage.addEventListener('pointerup',endDrag);
stage.addEventListener('pointercancel',endDrag);

stage.addEventListener('pointermove',event=>{
 if(view!=='paper')return;
 if(buttonSweep)return;
 if(dragPointer===null&&event.target.closest?.('a,button,video,summary,input,select,textarea')){
  if(!settling&&Math.abs(motion.progress)>.001){settling=true;settleTarget=0;}
  hoverSweep=null;lastPointerX=null;lastPointerY=null;pullX=0;pullY=0;return;
 }
 const rect=stage.getBoundingClientRect();
 const now=performance.now();
 pointerY=Math.min(1,Math.max(0,1-(event.clientY-rect.top)/rect.height));
 if(turningPage){
  const point=new THREE.Vector3((event.clientX-rect.left)/rect.width*2-1,pointerY*2-1,.5).unproject(camera);
  const ray=point.sub(camera.position).normalize();
  point.copy(camera.position).addScaledVector(ray,-camera.position.z/ray.z);
  turningPage.worldToLocal(point);
  pointerX=point.x/PAGE_WIDTH+.5;inkPointerY=point.y/PAGE_HEIGHT+.5;
 }
 if(debugProgress!==null)return;
 if(dragConsumed)return;
 if(lastPointerX===null){hoverSweep=advanceHoverSweep(null,event.clientX,rect.width);lastPointerX=event.clientX;lastPointerAt=now;lastMoveAt=now;return;}
 const deltaX=event.clientX-lastPointerX;
 const velocity=normalizePointerVelocity(deltaX,Math.max(1,now-lastPointerAt),rect.width);
 pullX=Math.max(-.10,Math.min(.10,velocity*.055));
 pullY=lastPointerY===null?0:Math.max(-.05,Math.min(.05,-(event.clientY-lastPointerY)/Math.max(8,now-lastPointerAt)*.012));
 lastPointerY=event.clientY;
 pointerHistory.push({x:event.clientX,time:now,velocity});
 if(pointerHistory.length>6)pointerHistory.shift();

 if(settling&&Math.abs(settleTarget)===1){
  hoverSweep=advanceHoverSweep(null,event.clientX,rect.width);
  lastPointerX=event.clientX;lastPointerAt=now;lastMoveAt=now;return;
 }
 // Returning-to-rest is always interruptible; it must never swallow hover input.
 if(settling){settling=false;settleTarget=0;}
 if(Math.abs(deltaX)>.15){
  hoverSweep=advanceHoverSweep(hoverSweep,event.clientX,rect.width);
  const dragging=dragPointer===event.pointerId&&(event.buttons&1)!==0;
  const allowed=permittedSweep(hoverSweep.progress,dragging,pageIndex);
  if(hoverSweep.progress>0&&allowed===0){
   if(Math.abs(motion.progress)>.001){settling=true;settleTarget=0;}
   hoverSweep=advanceHoverSweep(null,event.clientX,rect.width);
   lastPointerX=event.clientX;lastPointerAt=now;return;
  }
  motion={progress:allowed,velocity:motion.velocity*.54+velocity*.46};
  stage.dataset.sweep=motion.progress.toFixed(4);
  stage.dataset.buttons=String(event.buttons);
  if(Math.abs(motion.progress)>.002)lastDirection=Math.sign(motion.progress);
  lastMoveAt=now;
  const decision=sweepDecision(motion.progress);
  if(decision.complete){settling=true;settleTarget=decision.target;dragConsumed=dragging;motion.velocity=Math.max(-2.4,Math.min(2.4,motion.velocity));}
 }
 lastPointerX=event.clientX;lastPointerAt=now;
});
stage.addEventListener('pointerleave',()=>{
 if(dragPointer!==null)return;
 if(!settling&&Math.abs(motion.progress)>.001){settling=true;settleTarget=0;}
 hoverSweep=null;anchorX=null;lastPointerX=null;lastPointerY=null;pullX=0;pullY=0;
});
stage.addEventListener('wheel',event=>{
 if(view!=='paper'||event.target.closest?.('video,.catalog-tabs'))return;
 const horizontal=event.shiftKey&&Math.abs(event.deltaX)<1?event.deltaY:event.deltaX;
 if(Math.abs(horizontal)<.5||(!event.shiftKey&&Math.abs(horizontal)<Math.abs(event.deltaY)))return;
 event.preventDefault();
 if(debugProgress!==null||(settling&&Math.abs(settleTarget)===1))return;
 if(horizontal>0)return; // Returning is deliberately reserved for a drag.
 const now=performance.now(),width=stage.clientWidth;
 if(now-lastWheelAt>900){wheelPosition=0;wheelSweep=advanceHoverSweep(null,0,width);}
 const unit=event.deltaMode===1?16:event.deltaMode===2?width:1;
 wheelPosition+=horizontal*unit;
 wheelSweep=advanceHoverSweep(wheelSweep,wheelPosition,width);
 settling=false;settleTarget=0;
 motion={progress:wheelSweep.progress,velocity:normalizePointerVelocity(horizontal*unit,Math.max(16,now-lastWheelAt),width)};
 lastWheelAt=now;lastMoveAt=now;lastDirection=Math.sign(motion.progress)||lastDirection;
 stage.dataset.sweep=motion.progress.toFixed(4);stage.dataset.input='wheel';
 const decision=sweepDecision(motion.progress);
 if(decision.complete){settling=true;settleTarget=decision.target;}
},{passive:false});
addEventListener('resize',resize,{passive:true});
addEventListener('popstate',()=>{
 const requested=new URLSearchParams(location.search).get('project');
 const index=portfolios.findIndex(project=>project.id===requested);
 if(index>=0){pageIndex=index;stage.dataset.pageIndex=String(index);grabBlend=0;resetToRest(performance.now());}
});

function setTextureRoles(direction){
 if(!turningPage||!underPage)return;
 const turningTexture=textures[pageIndex];
 const nextIndex=Math.max(0,Math.min(textures.length-1,pageIndex+(direction<0?1:-1)));
 const underTexture=textures[nextIndex].full;
 underPage.visible=!isFinalExit(direction);
 if(turningPage.material.uniforms.uFrontMap.value!==turningTexture.full){
  turningPage.material.uniforms.uFrontMap.value=turningTexture.full;
 }
 if(underPage.material.map!==underTexture){
  underPage.material.map=underTexture;
  underPage.material.needsUpdate=true;
 }
}

function isFinalExit(direction){return direction<0&&pageIndex===textures.length-1;}

function updatePages(){
 if(!turningPage||!underPage)return;
 const displayedProgress=Math.max(-1,Math.min(1,motion.progress+grabBlend));
 const direction=displayedProgress===0?lastDirection:Math.sign(displayedProgress);
 setTextureRoles(direction);
 const visualProgress=Math.abs(displayedProgress);
 stage.classList.toggle('is-turning',visualProgress>.002);
 stage.dataset.renderProgress=visualProgress.toFixed(4);
 if(DOM_WAVE){renderDomWave(visualProgress,direction);return;}
 const uniforms=turningPage.material.uniforms;
 uniforms.uProgress.value=visualProgress;
 uniforms.uExit.value=isFinalExit(direction)?1:0;
 turningPage.position.x=0;
 uniforms.uDirection.value=direction;
 uniforms.uPointerY.value=pointerY;
 uniforms.uVelocity.value=motion.velocity;
 uniforms.uMouse.value.copy(smoothMouse);uniforms.uPull.value.copy(smoothPull);
 if(reducedMotion)underPage.material.opacity=Math.abs(motion.progress);
}

function resetToRest(now,clearCooldown=false){
 motion={progress:0,velocity:0};settling=false;settleTarget=0;
 anchorX=lastPointerX;lastMoveAt=now;pointerHistory=[];
 hoverSweep=lastPointerX===null?null:advanceHoverSweep(null,lastPointerX,stage.clientWidth);
 wheelSweep=null;wheelPosition=0;lastWheelAt=-Infinity;
 if(clearCooldown)completedAt=-Infinity;
 buttonSweep=false;
 if(DOM_WAVE)clearDomWave();
 stage.classList.remove('is-turning');
}

function finalizeTransition(now){
 if(isFinalExit(settleTarget)){resetToRest(now);joinPaperToRiver();return;}
 pageIndex=Math.max(0,pageIndex+(settleTarget<0?1:-1));
 stage.dataset.pageIndex=String(pageIndex);
 stage.dataset.project=portfolios[pageIndex].subtitle;
 stage.dataset.lastTurn=settleTarget<0?'left':'right';
 completedAt=now;
 resetToRest(now);
 dispatchEvent(new CustomEvent('jade:portfoliochange',{detail:{projectId:portfolios[pageIndex].id,pageIndex}}));
}

const contactShortcut=document.querySelector('#contact-shortcut');
contactShortcut.addEventListener('click',()=>{
 if(view!=='paper'||!riverGallery)return;
 resetToRest(performance.now());
 joinPaperToRiver();
});
function showRiver(){
 contactShortcut.hidden=true;
 view='river';stage.dataset.view='river';
 paperView.hidden=true;riverView.hidden=false;
 scrollTo({top:0,behavior:'instant'});
 riverGallery?.refresh();
 if(!reducedMotion)riverView.animate([{opacity:0},{opacity:1}],{duration:650,easing:'ease-out'});
 document.querySelector('.study-header a').setAttribute('aria-label','返回作品集');
}

async function joinPaperToRiver(){
 if(DOM_WAVE){
  // Preserve the newspaper-to-river flight using the CURRENT live content.
  const bounds=catalogPaper.getBoundingClientRect(),source=document.createElement('div');
  source.className='paper-join';source.style.cssText=`left:${bounds.left}px;top:${bounds.top}px;width:${bounds.width}px;height:${bounds.height}px;overflow:hidden`;
  source.inert=true;source.setAttribute('aria-hidden','true');
  const paper=catalogPaper.cloneNode(true);paper.removeAttribute('id');paper.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  paper.style.cssText='position:absolute;inset:0;transform:none;filter:none;pointer-events:none';
  const art=riverArtworks.find(artwork=>Number(artwork.dataset.portfolioIndex)===pageIndex),coverCanvas=document.createElement('canvas');
  coverCanvas.width=art.width;coverCanvas.height=art.height;coverCanvas.getContext('2d').drawImage(art,0,0);
  coverCanvas.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;opacity:0;z-index:3';
  source.append(paper,coverCanvas);document.body.append(source);paper.scrollTop=catalogPaper.scrollTop;
  clearDomWave();showRiver();view='joining';stage.dataset.view='joining';stage.dataset.paperJoined='false';
  carriedPaper=riverGallery.carryPaper(art);
  const target=carriedPaper.element.getBoundingClientRect();
  if(!reducedMotion){
   paper.animate([{opacity:1},{opacity:0}],{duration:550,fill:'forwards'});
   coverCanvas.animate([{opacity:0},{opacity:1}],{duration:650,fill:'forwards'});
   await source.animate([
    {transform:'translate(0,0) scale(1,1)'},
    {transform:`translate(${target.left-bounds.left}px,${target.top-bounds.top}px) scale(${target.width/bounds.width},${target.height/bounds.height})`}
   ],{duration:1150,easing:'cubic-bezier(.22,.8,.22,1)',fill:'forwards'}).finished;
  }
  source.remove();carriedPaper.release();view='river';stage.dataset.view='river';stage.dataset.paperJoined='true';return;
 }
 // Keep the printed cover pixels; paper margins and copy leave during the flight.
 turningPage.updateMatrixWorld(true);
 const bounds=stage.getBoundingClientRect();
 const project=(x,y)=>{
  const point=turningPage.localToWorld(new THREE.Vector3(x,y,0)).project(camera);
  return {x:bounds.left+(point.x+1)*bounds.width/2,y:bounds.top+(1-point.y)*bounds.height/2};
 };
 const tl=project(-PAGE_WIDTH/2,PAGE_HEIGHT/2),br=project(PAGE_WIDTH/2,-PAGE_HEIGHT/2);
 const source=document.createElement('div');source.className='paper-join';
 source.style.cssText=`left:${tl.x}px;top:${tl.y}px;width:${br.x-tl.x}px;height:${br.y-tl.y}px`;
 const paper=document.createElement('canvas'),surface=textures[pageIndex].full.image;
 paper.width=surface.width;paper.height=surface.height;paper.getContext('2d').drawImage(surface,0,0);
 const coverCanvas=document.createElement('canvas'),cover=textures[pageIndex].cover;
 coverCanvas.width=cover.width;coverCanvas.height=cover.height;
 coverCanvas.getContext('2d').drawImage(cover,0,0);
 coverCanvas.style.cssText=`position:absolute;left:${coverBounds.x/1400*100}%;top:${coverBounds.y/1780*100}%;width:${coverBounds.width/1400*100}%;height:${coverBounds.height/1780*100}%`;
 const roll=document.createElement('i');roll.className='paper-join-roll';roll.style.width=`${rolledPaperState(pageIndex,0).width/PAGE_WIDTH*100}%`;
 source.append(paper,coverCanvas,roll);document.body.append(source);
 showRiver();view='joining';stage.dataset.view='joining';
 carriedPaper=riverGallery.carryPaper(textures[pageIndex].cover);
 const target=carriedPaper.element.getBoundingClientRect();
 if(!reducedMotion){
  roll.animate([{opacity:1},{opacity:0}],{duration:420,fill:'forwards'});
  paper.animate([{opacity:1},{opacity:0}],{duration:500,fill:'forwards'});
  const scale=target.width/((br.x-tl.x)*coverBounds.width/1400);
  const dx=target.left-tl.x-(br.x-tl.x)*coverBounds.x/1400*scale;
  const dy=target.top-tl.y-(br.y-tl.y)*coverBounds.y/1780*scale;
  const flight=source.animate([
   {transform:'translate(0,0) scale(1)',clipPath:'inset(0%)'},
   {transform:`translate(${dx}px,${dy}px) scale(${scale})`,clipPath:`inset(${coverBounds.y/1780*100}% ${(1400-coverBounds.x-coverBounds.width)/1400*100}% ${(1780-coverBounds.y-coverBounds.height)/1780*100}% ${coverBounds.x/1400*100}%)`}
  ],{duration:1150,easing:'cubic-bezier(.22,.8,.22,1)',fill:'forwards'});
  await flight.finished;
 }
 source.remove();carriedPaper.release();
 view='river';stage.dataset.view='river';stage.dataset.paperJoined='true';
}
addEventListener('wheel',event=>{if(view==='joining')event.preventDefault();},{passive:false});
addEventListener('touchmove',event=>{if(view==='joining')event.preventDefault();},{passive:false});

function returnToPaper(index=portfolios.length-1){
 const returnURL=new URL(location.href);returnURL.searchParams.delete('view');history.replaceState(null,'',returnURL);
 contactShortcut.hidden=false;
 carriedPaper?.remove();carriedPaper=null;riverEnding.reset();
 view='paper';pageIndex=index;stage.dataset.view='paper';stage.dataset.pageIndex=String(index);
 stage.dataset.project=portfolios[pageIndex].subtitle;
 riverView.hidden=true;paperView.hidden=false;
 grabBlend=0;dragPointer=null;dragConsumed=false;lastPointerX=null;lastPointerY=null;
 lastDirection=-1;resetToRest(performance.now());
 dispatchEvent(new CustomEvent('jade:portfoliochange',{detail:{projectId:portfolios[pageIndex].id,pageIndex}}));
 scrollTo({top:0,behavior:'instant'});resize();
}
document.querySelector('.study-header a').addEventListener('click',event=>{
 if(view==='joining'){event.preventDefault();return;}
 if(view==='river'){event.preventDefault();returnToPaper(pageIndex);}
});

let previous=performance.now();
function animate(now){
 const delta=Math.min(.04,(now-previous)/1000||1/60);previous=now;
 if(view!=='paper'){requestAnimationFrame(animate);return;}
 grabBlend*=Math.exp(-delta/.06);
 if(Math.abs(grabBlend)<.0001)grabBlend=0;
 smoothMouse.lerp(new THREE.Vector2(pointerX,inkPointerY),1-Math.exp(-delta/ .065));
 const moving=now-lastMoveAt<80;
 smoothPull.lerp(new THREE.Vector2(moving?pullX:0,moving?pullY:0),1-Math.exp(-delta/.14));
 if(debugProgress===null&&settling){
  motion=stepSweepTransition(motion,settleTarget,settleTarget===0?delta*1.65:delta);
  if(settleTarget===0&&Math.abs(motion.progress)<.001)resetToRest(now);
  if(Math.abs(settleTarget)===1&&Math.abs(motion.progress-settleTarget)<.001)finalizeTransition(now);
 }else if(debugProgress===null&&dragPointer===null&&Math.abs(motion.progress)>.001&&idleSweepExpired(lastMoveAt,now)){
  settling=true;settleTarget=0;
 }
 if(view==='paper'){updatePages();updateSpine();renderer.render(scene,camera);}
 requestAnimationFrame(animate);
}

async function init(){
 await Promise.all([document.fonts.load('700 38px JadeHeadline'),document.fonts.load('38px JadeHeadline'),document.fonts.load('23px JadeType')]);
 await document.fonts.ready;
 textures=portfolios.map((project,variant)=>paperTexture({variant,project}));
 turningPage=createTurningPage(textures[pageIndex]);
 underPage=createUnderPage(textures[Math.min(pageIndex+1,textures.length-1)]);
 spine=createSpine();
 scene.add(underPage,turningPage,spine);
 resize();
 renderer.render(scene,camera);
 await Promise.all([document.fonts.load('54px "La Belle Aurore"'),document.fonts.load('13px "Special Elite"')]);
 const artworks=await loadArtworks();
 riverArtworks=artworks;
 riverGallery=createGallery(document.querySelector('#river-gallery'),{artworks,onSelect:(category,artwork)=>{if(view==='river')returnToPaper(Number(artwork.dataset.portfolioIndex));},onPaperSelect:index=>{if(view==='river')returnToPaper(index);}});
 stage.dataset.ready='true';stage.dataset.pageIndex=String(pageIndex);stage.dataset.pageCount=String(textures.length);stage.dataset.view='paper';
 stage.dataset.project=portfolios[pageIndex].subtitle;
 contactShortcut.disabled=false;
 if(params.get('view')==='contact'){
  joinPaperToRiver();
 }
 requestAnimationFrame(animate);
 if(new URLSearchParams(location.search).get('check')==='hover'){
  const {checkHover}=await import('./wave-hover-check.mjs?v=15');checkHover(stage);
 }
 if(new URLSearchParams(location.search).get('check')==='journey'){
  const {checkJourney}=await import('./wave-journey-check.mjs?v=20');checkJourney(stage);
 }
 if(params.get('check')==='contact'){
  const {checkContact}=await import('./contact-shortcut-check.mjs?v=24');checkContact(stage);
 }
 if(params.get('check')==='media'){
  const {checkMedia}=await import('./media-playback-check.mjs');checkMedia();
 }
 if(params.get('check')==='layout'){
  const {checkLayout}=await import('./catalog-layout-check.mjs');checkLayout(stage);
 }
}

init().catch(error=>{
 console.error(error);
 stage.insertAdjacentHTML('beforeend','<p class="study-error">预览加载失败，请刷新页面。</p>');
});
