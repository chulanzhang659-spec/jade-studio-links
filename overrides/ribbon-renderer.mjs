import {ribbonVertexShader,rippleGLSL} from './ribbon-field.mjs';
// One GPU canvas, shared global deformation field, no individual CSS rotations.
export async function createRibbonRenderer(host,slots){
 const THREE=await import('./assets/vendor/three.module.min.js');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x000000,0);
 renderer.domElement.className='ribbon-canvas';renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.Camera(),meshes=[],textures=[];
 const geometry=new THREE.PlaneGeometry(1,1,48,64);
 const loader=new THREE.TextureLoader();
 try{
  for(const slot of slots){
   const texture=await loader.loadAsync(slot.preview);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  }
 }catch(error){textures.forEach(t=>t.dispose());geometry.dispose();renderer.dispose();throw error;}
 const shared={uSize:{value:new THREE.Vector2()},uMouse:{value:new THREE.Vector2()},uPull:{value:new THREE.Vector2()},uShift:{value:0},uHover:{value:0},uArch:{value:0},uRipple:{value:0},uOrigin:{value:new THREE.Vector2()}};
 function makeMesh(){
  const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,
   uniforms:{...shared,uAlpha:{value:1},uRect:{value:new THREE.Vector4()},uMap:{value:textures[0]},uPaper:{value:new THREE.Color('#474329')},uImage:{value:new THREE.Vector2()},uCrop:{value:new THREE.Vector2(.5,.5)},uZoom:{value:1}},
   vertexShader:ribbonVertexShader,
   fragmentShader:`varying vec2 vUv,vPaperPoint;uniform sampler2D uMap;uniform vec4 uRect;uniform vec3 uPaper;uniform vec2 uImage,uCrop,uOrigin;uniform float uZoom,uRipple,uAlpha;
    ${rippleGLSL}
    void main(){float ir=uImage.x/uImage.y;float ar=uRect.z/uRect.w;vec2 cover=vec2(min(ar/ir,1.),min(ir/ar,1.))/uZoom;
     vec2 distortion=rippleOffset(vPaperPoint);
     vec2 bent=clamp(vUv+distortion*vec2(4.,-4.)/uRect.zw,vec2(0.),vec2(1.));
     vec2 uv=bent*cover+(1.-cover)*vec2(uCrop.x,1.-uCrop.y);vec4 tex=texture2D(uMap,uv);
     vec3 color=mix(uPaper,tex.rgb,tex.a);float shimmer=length(distortion)/12.;color=mix(color,uPaper,shimmer*.16);
     gl_FragColor=vec4(color,uAlpha);
     #include <colorspace_fragment>
    }`});
  const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);meshes.push(mesh);return mesh;
 }
 host.append(renderer.domElement);let width=0,height=0,lost=false;
 renderer.domElement.addEventListener('webglcontextlost',()=>{lost=true;host.classList.remove('ribbon-gpu');renderer.domElement.hidden=true;});
 return {
  render(rows,s,h){
   if(lost)return false;
   if(width!==s.width||height!==h){width=s.width;height=h;renderer.setSize(width,height,false);}
   shared.uSize.value.set(width,height);shared.uMouse.value.set(s.mx,s.my);shared.uPull.value.set(s.pullX,s.pullY);
   shared.uShift.value=s.shiftX||0;shared.uHover.value=s.hover;shared.uArch.value=s.arch;shared.uRipple.value=s.ripple;shared.uOrigin.value.set(s.rippleX,s.rippleY);
   rows.forEach((r,i)=>{const m=meshes[i]||makeMesh(),u=m.material.uniforms,t=textures[r.index],slot=slots[r.index];m.visible=true;
    u.uRect.value.set(r.x,r.y,r.width+.25,r.height);u.uMap.value=t;u.uImage.value.set(t.image.width,t.image.height);u.uCrop.value.set(...slot.crop);u.uZoom.value=slot.zoom||1;
    u.uAlpha.value=s.exit?(r.index===s.selectedIndex?s.exit.selected:s.exit.others):1;
   });
   for(let i=rows.length;i<meshes.length;i++)meshes[i].visible=false;
   renderer.render(scene,camera);host.classList.add('ribbon-gpu');return true;
  },
  dispose(){textures.forEach(t=>t.dispose());meshes.forEach(m=>m.material.dispose());geometry.dispose();renderer.dispose();renderer.domElement.remove();host.classList.remove('ribbon-gpu');}
 };
}
