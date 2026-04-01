const test = require('node:test');
const assert = require('node:assert/strict');

const { isActiveTokenFilename } = require('../src/tokenFiles');

test('treats codex-[email].json as an active token file', () => {
    assert.equal(isActiveTokenFilename('codex-user@example.com.json'), true);
});

test('still recognizes legacy token_[timestamp].json files', () => {
    assert.equal(isActiveTokenFilename('token_1774959706646.json'), true);
});

test('ignores archived token files', () => {
    assert.equal(isActiveTokenFilename('old_codex-user@example.com.json'), false);
    assert.equal(isActiveTokenFilename('old_token_1774959706646.json'), false);
});
