import assert from 'node:assert/strict';
import * as catalog from '../overrides/portfolio-catalog.mjs';

assert.equal(
 typeof catalog.imageLoading,
 'function',
 'the catalog must expose its image-loading policy for verification',
);
assert.equal(
 catalog.imageLoading('preview'),
 'eager',
 'project-card previews must load immediately inside the transformed catalog viewport',
);
assert.equal(
 catalog.imageLoading('gallery'),
 'lazy',
 'expanded gallery images must remain deferred for page performance',
);

console.log('PASS portfolio media loading checks');
