import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

import {
  RING_FRAME_INTERVAL,
  ringQuality,
  shouldRenderRingFrame,
} from '../overrides/ring-performance.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const overrides=resolve(here,'../overrides');

assert.equal(RING_FRAME_INTERVAL,1000/30,'the intro ring must be capped at 30fps');
assert.equal(shouldRenderRingFrame(null,0),true,'the first frame must render');
assert.equal(shouldRenderRingFrame(100,120),false,'a frame inside the 30fps interval must be skipped');
assert.equal(shouldRenderRingFrame(100,134),true,'a frame after the interval must render');

assert.deepEqual(
  ringQuality({width:1280,hardwareConcurrency:8,deviceMemory:8,pixelRatio:2}),
  {pixelRatio:1.25,widthSegments:24,heightSegments:8},
  'desktop quality must retain detail without rendering at full Retina density',
);
assert.deepEqual(
  ringQuality({width:390,hardwareConcurrency:8,deviceMemory:8,pixelRatio:3}),
  {pixelRatio:1,widthSegments:20,heightSegments:6},
  'portrait mobile must use the compact ring mesh and native CSS resolution',
);

const ring=await readFile(resolve(overrides,'journal-ring.js'),'utf8');
assert.match(ring,/shouldRenderRingFrame/,'the ring renderer must use the frame cap');
assert.doesNotMatch(ring,/mesh\.geometry\.computeBoundingSphere\(\)/,'the ring must not recompute nine bounding spheres every frame');
assert.match(ring,/geometry\.boundingSphere\s*=\s*new THREE\.Sphere/,'raycasting must use a stable conservative bounding sphere');

const app=await readFile(resolve(overrides,'journal-app.js'),'utf8');
assert.match(app,/let workRibbon=null/,'the second-act ribbon must not be constructed on the intro');
assert.match(app,/function ensureWorkRibbon\(/,'the ribbon must have an explicit activation gate');
assert.match(app,/function showJournal\(\)[\s\S]*ensureWorkRibbon\(\)/,'the six covers must load only after entering the journal');

console.log('PASS performance regression checks');
