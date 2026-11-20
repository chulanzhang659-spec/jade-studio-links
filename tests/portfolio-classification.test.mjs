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
 ['内容编辑',['时尚视频','时尚图文']],
 ['视频剪辑与后期',['口播','访谈','Vlog','品牌短片','活动与秀场']],
 ['策划',['方案','脚本']],
 ['设计服务',['平面与视觉设计','服装设计','产品设计']],
 ['作品集策划与设计',['服装作品集','产品作品集']],
];
assert.deepEqual(
 JSON.parse(JSON.stringify(context.window.JADE_CONTENT.portfolios.map(item=>[item.subtitle,item.types]))),
 expectedTaxonomy,
 'the six deliverable-led sections must match the approved taxonomy',
);

const byId=new Map(context.window.JADE_PROJECTS.map(project=>[project.id,project]));
for(const category of context.window.JADE_CONTENT.portfolios){
 const items=context.window.JADE_PROJECTS.filter(project=>project.categories.includes(category.id));
 assert.equal(new Set(items.map(project=>project.id)).size,items.length,'no repeated project within a top-level section');
 for(const project of items)assert.ok(category.types.includes(project.secondary[category.id]),`${project.id} has an obsolete subsection`);
}
const planning=context.window.JADE_CONTENT.portfolios.find(category=>category.id==='portfolio-04');
assert.deepEqual(catalogModule.selectGroups(context.window.JADE_PROJECTS,planning).map(group=>[group.name,group.projects.length]),[['方案',11],['脚本',9]]);
assert.equal(catalogModule.resolveType(catalogModule.selectGroups(context.window.JADE_PROJECTS,planning),'品牌方案'),'方案');
for(const oldType of ['拍摄企划','品牌策略与叙事'])assert.equal(catalogModule.resolveType(catalogModule.selectGroups(context.window.JADE_PROJECTS,planning),oldType),'方案','previously shared links must open the merged proposals');
const scripts=catalogModule.selectGroups(context.window.JADE_PROJECTS,planning).find(group=>group.name==='脚本');
assert.deepEqual(catalogModule.topicsFor(scripts,planning),[],'scripts must display together without topic filters');
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
 assert.deepEqual(JSON.parse(JSON.stringify(project.categories)),['portfolio-04'],`${id} must appear only once in planning`);
 assert.equal(project.secondary['portfolio-04'],'方案');
 assert.ok(project.categories.includes('portfolio-04'),`${id} must retain its brand-story placement`);
}

assert.equal(typeof catalogModule.displayTitle,'function','catalog titles must be derived from the active category');
assert.equal(
 catalogModule.displayTitle(byId.get('jade-bonjour'),{id:'portfolio-04'}),
 '方案｜Bonjour × Herb Live',
 'a cross-listed project must use the subsection name from the category being viewed',
);

const workHTML=await readFile(resolve(overrides,'work.html'),'utf8');
const waveModule=await readFile(resolve(overrides,'wave-transition-study.mjs'),'utf8');
const catalogScriptVersion=workHTML.match(/portfolio-catalog\.mjs\?v=(\d+)/)?.[1];
const catalogImportVersion=waveModule.match(/portfolio-catalog\.mjs\?v=(\d+)/)?.[1];
assert.equal(catalogImportVersion,catalogScriptVersion,'the catalog module must use one cache version to avoid mounting twice');

console.log('PASS portfolio classification regression checks');
