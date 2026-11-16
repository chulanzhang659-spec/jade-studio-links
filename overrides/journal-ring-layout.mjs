export const RING_COUNT=9;
export const RING_GREEN='#BCB893';
// Keep the full orbit inside narrow portrait viewports without changing its path.
export const cameraDistance=aspect=>aspect<.8?Math.max(27,25/aspect):16.4;
export function ringVertex(index,u,v,seconds=0,aspect=1){
 const a=(index%9+u)/9*Math.PI*2+seconds*.085,s=Math.sin(a);
 const x=6.4*Math.cos(a),y=(v-.5)*2.45*(1+.40*(s+1)/2),z=6.4*s;
 const tilt=-.28,xx=x*Math.cos(tilt)-y*Math.sin(tilt),yy=x*Math.sin(tilt)+y*Math.cos(tilt);
 return [xx,yy*Math.cos(.62)-z*Math.sin(.62)+(aspect<.8?.6:.85)+Math.max(0,s)*(aspect<.8?.45:.78),yy*Math.sin(.62)+z*Math.cos(.62)+s*(s>0?1.25:3)];
}
