import assert from 'node:assert/strict';

globalThis.window = {};
await import('../overrides/portfolio-projects.js');

const projects = globalThis.window.JADE_PROJECTS;
const expected = [
  ['meangirls-maximalism', 'MeanGirls Club', '时尚', '极简这么多年，时尚圈开始报复性华丽？'],
  ['meangirls-kiiikiii', 'MeanGirls Club', '时尚', '脏指甲、旧DV、乱穿衣：KiiiKiii到底美在哪里？'],
  ['meangirls-fashion-weeks', 'MeanGirls Club', '时尚', '四大时装周，真的有鄙视链吗？'],
  ['pink-qq-pet', '屁可Pink', '潮玩', '小时候的QQ宠物，在2026的多闪回来了⁉️'],
  ['pink-bratz', '屁可Pink', '潮玩', '“反”芭比的bratz贝兹娃娃都有哪些人物？💗'],
];

for (const [id, author, topic, title] of expected) {
  const project = projects.find((item) => item.id === id);
  assert.ok(project, `${id} must exist`);
  assert.equal(project.title, title, `${id} must keep the full Xiaohongshu title`);
  assert.equal(project.topic, topic, `${id} must use the approved topic`);
  assert.equal(project.secondary['portfolio-01'], '个人博主账号', `${id} must remain under personal account work`);
  assert.equal(project.account, author, `${id} must identify its source account`);
  assert.match(project.url, /^https:\/\/www\.xiaohongshu\.com\/explore\//, `${id} must link to its own post`);
  assert.match(project.preview, /^assets\/projects\/jade\/.+\.webp$/, `${id} must have a compressed local cover`);
  assert.equal(project.sourceLabel, '查看小红书帖子 ↗');
}

assert.equal(new Set(expected.map(([id]) => projects.find((item) => item.id === id).url)).size, expected.length);

console.log('PASS account post mapping checks');
