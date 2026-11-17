export const RING_FRAME_INTERVAL=1000/30;

export function shouldRenderRingFrame(previous,time){
 return previous===null||time-previous>=RING_FRAME_INTERVAL;
}

export function ringQuality({
 width,
 hardwareConcurrency=8,
 deviceMemory=8,
 pixelRatio=1,
}={}){
 const compact=width<=700||hardwareConcurrency<=4||deviceMemory<=4;
 return compact
  ?{pixelRatio:Math.min(pixelRatio,1),widthSegments:20,heightSegments:6}
  :{pixelRatio:Math.min(pixelRatio,1.25),widthSegments:24,heightSegments:8};
}
