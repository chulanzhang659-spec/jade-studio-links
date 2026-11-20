import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

globalThis.window = {};
await import('../overrides/portfolio-projects.js');

const here = dirname(fileURLToPath(import.meta.url));
const projects = globalThis.window.JADE_PROJECTS;
const expected = [
  {
    id: 'jade-soft-cool-lady',
    category: 'portfolio-04',
    type: '品牌方案',
    title: 'Soft Cool Lady｜夏日职场女性拍摄计划',
    pdf: 'soft-cool-lady-shooting-plan.pdf',
    preview: 'soft-cool-lady-shooting-plan.jpg',
  },
  {
    id: 'jade-jade-dress-storyboard',
    category: 'portfolio-02',
    type: '脚本',
    title: '玉色入夏｜玉碧色丝麻连衣裙',
    pdf: 'jade-dress-video-storyboard.pdf',
    preview: 'jade-dress-video-storyboard.jpg',
  },
];

for (const item of expected) {
  const project = projects.find((candidate) => candidate.id === item.id);
  assert.ok(project, `${item.id} must be present`);
  assert.equal(project.title, item.title);
  assert.deepEqual(project.categories, [item.category]);
  assert.equal(project.secondary[item.category], item.type);
  assert.equal(project.url, `assets/projects/jade/${item.pdf}`);
  assert.equal(project.preview, `assets/projects/jade/${item.preview}`);
  assert.equal(project.sourceLabel, '查看该项目 PDF ↗');
  assert.ok(existsSync(resolve(here, '../overrides/assets/projects/jade', item.pdf)), `${item.pdf} must ship`);
  assert.ok(existsSync(resolve(here, '../overrides/assets/projects/jade', item.preview)), `${item.preview} must ship`);
}

console.log('PASS new project PDF placement checks');
