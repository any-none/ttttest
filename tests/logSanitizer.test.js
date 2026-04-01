const test = require('node:test');
const assert = require('node:assert/strict');

const { maskEmailForLog, sanitizeForLog } = require('../src/logSanitizer');

test('redacts configured secrets from log output', () => {
    const raw = 'Authorization: Bearer example-cpa-key DDG=example-ddg-token';
    const sanitized = sanitizeForLog(raw, {
        cpaKey: 'example-cpa-key',
        ddgToken: 'example-ddg-token'
    });

    assert.doesNotMatch(sanitized, /example-cpa-key/);
    assert.doesNotMatch(sanitized, /example-ddg-token/);
    assert.match(sanitized, /\[REDACTED]/);
});

test('redacts JWT query parameters from URLs', () => {
    const sanitized = sanitizeForLog(
        'https://tmpemail.example.com/?jwt=abc.def.ghi',
        {}
    );

    assert.doesNotMatch(sanitized, /abc\.def\.ghi/);
    assert.equal(sanitized, '[REDACTED]');
});

test('redacts OAuth callback codes from log output', () => {
    const sanitized = sanitizeForLog(
        'http://localhost:1455/auth/callback?code=secret-auth-code&state=abc123',
        {}
    );

    assert.doesNotMatch(sanitized, /secret-auth-code/);
    assert.match(sanitized, /code=\[REDACTED]/);
});

test('masks email addresses while preserving domain visibility', () => {
    assert.equal(
        maskEmailForLog('eureka.lin@example.com'),
        'eur***@example.com'
    );
    assert.equal(
        maskEmailForLog('ab@example.com'),
        'a***@example.com'
    );
});

test('sanitizes email addresses embedded in log messages', () => {
    const sanitized = sanitizeForLog(
        '[Email] 当前注册邮箱: eureka.lin@example.com',
        {}
    );

    assert.equal(
        sanitized,
        '[Email] 当前注册邮箱: eur***@example.com'
    );
    assert.doesNotMatch(sanitized, /eureka\.lin@example\.com/);
});
