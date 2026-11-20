// Keep the native image and GPU texture on the same decoded artwork. A stalled
// CDN request must not leave a permanently blank, otherwise clickable card.
export async function loadRibbonImage(image,slot,{timeout=6500}={}){
 const primary=slot.preview,backup=slot.fallback||primary;
 const attempts=[primary,backup,primary+(primary.includes('?')?'&':'?')+'retry=1'];
 image.decoding='async';
 for(const src of attempts){
  try{
   await new Promise((resolve,reject)=>{
    const finish=error=>{clearTimeout(timer);image.onload=null;image.onerror=null;error?reject(error):resolve();};
    const timer=setTimeout(()=>finish(new Error('Cover request timed out')),timeout);
    image.onload=()=>finish(image.naturalWidth?null:new Error('Cover did not decode'));
    image.onerror=()=>finish(new Error('Cover request failed'));
    image.src=src;
   });
   return image;
  }catch{/* Try the alternate file, then a fresh request for the same artwork. */}
 }
 throw new Error('Cover unavailable: '+slot.id);
}
