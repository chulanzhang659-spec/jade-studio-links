import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

globalThis.window={};
await import('../overrides/portfolio-projects.js');

const projects=new Map(window.JADE_PROJECTS.map(project=>[project.id,project]));
const expected={
 'jade-hoka':'assets/projects/jade/hoka.pdf',
 'jade-iro':'https://chulanzhang659-spec.github.io/jade-portfolio/iro.pdf',
 'jade-bosideng':'https://chulanzhang659-spec.github.io/jade-portfolio/bosideng.pdf',
 'jade-moution':'https://chulanzhang659-spec.github.io/jade-portfolio/moution.pdf',
 'jade-bonjour':'https://chulanzhang659-spec.github.io/jade-portfolio/bonjour.pdf',
 'jade-galenic':'https://chulanzhang659-spec.github.io/jade-portfolio/galenic.pdf',
};

for(const [id,url] of Object.entries(expected)){
 assert.equal(projects.get(id)?.url,url,`${id} must open its own project PDF`);
 assert.equal(projects.get(id)?.sourceLabel,'查看该项目 PDF ↗',`${id} must describe the link as a project PDF`);
}

assert.equal(new Set(Object.values(expected)).size,Object.keys(expected).length,'each project must have a distinct PDF URL');
assert.ok(existsSync(resolve('overrides/assets/projects/jade/hoka.pdf')),'the HOKA project PDF must ship with the current site');

console.log('PASS project PDF link regression checks');
