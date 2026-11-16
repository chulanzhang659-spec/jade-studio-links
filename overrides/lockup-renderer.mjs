import {ribbonVertexShader} from './ribbon-field.mjs';

// The original logo file remains untouched. Cropping, white matting and Pale Jade
// toning happen only in this display shader, just as in the accessible SVG fallback.
export async function createLockupRenderer(host){
 const THREE=await import('./assets/vendor/three.module.min.js');
 await document.fonts.ready;
 const logo=await new THREE.TextureLoader().loadAsync('assets/jade-logo-source.png');
 logo.colorSpace=THREE.SRGBColorSpace;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 const canvas=renderer.domElement;canvas.className='lockup-canvas';canvas.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.Camera(),geometry=new THREE.PlaneGeometry(1,1,100,64);
 const shared={uSize:{value:new THREE.Vector2()},uMouse:{value:new THREE.Vector2()},uPull:{value:new THREE.Vector2()},uOrigin:{value:new THREE.Vector2()},uShift:{value:0},uHover:{value:0},uArch:{value:0},uRipple:{value:0}};
 const material=(extra,fragment)=>new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,uniforms:{...shared,uRect:{value:new THREE.Vector4()},...extra},vertexShader:ribbonVertexShader,fragmentShader:fragment});
 const logoMaterial=material({uMap:{value:logo},uPale:{value:new THREE.Color('#474329')},uLight:{value:new THREE.Color('#E0DEC3')}},`varying vec2 vUv;uniform sampler2D uMap;uniform vec3 uPale,uLight;
  void main(){vec2 uv=vec2((115.+vUv.x*700.)/886.,1.-(35.+(1.-vUv.y)*575.)/782.);vec3 c=texture2D(uMap,uv).rgb;
   float light=clamp((max(c.r,max(c.g,c.b))-.62)/.38,0.,1.);
   float a=1.-smoothstep(.94,.995,min(c.r,min(c.g,c.b)));
   gl_FragColor=vec4(mix(uPale*.9,uLight,light),a);
   #include <colorspace_fragment>
  }`);
 const textMaterial=material({uMap:{value:null}},`varying vec2 vUv;uniform sampler2D uMap;void main(){gl_FragColor=texture2D(uMap,vUv);}`);
 const logoMesh=new THREE.Mesh(geometry,logoMaterial),textMesh=new THREE.Mesh(geometry,textMaterial);
 logoMesh.frustumCulled=false;textMesh.frustumCulled=false;scene.add(logoMesh,textMesh);host.append(canvas);
 let width=0,height=0,texture=null,lost=false;
 function refresh(){
  const box=host.getBoundingClientRect();if(!box.width||!box.height)return;
  width=box.width;height=box.height;renderer.setSize(width,height,false);shared.uSize.value.set(width,height);
  const mark=host.querySelector('.studio-logo').getBoundingClientRect();
  logoMaterial.uniforms.uRect.value.set(mark.left-box.left,mark.top-box.top,mark.width,mark.height);
  const source=document.createElement('canvas'),ratio=Math.min(devicePixelRatio||1,2);
  source.width=Math.ceil(width*ratio);source.height=Math.ceil(height*ratio);
  const ctx=source.getContext('2d');ctx.scale(ratio,ratio);ctx.textBaseline='alphabetic';
  // DOM character positions preserve actual wrapping, letter spacing and the CJK font.
  // This runs only on layout/font changes, never in the animation loop.
  for(const p of host.querySelectorAll('p')){
   const style=getComputedStyle(p);ctx.fillStyle=style.color;ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
   const metrics=ctx.measureText('Hg玉'),ascent=metrics.fontBoundingBoxAscent??metrics.actualBoundingBoxAscent,descent=metrics.fontBoundingBoxDescent??metrics.actualBoundingBoxDescent;
   const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);let node;
   while((node=walker.nextNode()))for(let i=0;i<node.length;i++){
    const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();
    if(r.width&&r.height)ctx.fillText(node.textContent[i],r.left-box.left,r.top-box.top+r.height/2+(ascent-descent)/2);
   }
  }
  texture?.dispose();texture=new THREE.CanvasTexture(source);texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
  textMaterial.uniforms.uMap.value=texture;textMaterial.uniforms.uRect.value.set(0,0,width,height);
 }
 canvas.addEventListener('webglcontextlost',()=>{lost=true;host.classList.remove('lockup-gpu');canvas.hidden=true;});
 refresh();
 return {refresh,render(s){
  if(lost||!texture)return;
  shared.uMouse.value.set(s.mx,s.my);shared.uPull.value.set(s.pullX,s.pullY);shared.uHover.value=s.hover;shared.uShift.value=s.shiftX||0;shared.uArch.value=s.arch;
  renderer.render(scene,camera);host.classList.add('lockup-gpu');
 },dispose(){host.classList.remove('lockup-gpu');logo.dispose();texture?.dispose();geometry.dispose();logoMaterial.dispose();textMaterial.dispose();renderer.dispose();canvas.remove();}};
}
