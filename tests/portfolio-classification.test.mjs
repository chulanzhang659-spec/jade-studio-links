import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const catalogModule=await import('../overrides/portfolio-catalog.mjs');

const here=dirname(fileURLToPath(import.meta.url));
const overrides=resolve(here,'../overrides');
const context={window:{}};
vm.createContext(context);
vm.runInContext(await readFile(resolve(overrides,'content.js'),'utf8'),context);
vm.runInContext(await readFile(resolve(overrides,'portfolio-projects.js'),'utf8'),context);

const expectedTaxonomy=[
 ['账号内容与运营',['个人博主账号','品牌账号']],
 ['内容编辑与策划',['时尚视频','时尚图文','方案','脚本']],
 ['视频剪辑与后期',['口播','访谈','Vlog','品牌短片','活动与秀场']],
 ['品牌策略与叙事',['品牌故事与语言','系列与传播概念','品牌方案']],
 ['设计服务',['平面与视觉设计','服装设计','产品设计']],
 ['作品集策划与设计',['服装作品集','产品作品集']],
];
assert.deepEqual(
 JSON.parse(JSON.stringify(context.window.JADE_CONTENT.portfolios.map(item=>[item.subtitle,item.types]))),
 expectedTaxonomy,
 'the six deliverable-led sections must match the approved taxonomy',
);

const byId=new Map(context.window.JADE_PROJECTS.map(project=>[project.id,project]));
const runway=byId.get('jade-ann-runway');
assert.deepEqual(JSON.parse(JSON.stringify(runway.categories)),['portfolio-03'],'Ann\'s Paris runway diary must appear only under video post-production');
assert.deepEqual(JSON.parse(JSON.stringify(runway.secondary)),{'portfolio-03':'活动与秀场'},'the runway diary must be classified as event/runway footage');

for(const id of ['video-01','video-02']){
 const project=byId.get(id);
 assert.deepEqual(JSON.parse(JSON.stringify(project.categories)),['portfolio-03'],`${id} must remain under video post-production`);
 assert.equal(project.secondary['portfolio-03'],'Vlog',`${id} must remain in the Vlog subsection`);
}

for(const id of ['video-03','video-04','video-05','video-06','video-07','video-08']){
 const project=byId.get(id);
 assert.ok(project.categories.includes('portfolio-03'),`${id} must remain under video post-production`);
 assert.equal(project.secondary['portfolio-03'],'口播',`${id} must remain in the spoken-video subsection`);
 assert.ok(project.categories.includes('portfolio-02'),`${id} must also appear under content editing and planning`);
 assert.equal(project.secondary['portfolio-02'],'时尚视频',`${id} must appear in the fashion-video subsection`);
}

for(const id of ['jade-bonjour','jade-galenic']){
 const project=byId.get(id);
 assert.ok(project.categories.includes('portfolio-02'),`${id} must also appear in content editing and planning`);
 assert.equal(project.secondary['portfolio-02'],'方案',`${id} must appear in the planning subsection`);
 assert.ok(project.categories.includes('portfolio-04'),`${id} must retain its brand-story placement`);
}

assert.equal(typeof catalogModule.displayTitle,'function','catalog titles must be derived from the active category');
assert.equal(
 catalogModule.displayTitle(byId.get('jade-bonjour'),{id:'portfolio-02'}),
 '方案｜Bonjour × Herb Live',
 'a cross-listed project must use the subsection name from the category being viewed',
);

const workHTML=await readFile(resolve(overrides,'work.html'),'utf8');
const waveModule=await readFile(resolve(overrides,'wave-transition-study.mjs'),'utf8');
const catalogScriptVersion=workHTML.match(/portfolio-catalog\.mjs\?v=(\d+)/)?.[1];
const catalogImportVersion=waveModule.match(/portfolio-catalog\.mjs\?v=(\d+)/)?.[1];
assert.equal(catalogImportVersion,catalogScriptVersion,'the catalog module must use one cache version to avoid mounting twice');

console.log('PASS portfolio classification regression checks');
