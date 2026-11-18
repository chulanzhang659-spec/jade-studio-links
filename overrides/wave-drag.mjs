const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function normalizePointerVelocity(deltaPixels,deltaMs,viewportWidth){
 if(!Number.isFinite(deltaPixels)||!Number.isFinite(deltaMs)||!Number.isFinite(viewportWidth)||deltaMs<=0||viewportWidth<=0)return 0;
 return clamp(deltaPixels/deltaMs*1000/viewportWidth,-2.4,2.4);
}

export function pointerSweepProgress(anchorX,currentX,viewportWidth){
 if(!Number.isFinite(anchorX)||!Number.isFinite(currentX)||!Number.isFinite(viewportWidth)||viewportWidth<=0)return 0;
 return clamp((currentX-anchorX)/viewportWidth,-1,1);
}

// Measure each stroke from its most recent turning point, not the entry point.
export function advanceHoverSweep(state,x,width){
 if(!Number.isFinite(x)||!Number.isFinite(width)||width<=0)return state;
 if(!state)return {origin:x,extreme:x,direction:0,progress:0};
 let {origin,extreme,direction}=state;
 const deadband=Math.max(4,width*.006);
 if(direction===0){
  if(Math.abs(x-origin)<deadband)return {...state,progress:0};
  direction=Math.sign(x-origin);extreme=x;
 }else if((x-extreme)*direction<-deadband){
  origin=extreme;direction=-direction;extreme=x;
 }else if((x-extreme)*direction>0){extreme=x;}
 return {origin,extreme,direction,progress:pointerSweepProgress(origin,x,width)};
}

export function navigationDirection(signedProgress){
 if(signedProgress<0)return 'next';
 if(signedProgress>0)return 'previous';
 return 'none';
}

export function permittedSweep(progress,dragging,pageIndex){
 const value=clamp(Number.isFinite(progress)?progress:0,-1,1);
 return value>0&&(!dragging||pageIndex<=0)?0:value;
}

export function rolledPaperState(pageIndex,progress){
 const pages=Math.max(0,(Number.isFinite(pageIndex)?pageIndex:0)-(Number.isFinite(progress)?progress:0));
 const growth=1-Math.exp(-pages/4);
 return {pages,width:.12+.22*growth,depth:.075+.13*growth};
}

export function sweepDecision(progress){
 const safeProgress=clamp(Number.isFinite(progress)?progress:0,-1,1);
 if(Math.abs(safeProgress)<.45)return {complete:false,target:0,direction:'none'};
 const target=safeProgress<0?-1:1;
 return {complete:true,target,direction:navigationDirection(target)};
}

export const idleSweepExpired=(lastMoveAt,now)=>Number.isFinite(lastMoveAt)&&Number.isFinite(now)&&now-lastMoveAt>=180;
export const cooldownElapsed=(completedAt,now)=>!Number.isFinite(completedAt)||!Number.isFinite(now)||now-completedAt>=450;

export function stepSweepTransition(state,target,deltaSeconds){
 const progress=clamp(Number.isFinite(state?.progress)?state.progress:0,-1,1);
 const velocity=clamp(Number.isFinite(state?.velocity)?state.velocity:0,-2.4,2.4);
 const goal=clamp(Number.isFinite(target)?target:0,-1,1);
 const delta=clamp(Number.isFinite(deltaSeconds)?deltaSeconds:1/60,1/240,.05);
 const omega=10.5;
 const displacement=progress-goal;
 const helper=velocity+omega*displacement;
 const decay=Math.exp(-omega*delta);
 let nextProgress=goal+(displacement+helper*delta)*decay;
 let nextVelocity=(velocity-omega*helper*delta)*decay;
 if((goal-progress)*(goal-nextProgress)<0||Math.abs(goal-nextProgress)<1e-6){nextProgress=goal;nextVelocity=0;}
 return {progress:clamp(nextProgress,-1,1),velocity:clamp(nextVelocity,-2.4,2.4)};
}
