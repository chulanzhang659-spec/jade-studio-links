import assert from 'node:assert/strict';

globalThis.window = {};
await import('../overrides/portfolio-projects.js');

const projects = globalThis.window.JADE_PROJECTS;
const removedIds = [
  'meangirls-maximalism',
  'meangirls-kiiikiii',
  'meangirls-fashion-weeks',
  'pink-qq-pet',
  'pink-bratz',
];

for (const id of removedIds) {
  assert.equal(projects.some((item) => item.id === id), false, `${id} must be removed from account operations`);
}

assert.ok(projects.some((item) => item.id === 'jade-pink-account'), 'MeanGirls Club account card must remain');
assert.ok(projects.some((item) => item.id === 'pink-account'), 'Pink account card must remain');

console.log('PASS account post removal checks');
