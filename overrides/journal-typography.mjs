export const MANIFESTO_LINES=['WE FIND WHAT MAKES YOU DISTINCT.','WE CREATE WHAT MAKES YOU MEMORABLE.'];
const MOBILE_LINES=['WE FIND WHAT','MAKES YOU DISTINCT.','WE CREATE WHAT','MAKES YOU MEMORABLE.'];
export const MANIFESTO_COPY=MANIFESTO_LINES.join(' ');
const clamp=n=>Math.min(1,Math.max(0,n));
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
export function manifestoMetrics(w,h){
 const lines=w<=600?MOBILE_LINES:MANIFESTO_LINES;
 let font=w<=600?Math.min(w*.083,h*.058):Math.min(w*.061,h*.095);
 const ctx=typeof document!=='undefined'?document.createElement('canvas').getContext('2d'):null;
 const measure=text=>{if(ctx){ctx.font=`700 ${font}px "Libre Caslon Condensed", Georgia, serif`;return ctx.measureText(text).width;}return text.length*font*.66;};
 const longest=Math.max(...lines.map(measure));font*=Math.min(1,w*.9/longest);
 const rowHeight=font*1.2,height=rowHeight*lines.length,width=Math.min(w*.9,longest),y=h*.47-height/2;
 const rows=lines.map((text,i)=>({text,x:w/2,y:y+i*rowHeight,width:measure(text),height:rowHeight,baseline:y+(i+.82)*rowHeight,font}));
 const chineseTop=rows.at(-1).baseline+font*.2+Math.max(28,Math.min(48,h*.045));
 return {width,height,rows,chineseTop};
}
export function manifestoSVG(w,h){
 const {rows}=manifestoMetrics(w,h);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${rows.map(r=>`<text x="${r.x}" y="${r.baseline}" text-anchor="middle" font-family="Libre Caslon Condensed, Georgia, serif" font-weight="700" filter="url(#ink-wear)" font-size="${r.font}" fill="#474329">${r.text}</text>`).join('')}</svg>`;
}
export function entryLayout(ms,w,h,source){
 const final=manifestoMetrics(w,h),compressionRow=w<=600?2:1,third=final.rows[compressionRow],split=third.text.lastIndexOf(' ')+1,left=third.text.slice(0,split),right=third.text.slice(split);
 const ctx=typeof document!=='undefined'?document.createElement('canvas').getContext('2d'):null;
 const measure=text=>{if(ctx){ctx.font=`700 ${third.font}px "Libre Caslon Condensed", Georgia, serif`;return ctx.measureText(text).width;}return text.length*third.font*.66;};
 const leftWidth=measure(left),fullWidth=measure(third.text),join=w/2-fullWidth/2+leftWidth;
 const progress=smooth(ms/1400),gather=smooth(ms/350),gap=source.width*(1-progress),fontHeight=third.font*.9;
 const lerp=(a,b,t)=>a+(b-a)*t;
 const imageHeight=lerp(source.height,fontHeight,progress)*(1-smooth((ms-1050)/350));
 const image={x:lerp(source.x,join-gap/2,gather),y:lerp(source.y,third.baseline-fontHeight*.9,gather),width:gap,height:imageHeight};
 const rows=final.rows.map((row,i)=>({...row,baseline:row.baseline+(i===compressionRow?0:(i<compressionRow?-1:1)*h*.45*(1-smooth((ms-100)/1100)))}));
 const chinese={top:final.chineseTop,offsetY:h*.45*(1-smooth((ms-100)/1100)),opacity:smooth(ms/200)};
 return {rows,compressionRow,image,left,right,leftWidth,leftX:join-leftWidth-gap/2,rightX:join+gap/2,opacity:smooth(ms/200),chinese};
}
export function entrySVG(layout,w,h){
 const compressionRow=layout.compressionRow;
 const text=(row,content,x,anchor='middle')=>`<text xml:space="preserve" x="${x}" y="${row.baseline}" text-anchor="${anchor}" font-family="Libre Caslon Condensed, Georgia, serif" font-weight="700" filter="url(#ink-wear)" font-size="${row.font}" fill="#474329">${content}</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><g opacity="${layout.opacity}">${layout.rows.map((r,i)=>i===compressionRow?text(r,layout.left,layout.leftX,'start')+text(r,layout.right,layout.rightX,'start'):text(r,r.text,r.x)).join('')}</g></svg>`;
}
