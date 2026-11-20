import {CATEGORIES} from './categories.mjs?v=arc10';
const FILES=['fashion-cutout.webp','atelier-sketch.webp','film-figure.webp','film-sketch.webp'];
const RIVER_FILES=['01-accounts.jpg','02-content-editing.jpg','03-film-edit.jpg','04-planning.jpg','05-design.jpg','06-portfolio-design.jpg'];
let pending,pendingOpening,pendingImages,pendingRiverImages;
const loadImages=()=>pendingImages??=Promise.all(FILES.map(file=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Artwork could not load: '+file));im.src=new URL('./assets/'+file,import.meta.url).href;})));
const loadRiverImages=()=>pendingRiverImages??=Promise.all(RIVER_FILES.map(file=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('River artwork could not load: '+file));im.src=new URL('../assets/second-act/'+file,import.meta.url).href;})));
export function loadArtworks(){return pending??=loadRiverImages().then(images=>Array.from({length:18},(_,i)=>composeRiverArtwork(images,i)));}
export function loadOpeningArtworks(){return pendingOpening??=loadImages().then(images=>Array.from({length:9},(_,i)=>composeArtwork(images,i,{text:false})));}
function fit(ctx,im,x,y,w,h,cover=false){
 const s=cover?Math.max(w/im.width,h/im.height):Math.min(w/im.width,h/im.height);
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(im,x+(w-im.width*s)/2,y+(h-im.height*s)/2,im.width*s,im.height*s);ctx.restore();
}
function composeRiverArtwork(images,index){
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=680;
 const c=canvas.getContext('2d'),image=images[index%images.length],category=CATEGORIES[index%9];
 c.fillStyle='#e9dfc4';c.fillRect(0,0,1000,680);fit(c,image,0,0,1000,680,true);
 let seed=index*199+47;for(let i=0;i<3200;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%1000;seed=(seed*1664525+1013904223)>>>0;c.fillStyle=i%2?'#ffffff08':'#252d2206';c.fillRect(x,seed%680,1,1);}
 canvas.dataset.category=String(category.index);canvas.dataset.portfolioIndex=String(index%images.length);canvas.dataset.study=String(index+1);return canvas;
}
export function composeArtwork(images,index,{text=true}={}){
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=680;
 const c=canvas.getContext('2d'),kind=index%6,category=CATEGORIES[index%9];
 const paper=['#e5ddc9','#d2d4b7','#c9c5b2','#bfc1a3','#ede7d6','#d7d7bd'][kind];
 c.fillStyle=paper;c.fillRect(0,0,1000,680);
 if(kind===0){
  fit(c,images[2],0,0,1000,680,true);
 }else if(kind===1){fit(c,images[1],0,0,1000,680,true);
 }else if(kind===2){
  c.strokeStyle='#76805a40';for(let y=100;y<680;y+=53){c.beginPath();c.moveTo(0,y);c.lineTo(1000,y);c.stroke();}
  fit(c,images[0],465,20,500,640);c.fillStyle='#3b4732';c.font='54px "La Belle Aurore",cursive';
  if(text){c.save();c.translate(50,220);c.rotate(-.07);['a study in feeling','follow the drape','leave room','to move.'].forEach((t,i)=>c.fillText(t,0,i*82));c.restore();}else{fit(c,images[3],20,20,470,640,true);}
 }else if(kind===3){
  c.save();c.translate(260,290);c.rotate(-.065);c.fillStyle='#f3eddb';c.fillRect(-225,-245,450,500);fit(c,images[3],-209,-229,418,425,true);c.restore();
  c.save();c.translate(740,365);c.rotate(.075);c.fillStyle='#f1ead7';c.fillRect(-220,-280,440,560);fit(c,images[0],-210,-265,420,485);c.restore();
 }else if(kind===4){
  fit(c,images[0],370,-35,600,750);if(text){c.fillStyle='#374432';c.font='120px "La Belle Aurore",cursive';c.save();c.translate(55,280);c.rotate(-.07);c.fillText('softness',0,0);c.fillText('/ structure',20,140);c.restore();}else{fit(c,images[1],0,0,480,680,true);}
 }else{fit(c,images[3],0,0,1000,680,true);c.fillStyle='#73754130';c.fillRect(0,0,1000,680);}
 // Each complete study stays intact through the ring, squeeze and detail route.
 let seed=index*199+47;for(let i=0;i<5500;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%1000;seed=(seed*1664525+1013904223)>>>0;c.fillStyle=i%2?'#ffffff0b':'#252d2208';c.fillRect(x,seed%680,1,1);}
 if(text){c.fillStyle=kind===0?'#f3eedb':'#39442c';c.font='13px "Special Elite",monospace';c.fillText('JADE  /  CONCEPT STUDY '+String(index+1).padStart(2,'0'),37,655);}
 canvas.dataset.category=String(category.index);canvas.dataset.study=String(index+1);return canvas;
}
const artworkURLs=new WeakMap();
export function artworkURL(canvas){if(!artworkURLs.has(canvas))artworkURLs.set(canvas,canvas.toDataURL('image/webp',.88));return artworkURLs.get(canvas);}
