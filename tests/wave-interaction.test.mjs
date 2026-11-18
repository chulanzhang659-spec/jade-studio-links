import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const override=resolve(here,'../overrides/wave-drag.mjs');
const source=existsSync(override)?override:resolve(here,'../../jade-source/dist/wave-drag.mjs');
const {sweepDecision}=await import(pathToFileURL(source));

assert.deepEqual(
 sweepDecision(-0.35),
 {complete:true,target:-1,direction:'next'},
 'a 35% left sweep must advance to the next portfolio',
);
assert.deepEqual(
 sweepDecision(0.35),
 {complete:true,target:1,direction:'previous'},
 'a 35% right drag must return to the previous portfolio',
);
assert.deepEqual(
 sweepDecision(-0.34),
 {complete:false,target:0,direction:'none'},
 'a 34% left sweep must not turn the page',
);
assert.deepEqual(
 sweepDecision(0.34),
 {complete:false,target:0,direction:'none'},
 'a 34% right drag must not turn the page',
);
assert.deepEqual(
 sweepDecision(0.18),
 {complete:false,target:0,direction:'none'},
 'small incidental pointer movement must not turn the page',
);

console.log('PASS wave interaction regression checks');
