import assert from 'node:assert/strict';
import {sourceLinks} from '../overrides/portfolio-catalog.mjs';

assert.deepEqual(sourceLinks({
 url:'assets/projects/jade/example.pdf',
 sourceLabel:'查看该项目 PDF ↗',
 originalURL:'assets/projects/jade/example.pptx',
 originalLabel:'下载原文件 ↗',
}),[
 {url:'assets/projects/jade/example.pdf',label:'查看该项目 PDF ↗'},
 {url:'assets/projects/jade/example.pptx',label:'下载原文件 ↗'},
]);

assert.deepEqual(sourceLinks({url:'javascript:alert(1)',originalURL:'file:///secret'}),[]);

console.log('PASS portfolio source-link checks');
