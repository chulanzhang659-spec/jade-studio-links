import * as THREE from './assets/vendor/three.module.min.js';
import {paperCanvas} from './paper-textures.js?v=mixed-1';
import {RING_COUNT,RING_GREEN,ringVertex,cameraDistance} from './journal-ring-layout.mjs?v=mobile-ring-2';

export async function createJournalRing(host,{onSelect=()=>{},reducedMotion=false}={}){
 const images=await Promise.all(['ring-grass.webp','ring-paper.webp','ring-embossed.webp'].map(name=>new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Ring artwork failed to load: '+name));image.src=new URL('./assets/'+name,import.meta.url).href;
 })));
 const canvases=Array.from({length:RING_COUNT},(_,i)=>paperCanvas(images,i,{text:false}));
 const alpha=canvases.map(c=>c.getContext('2d').getImageData(0,0,c.width,c.height));
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,240),raycaster=new THREE.Raycaster();
 const textures=[],meshes=[];
 let seconds=0,previous=null,frame=0,paused=false,disposed=false,selected=false;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(RING_GREEN,0);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.style.cssText='display:block;width:100%;height:100%';
 function draw(){
  const centerX=camera.aspect<.8?1.5:0;
  camera.position.set(centerX,0,cameraDistance(camera.aspect));camera.lookAt(centerX,0,0);
  meshes.forEach((mesh,i)=>{
   const position=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
   for(let n=0;n<position.count;n++)position.setXYZ(n,...ringVertex(i,uv.getX(n),uv.getY(n),seconds,camera.aspect));
   position.needsUpdate=true;mesh.geometry.computeBoundingSphere();
  });
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);renderer.render(scene,camera);
 }
 function resize(){if(disposed)return;const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);draw();}
 function tick(time){frame=0;if(disposed||paused||document.hidden)return;if(previous!==null&&!reducedMotion)seconds+=Math.max(0,Math.min(.1,(time-previous)/1000));previous=time;draw();if(!reducedMotion)frame=requestAnimationFrame(tick);}
 function pause(){paused=true;previous=null;cancelAnimationFrame(frame);frame=0;}
 function resume(){if(disposed)return;paused=false;previous=null;if(!document.hidden&&!frame)frame=requestAnimationFrame(tick);}
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;previous=null;}else if(!paused)resume();}
 function hitAt(x,y){
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  raycaster.setFromCamera(new THREE.Vector2(x,y),camera);
  return raycaster.intersectObjects(meshes,false).find(hit=>{
   const map=alpha[hit.object.userData.index],back=hit.face.normal.dot(raycaster.ray.direction)>0,u=back?1-hit.uv.x:hit.uv.x;
   const px=Math.max(0,Math.min(map.width-1,Math.floor(u*map.width))),py=Math.max(0,Math.min(map.height-1,Math.floor((1-hit.uv.y)*map.height)));
   return map.data[(py*map.width+px)*4+3]/255>=.45;
  });
 }
 function select(mesh){
  if(disposed||selected)return false;
  const r=canvas.getBoundingClientRect(),position=mesh.geometry.attributes.position;let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(let n=0;n<position.count;n++){
   const p=new THREE.Vector3().fromBufferAttribute(position,n).applyMatrix4(mesh.matrixWorld).project(camera),x=r.left+(p.x+1)*r.width/2,y=r.top+(1-p.y)*r.height/2;
   minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
  selected=true;pause();onSelect({image:canvases[mesh.userData.index],sourceBounds:{x:minX,y:minY,width:maxX-minX,height:maxY-minY},index:mesh.userData.index});return true;
 }
 function click(event){if(disposed||selected)return;draw();const r=canvas.getBoundingClientRect(),hit=hitAt((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);if(hit)select(hit.object);}
 function selectFront(){
  if(disposed||selected)return false;draw();
  // Sample actual visible opaque fragments; nearest depth wins over an occluded center.
  const hits=[];
  for(let y=-.75;y<=.75;y+=.15)for(let x=-.85;x<=.85;x+=.17){const hit=hitAt(x,y);if(hit)hits.push(hit);}
  hits.sort((a,b)=>a.distance-b.distance);return hits.length?select(hits[0].object):false;
 }
 function reset(){if(disposed)return;seconds=0;selected=false;draw();resume();}
 function dispose(){if(disposed)return;pause();disposed=true;host.removeEventListener('click',click);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);meshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove();}
 try{
  canvases.forEach((c,i)=>{
   const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(texture);
   const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,alphaTest:.45,depthTest:true,depthWrite:true,vertexColors:true,toneMapped:false});
   material.onBeforeCompile=shader=>{const uv='vec2(gl_FrontFacing ? vMapUv.x : 1.0-vMapUv.x,vMapUv.y)';shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )',`texture2D(map,${uv})`));};
   material.customProgramCacheKey=()=> 'journal-ring-paper';
   const geometry=new THREE.PlaneGeometry(1,1,32,12);geometry.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*3).fill(1),3));
   const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.userData.index=i;scene.add(mesh);meshes.push(mesh);
  });
  host.append(canvas);host.dataset.renderer='Three.js r'+THREE.REVISION+' / WebGL2';host.dataset.planes=String(RING_COUNT);host.dataset.motion='ring';
  resize();renderer.compile(scene,camera);host.addEventListener('click',click);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);resume();
  return {pause,resume,resize,selectFront,reset,dispose};
 }catch(error){dispose();throw error;}
}
