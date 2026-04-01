const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveEmailMode } = require('../src/emailMode');

test('defaults to the standard email mode when no mode argument is provided', () => {
    assert.equal(resolveEmailMode(['node', 'index.js', '10']), 'default');
});

test('accepts gmail mode from the CLI', () => {
    assert.equal(resolveEmailMode(['node', 'index.js', '10', 'gmail']), 'gmail');
});

test('accepts gamil as a compatibility alias for gmail mode', () => {
    assert.equal(resolveEmailMode(['node', 'index.js', '10', 'gamil']), 'gmail');
});

test('rejects unsupported email modes', () => {
    assert.throws(
        () => resolveEmailMode(['node', 'index.js', '10', 'hotmail']),
        /Unsupported email mode/
    );
});
