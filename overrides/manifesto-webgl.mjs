import {smoothValue,pointerVelocity,clamp} from './elastic-field.mjs';

export function createManifestoMotion(section,{isActive}){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const host=section.querySelector('#manifesto-type');
 let THREE,renderer,mesh,texture,loading,frame=0,previous=0,visible=true,disposed=false,w=0,h=0,boxes=[],mouse=null;
 const state={x:0,y:0,vx:0,vy:0,hover:0,proximity:0,arch:0};
 const sceneObjects={};
 const active=()=>!disposed&&isActive()&&!reduce.matches&&!document.hidden&&visible;
 async function setup(){
  THREE=await import('./assets/vendor/three.module.min.js');if(disposed)return;
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.domElement.className='manifesto-elastic-canvas';renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost',()=>{cancelAnimationFrame(frame);frame=0;renderer.domElement.hidden=true;host.style.opacity='';});
  section.append(renderer.domElement);
  sceneObjects.scene=new THREE.Scene();sceneObjects.camera=new THREE.Camera();
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,
   uniforms:{uMap:{value:null},uSize:{value:new THREE.Vector2(1,1)},uMouse:{value:new THREE.Vector2()},uPull:{value:new THREE.Vector2()},uHover:{value:0},uNear:{value:0},uArch:{value:0}},
   vertexShader:`varying vec2 vUv;
    uniform vec2 uSize,uMouse,uPull; uniform float uHover,uNear,uArch;
    void main(){
     vUv=uv;vec2 p=vec2((position.x+.5)*uSize.x,(.5-position.y)*uSize.y);
     vec2 delta=p-uMouse;vec2 radius=vec2(clamp(uSize.x*.13,90.,210.),90.);
     float local=exp(-dot(delta/radius,delta/radius)*1.5);
     p+=uPull*local*uNear;
     p+=delta*vec2(.24,.38)*local*uHover;
     p.y-=sin(clamp(p.x/uSize.x,0.,1.)*3.14159265)*uArch;
     gl_Position=vec4(p.x/uSize.x*2.-1.,1.-p.y/uSize.y*2.,0.,1.);
    }`,
   fragmentShader:`uniform sampler2D uMap;varying vec2 vUv;void main(){gl_FragColor=texture2D(uMap,vUv);}`});
  mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1,180,100),material);mesh.frustumCulled=false;sceneObjects.scene.add(mesh);
 }
 function refresh(){
  if(!isActive()||disposed)return;
  if(!renderer){if(!loading)loading=setup().then(refresh).catch(error=>{console.warn('Using static manifesto:',error);host.style.opacity='';});return;}
  const rect=section.getBoundingClientRect();w=rect.width;h=rect.height;if(!w||!h)return;
  const source=document.createElement('canvas'),ratio=Math.min(devicePixelRatio||1,2,2400/w);
  source.width=Math.ceil(w*ratio);source.height=Math.ceil(h*ratio);
  const ctx=source.getContext('2d');ctx.scale(ratio,ratio);ctx.textAlign='center';ctx.fillStyle='#474329';boxes=[];
  for(const node of host.querySelectorAll('text')){
   const style=getComputedStyle(node),size=parseFloat(style.fontSize),x=Number(node.getAttribute('x')),y=Number(node.getAttribute('y'));
   ctx.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;ctx.fillText(node.textContent,x,y);
   const m=ctx.measureText(node.textContent);boxes.push({left:x-m.width/2,right:x+m.width/2,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent});
  }
  // Bake missing ink once: no expensive noise filter in the animation loop.
  ctx.globalCompositeOperation='destination-out';let seed=17;
  for(const b of boxes)for(let i=0;i<Math.ceil((b.right-b.left)*(b.bottom-b.top)/100);i++){seed=(seed*16807)%2147483647;const x=b.left+(seed%10000)/10000*(b.right-b.left);seed=(seed*16807)%2147483647;const y=b.top+(seed%10000)/10000*(b.bottom-b.top);ctx.fillRect(x,y,.6+(i%3)*.35,1+(i%4)*.4);}
  texture?.dispose();texture=new THREE.CanvasTexture(source);texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
  mesh.material.uniforms.uMap.value=texture;mesh.material.uniforms.uSize.value.set(w,h);renderer.setSize(w,h,false);
  mouse=null;Object.assign(state,{vx:0,vy:0,hover:0,proximity:0,arch:0});wake();
 }
 function tick(now){
  frame=0;const dt=Math.min(now-(previous||now-16),50);previous=now;
  if(!renderer)return;
  if(!active()){renderer.domElement.hidden=true;host.style.opacity='';previous=0;return;}
  const rect=section.getBoundingClientRect(),px=mouse?mouse.x-rect.left:state.x,py=mouse?mouse.y-rect.top:state.y;
  let distance=Infinity;
  for(const b of boxes)distance=Math.min(distance,Math.hypot(Math.max(b.left-px,0,px-b.right),Math.max(b.top-py,0,py-b.bottom)));
  const near=mouse?clamp(1-distance/90,0,1):0,hover=mouse?clamp(1-distance/18,0,1):0;
  state.x=smoothValue(state.x,px,dt,65);state.y=smoothValue(state.y,py,dt,65);
  state.proximity=smoothValue(state.proximity,near,dt,140);state.hover=smoothValue(state.hover,hover,dt,150);
  const moving=mouse&&now-mouse.at<65;
  state.vx=smoothValue(state.vx,moving?mouse.vx:0,dt,140);state.vy=smoothValue(state.vy,moving?mouse.vy:0,dt,140);
  state.arch=smoothValue(state.arch,clamp(-rect.top/(h*.55),0,1)*Math.min(100,h*.13),dt,180);
  const u=mesh.material.uniforms;u.uMouse.value.set(state.x,state.y);u.uPull.value.set(state.vx*1.45,state.vy*1.55);u.uNear.value=state.proximity;u.uHover.value=state.hover;u.uArch.value=state.arch;
  renderer.render(sceneObjects.scene,sceneObjects.camera);
  renderer.domElement.hidden=false;host.style.opacity='0';
  frame=requestAnimationFrame(tick);
 }
 function wake(){if(renderer&&!frame&&active()){previous=0;frame=requestAnimationFrame(tick);}}
 function move(event){
  if(!active()||!fine.matches||event.pointerType==='touch')return;
  const now=performance.now(),old=mouse,recent=old&&now-old.at<140;
  mouse={x:event.clientX,y:event.clientY,vx:recent?pointerVelocity(event.clientX-old.x,now-old.at):0,vy:recent?pointerVelocity(event.clientY-old.y,now-old.at):0,at:now};
  if(!old){const rect=section.getBoundingClientRect();state.x=event.clientX-rect.left;state.y=event.clientY-rect.top;}
  wake();
 }
 function reset(){mouse=null;wake();}
 function sync(){if(active())wake();else{cancelAnimationFrame(frame);frame=0;previous=0;mouse=null;if(renderer)renderer.domElement.hidden=true;host.style.opacity='';}}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(section);
 const stages=new MutationObserver(()=>{if(isActive()&&!renderer)refresh();sync();});stages.observe(document.body,{attributes:true,attributeFilter:['data-stage','class']});
 section.addEventListener('pointermove',move,{passive:true});section.addEventListener('pointerdown',move,{passive:true});section.addEventListener('pointerleave',reset);
 window.addEventListener('blur',reset);window.addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
 return {refresh,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();stages.disconnect();texture?.dispose();mesh?.geometry.dispose();mesh?.material.dispose();renderer?.dispose();renderer?.domElement.remove();host.style.opacity='';section.removeEventListener('pointermove',move);section.removeEventListener('pointerdown',move);section.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset);window.removeEventListener('scroll',wake);document.removeEventListener('visibilitychange',sync);reduce.removeEventListener('change',sync);}};
}
