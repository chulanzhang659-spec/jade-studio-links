import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

globalThis.window={};
await import('../overrides/portfolio-projects.js');

const here=dirname(fileURLToPath(import.meta.url));
const assetDir=resolve(here,'../overrides/assets/projects/jade');
const projects=new Map(window.JADE_PROJECTS.map(project=>[project.id,project]));

const expected=[
 ['jade-elfu-founder-ip','portfolio-01','个人博主账号','ELFU｜主理人 IP 策划','elfu-founder-ip-plan', ''],
 ['jade-louisa-account-plan','portfolio-01','个人博主账号','朱柒焱 Louisa｜账号规划','louisa-account-plan', ''],
 ['jade-agan-account-improvement','portfolio-01','个人博主账号','阿干干｜个人账号改善策划','agan-account-improvement', ''],
 ['jade-shushi-shooting-plan','portfolio-04','品牌方案','疏时｜光影之间','shushi-shooting-plan', ''],
 ['jade-sixmodu-jiang-yiyi','portfolio-04','品牌方案','SIXMODU × 蒋依依｜乐园之外','sixmodu-jiang-yiyi-shooting-plan', ''],
 ['jade-bosideng-video-script','portfolio-02','脚本','波司登｜叠变三合一外套','bosideng-video-script', ''],
 ['jade-zunjie-video-script','portfolio-02','脚本','尊界典藏大观｜巴黎时装周','zunjie-video-script', ''],
 ['jade-blue-shirt-script','portfolio-02','脚本','疏时｜蓝色衬衫制作工坊','blue-shirt-production-script', ''],
 ['jade-galenic-arctic-script','portfolio-02','脚本','李佳琦 × 科兰黎｜北极溯源大片','galenic-arctic-origin-script', ''],
 ['jade-huawei-freeclip-script','portfolio-02','脚本','华为 FreeClip｜时装周电子配饰','huawei-freeclip-script', ''],
 ['jade-yuzhaolin-script','portfolio-02','脚本','Vessel.vv × 俞兆林｜万圣节保暖衣','yuzhaolin-video-script', ''],
 ['jade-adidas-live-script','portfolio-02','脚本','阿迪达斯山川里｜抖音逛街 Live','adidas-shanchuanli-live-script', ''],
 ['jade-n21-collection','portfolio-05','服装设计','N21 COLLECTION｜A Love Letter to Female Body','n21-collection', ''],
];

for(const [id,category,type,title,stem,sourceExt] of expected){
 const project=projects.get(id);
 assert.ok(project,`${id} must be listed`);
 assert.ok(project.categories.includes(category),`${id} must appear in ${category}`);
 assert.equal(project.secondary[category],type,`${id} must use ${type}`);
 assert.equal(project.title,title);
 assert.equal(project.preview,`assets/projects/jade/${stem}.jpg`);
 assert.equal(project.url,`assets/projects/jade/${stem}.pdf`);
 assert.equal(project.sourceLabel,'查看该项目 PDF ↗');
 assert.ok(existsSync(resolve(assetDir,`${stem}.jpg`)),`${stem}.jpg must ship`);
 assert.ok(existsSync(resolve(assetDir,`${stem}.pdf`)),`${stem}.pdf must ship`);
 if(sourceExt){
  assert.equal(project.originalURL,`assets/projects/jade/${stem}.${sourceExt}`);
  assert.equal(project.originalLabel,'下载原文件 ↗');
  assert.ok(existsSync(resolve(assetDir,`${stem}.${sourceExt}`)),`${stem}.${sourceExt} must ship`);
 }
}

const galenic=projects.get('jade-galenic');
assert.equal(galenic.url,'assets/projects/jade/galenic-option-proposal.pdf');
assert.equal(galenic.preview,'assets/projects/jade/galenic-option-proposal.jpg');

console.log('PASS portfolio batch import placement checks');
