import * as THREE from './assets/vendor/three.module.min.js';
import {ENVELOPE_POSE,pointerPose,easePose} from './envelope-pointer.mjs';
import {sealState,SEAL_DURATION} from './envelope-sequence.mjs';

const HEADLINE='Libre Caslon Condensed',TYPE='Special Elite',CHINESE='Zhaohua Typewriter';
const INITIAL=ENVELOPE_POSE;
const random=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function canvas(w=1024,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function inkText(ctx,text,x,y,size,{font=HEADLINE,align='center',weight=700,alignedJ=false,color='#171712'}={}){
 const layer=canvas(ctx.canvas.width,ctx.canvas.height),c=layer.getContext('2d');
 c.font=`${weight} ${size}px "${font}"`;c.fillStyle=color;c.textAlign=align;
 // Same .015em tracking as the opening, not the compressed earlier Contact heading.
 c.letterSpacing=font===HEADLINE?`${size*.015}px`:'0px';
 if(alignedJ&&text.startsWith('J')){
  const full=c.measureText(text).width,j=c.measureText('J'),cap=c.measureText('H');
  const left=align==='center'?x-full/2:x;
  const ratio=cap.actualBoundingBoxAscent/(j.actualBoundingBoxAscent+j.actualBoundingBoxDescent);
  c.textAlign='left';c.save();c.translate(left,y);c.scale(1,ratio);
  c.fillText('J',0,-j.actualBoundingBoxDescent);c.restore();
  c.fillText(text.slice(1),left+j.width,y);
 }else c.fillText(text,x,y);
 const rnd=random(17);c.globalCompositeOperation='destination-out';
 for(let i=0;i<18000;i++){c.fillStyle=`rgba(0,0,0,${.25+rnd()*.75})`;const px=rnd()*layer.width,py=rnd()*layer.height;c.fillRect(px,py,.5+rnd()*4,.5+rnd()*5);}
 ctx.drawImage(layer,0,0);
}
function paperNoise(ctx){const rnd=random(29);for(let i=0;i<45000;i++){ctx.fillStyle=rnd()>.5?'#fff2':'#766b4920';ctx.fillRect(rnd()*ctx.canvas.width,rnd()*ctx.canvas.height,1,1);}}
let artworkPromise;
export function prepareEnvelopeArt(){
 if(artworkPromise)return artworkPromise;
 artworkPromise=(async()=>{
  await Promise.all([document.fonts.load(`700 80px "${HEADLINE}"`),document.fonts.load(`20px "${TYPE}"`),document.fonts.load(`300 20px "${CHINESE}"`)]);
  const image=new Image();image.src='assets/jade-logo-source.png';await image.decode();
  const symbol=canvas(512,420),s=symbol.getContext('2d');s.drawImage(image,115,35,700,575,0,0,512,420);
  const pixels=s.getImageData(0,0,512,420);
  for(let i=0;i<pixels.data.length;i+=4){const a=Math.min(255,(255-(pixels.data[i]+pixels.data[i+1]+pixels.data[i+2])/3)*4);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;pixels.data[i+3]=a;}
  s.putImageData(pixels,0,0);
  const relief=canvas(512),r=relief.getContext('2d');r.fillStyle='#808080';r.fillRect(0,0,512,512);
  function motif(offset,color){r.save();r.translate(offset,offset);r.strokeStyle=color;r.lineWidth=4;
   for(const inset of [12,23]){r.beginPath();r.moveTo(256,inset);r.bezierCurveTo(345,80,430,100,500-inset,256);r.bezierCurveTo(430,412,345,432,256,512-inset);r.bezierCurveTo(167,432,82,412,inset,256);r.bezierCurveTo(82,100,167,80,256,inset);r.stroke();}
   r.setLineDash([2,7]);r.beginPath();r.ellipse(256,256,174,218,0,0,Math.PI*2);r.stroke();r.setLineDash([]);
   for(let k=0;k<20;k++){const a=k*Math.PI/10,cx=256+Math.cos(a)*130,cy=256+Math.sin(a)*165;r.save();r.translate(cx,cy);r.rotate(a);r.beginPath();r.ellipse(0,0,19,6,.6,0,Math.PI*2);r.stroke();r.beginPath();r.ellipse(0,-12,12,4,-.6,0,Math.PI*2);r.stroke();r.restore();}
   r.restore();
  }
  motif(0,'#d5d5d5');r.globalAlpha=.65;r.drawImage(symbol,171,186,170,140);r.globalAlpha=1;
  const albedo=canvas(512),a=albedo.getContext('2d'),height=r.getImageData(0,0,512,512),color=a.createImageData(512,512);
  // Tone-on-tone paper, with the relief's tiny oblique highlights; no printed white logos.
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,p=(((y+511)%512)*512+(x+511)%512)*4,n=(((y+1)%512)*512+(x+1)%512)*4;const light=(height.data[p]-height.data[n])*.2-(height.data[i]-128)*.12;[150,145,96].forEach((v,k)=>color.data[i+k]=v+light);color.data[i+3]=255;}
  a.putImageData(color,0,0);paperNoise(a);
  const letter=canvas(2048,800),p=letter.getContext('2d');p.fillStyle='#e9dfc4';p.fillRect(0,0,2048,800);paperNoise(p);
  const blank=canvas(1024,800),b=blank.getContext('2d');b.fillStyle='#e9dfc4';b.fillRect(0,0,1024,800);paperNoise(b);
  const labels=canvas(1600,180),l=labels.getContext('2d');
  inkText(l,'TEL:',35,100,70,{align:'left',font:TYPE,weight:400});inkText(l,'EMAIL:',820,100,70,{align:'left',font:TYPE,weight:400});
  l.strokeStyle='#17171299';l.lineWidth=2;for(const [x1,x2] of [[250,700],[1100,1560]]){l.beginPath();l.moveTo(x1,110);l.lineTo(x2,110);l.stroke();}
  return {relief,albedo,letter,blank,labels,symbol};
 })().catch(error=>{artworkPromise=null;throw error;});return artworkPromise;
}

export async function mountEnvelope3D(host,{interactive=true,letterHidden=false,sealed=true}={}){
 const art=await prepareEnvelopeArt();if(!host.isConnected)throw new Error('Envelope detached');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.setClearColor(0x474329,0);renderer.domElement.className='envelope-webgl';renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50),group=new THREE.Group();scene.add(group);
 const textures=[];
 function texture(source,color=true){const t=new THREE.CanvasTexture(source);if(color)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;}
 const map=texture(art.albedo),bumpMap=texture(art.relief,false);for(const t of [map,bumpMap]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);}
 const stock=new THREE.MeshStandardMaterial({map,bumpMap,bumpScale:.11,roughness:.92,metalness:0,color:0xffffff});
 const edge=new THREE.MeshStandardMaterial({color:0x797448,roughness:1});
 function panel(points,z,material=stock){
  const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,steps:1});
  const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/6+.5,pos.getY(i)/6+.5);
  const mesh=new THREE.Mesh(geo,[material,edge]);mesh.position.z=z;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
 }
 // One stock/material on both faces. The real hinge closes only after insertion.
 panel([[-3,-2.7],[3,-2.7],[3,.7],[-3,.7]],-.17);
 const flap=panel([[-3,.7],[3,.7],[.16,3.03],[0,3.09],[-.16,3.03]],-.18);
 flap.geometry.translate(0,-.7,0);flap.position.set(0,.7,-.17);
 const letterGroup=new THREE.Group();group.add(letterGroup);
 // Instance-local lettering: resizing a transition must not mutate another envelope.
 const letterCanvas=canvas(2048,800);
 const letterTexture=texture(letterCanvas),blankTexture=texture(art.blank);
 const paperEdge=new THREE.MeshStandardMaterial({color:0xe9dfc4,roughness:1});
 const paperFront=new THREE.MeshBasicMaterial({map:letterTexture});
 const paperBack=new THREE.MeshBasicMaterial({map:blankTexture});
 const letterMesh=new THREE.Mesh(new THREE.BoxGeometry(5.3,2.1,.025),[paperEdge,paperEdge,paperEdge,paperEdge,paperFront,paperBack]);
 letterMesh.position.set(0,0,.025);letterMesh.castShadow=true;letterGroup.add(letterMesh);
 panel([[-3,-2.7],[0,-.72],[-3,.7]],.18);
 panel([[3,-2.7],[3,.7],[0,-.72]],.185);
 panel([[-3,-2.7],[3,-2.7],[.24,-.74],[-.24,-.74]],.235);
 // Bottom and side folds enclose the cavity, with small but real paper thickness.
 for(const x of [-2.988,2.988]){const side=new THREE.Mesh(new THREE.BoxGeometry(.025,3.4,.36),stock);side.position.set(x,-1,.02);group.add(side);}
 const bottom=new THREE.Mesh(new THREE.BoxGeometry(6,.025,.38),stock);bottom.position.set(0,-2.695,.02);group.add(bottom);
 function decal(source,w,h,x,y,z,back=false){const material=new THREE.MeshStandardMaterial({map:texture(source),transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1});const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);m.position.set(x,y,z);if(back)m.rotation.y=Math.PI;group.add(m);return m;}
 decal(art.labels,5,.5625,0,-2.28,.29);
 // Thick poured wax with the original ribbon symbol raised into its surface.
 const wax=new THREE.Group(),waxShape=new THREE.Shape();
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2,r=.54+.024*Math.sin(a*7)+.012*Math.cos(a*11);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?waxShape.lineTo(x,y):waxShape.moveTo(x,y);}waxShape.closePath();
 const waxMaterial=new THREE.MeshPhysicalMaterial({color:0x49452b,roughness:.34,clearcoat:.35,clearcoatRoughness:.32,metalness:0});
 const waxBody=new THREE.Mesh(new THREE.ExtrudeGeometry(waxShape,{depth:.13,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:4,steps:1}),waxMaterial);waxBody.castShadow=true;waxBody.receiveShadow=true;wax.add(waxBody);
 const waxRim=new THREE.Mesh(new THREE.TorusGeometry(.425,.026,12,80),waxMaterial);waxRim.position.z=.16;wax.add(waxRim);
 const logoSample=canvas(129,105),lc=logoSample.getContext('2d');lc.drawImage(art.symbol,0,0,129,105);const logoPixels=lc.getImageData(0,0,129,105).data;
 const logoGeometry=new THREE.PlaneGeometry(.66,.54,128,104),lp=logoGeometry.attributes.position;
 for(let i=0;i<lp.count;i++){const x=i%129,y=Math.floor(i/129),alpha=logoPixels[(y*129+x)*4+3]/255;lp.setZ(i,.15+alpha*.055);}logoGeometry.computeVertexNormals();
 const waxLogo=new THREE.Mesh(logoGeometry,new THREE.MeshPhysicalMaterial({map:texture(art.symbol),color:0x77704a,alphaTest:.45,roughness:.36,clearcoat:.25,clearcoatRoughness:.4}));waxLogo.castShadow=true;waxLogo.receiveShadow=true;wax.add(waxLogo);
 wax.position.set(0,-1.25,.35);group.add(wax);
 scene.add(new THREE.AmbientLight(0xffffff,2.2));
 const key=new THREE.DirectionalLight(0xfff6df,.85);key.position.set(-4,6,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:20});key.shadow.bias=-.0003;key.shadow.normalBias=.018;scene.add(key);
 const fill=new THREE.DirectionalLight(0xfff6df,.85);fill.position.set(4,6,-6);scene.add(fill);
 let pose={...INITIAL},targetPose={...INITIAL},frame=0,alive=true,lastTime=0,animation=null;
 let sequenceTime=sealed?SEAL_DURATION:0,hideLetter=letterHidden;
 function applySequence(){const state=sealState(sequenceTime);letterGroup.position.y=state.letterY;letterGroup.visible=state.letterVisible&&!hideLetter;flap.rotation.x=state.flapAngle;flap.position.z=state.flapZ;wax.visible=state.sealScale>0;wax.scale.setScalar(Math.max(.001,state.sealScale));}
 function render(time=performance.now()){
  frame=0;if(!alive)return;
  pose=easePose(pose,targetPose,lastTime?(time-lastTime)/1000:1/60);
  if(animation){sequenceTime=Math.min(SEAL_DURATION,time-animation.start);if(sequenceTime===SEAL_DURATION){const done=animation.resolve;animation=null;done();}}
  applySequence();
  group.rotation.set(pose.x,pose.y,pose.z,'YXZ');renderer.render(scene,camera);
  const moving=['x','y','z'].some(k=>Math.abs(pose[k]-targetPose[k])>.00005);
  if(animation||moving)frame=requestAnimationFrame(render);lastTime=time;
 }
 function requestRender(){if(alive&&!frame){lastTime=performance.now();frame=requestAnimationFrame(render);}}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(0,-.35,Math.max(13.5,8.5/camera.aspect));camera.lookAt(0,-.35,0);camera.updateProjectionMatrix();
  // Same responsive nominal font size as .entry-title, converted to texture pixels.
  // Evaluate at the resting view, never resize the type while the envelope rotates.
  const vw=window.innerWidth,cssSize=vw<=760?Math.max(32,Math.min(57,vw*.08)):Math.max(45,Math.min(91,vw*.054));
  const projectedHeight=2.1*h/(2*camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
  const p=letterCanvas.getContext('2d');p.clearRect(0,0,2048,800);p.drawImage(art.letter,0,0);
  let size=cssSize*800/projectedHeight;p.font=`700 ${size}px "${HEADLINE}"`;p.letterSpacing=`${size*.015}px`;
  size*=Math.min(1,1780/p.measureText('Contact Us').width);
  inkText(p,'Contact Us',1024,400+size*.33,size,{color:'#BCB893'});letterTexture.needsUpdate=true;requestRender();}
 const observer=new ResizeObserver(resize);observer.observe(host);
 const onMove=e=>{if(e.movementX===0&&e.movementY===0)return;const rect=host.getBoundingClientRect();targetPose=pointerPose((e.clientX-rect.left)/rect.width*2-1,(e.clientY-rect.top)/rect.height*2-1);requestRender();};
 const reset=()=>{targetPose={...INITIAL};requestRender();};
 const onKey=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetPose.y+=e.key==='ArrowLeft'?-.3:.3;requestRender();}if(e.key==='Home')reset();};
 let interactionsEnabled=false;
 function setInteractive(enabled){if(enabled===interactionsEnabled)return;interactionsEnabled=enabled;const method=enabled?'addEventListener':'removeEventListener';host[method]('pointermove',onMove);host[method]('pointerleave',reset);host[method]('keydown',onKey);}
 setInteractive(interactive);
 host.append(renderer.domElement);host.classList.add('webgl-ready');resize();render();
 function letterQuad(){applySequence();group.updateMatrixWorld(true);camera.updateMatrixWorld();const bounds=host.getBoundingClientRect();return [[-2.65,1.05],[2.65,1.05],[2.65,-1.05],[-2.65,-1.05]].map(([x,y])=>{const p=letterMesh.localToWorld(new THREE.Vector3(x,y,.0125)).project(camera);return{x:bounds.left+(p.x+1)*bounds.width/2,y:bounds.top+(1-p.y)*bounds.height/2};});}
 function dispose(){if(!alive)return;alive=false;cancelAnimationFrame(frame);observer.disconnect();setInteractive(false);const materials=new Set(),geometries=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();host.classList.remove('webgl-ready');if(animation){animation.resolve();animation=null;}}
 return {renderer,letterQuad,letterImage:()=>letterCanvas.toDataURL(),dispose,setInteractive,insertAndSeal:()=>new Promise(resolve=>{cancelAnimationFrame(frame);hideLetter=false;sequenceTime=0;animation={start:performance.now(),resolve};render();})};
}
