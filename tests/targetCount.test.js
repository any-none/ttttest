const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveTargetCount } = require('../src/targetCount');

test('defaults registration count to 10 when no CLI argument is provided', () => {
    assert.equal(resolveTargetCount(['node', 'index.js']), 10);
});

test('uses the CLI argument when a valid positive count is provided', () => {
    assert.equal(resolveTargetCount(['node', 'index.js', '3']), 3);
});

test('falls back to 10 when the CLI argument is invalid', () => {
    assert.equal(resolveTargetCount(['node', 'index.js', '0']), 10);
    assert.equal(resolveTargetCount(['node', 'index.js', 'abc']), 10);
});
