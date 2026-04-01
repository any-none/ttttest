const test = require('node:test');
const assert = require('node:assert/strict');

const { buildTokenFilename } = require('../src/oauthService');

test('formats token filenames as codex-[email].json', () => {
    assert.equal(
        buildTokenFilename('user@example.com'),
        'codex-user@example.com.json'
    );
});

test('replaces path separators when building token filenames', () => {
    assert.equal(
        buildTokenFilename('bad/name@example.com'),
        'codex-bad_name@example.com.json'
    );
});
