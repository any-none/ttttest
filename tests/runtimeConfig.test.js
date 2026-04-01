const test = require('node:test');
const assert = require('node:assert/strict');

const { validateRuntimeConfig } = require('../src/runtimeConfig');

test('does not require ddgToken when alias email mode is enabled', () => {
    assert.doesNotThrow(() => {
        validateRuntimeConfig({
            aliasEmailEnabled: true,
            aliasEmailDomain: 'lllooolll.aleeas.com',
            ddgToken: '',
            gmailEmail: '',
            mailInboxUrl: 'https://example.com/inbox',
            cpaUrl: 'https://cpa.example.com',
            cpaKey: 'cpa-key'
        });
    });
});

test('requires aliasEmailDomain when alias email mode is enabled', () => {
    assert.throws(() => {
        validateRuntimeConfig({
            aliasEmailEnabled: true,
            aliasEmailDomain: '',
            ddgToken: '',
            gmailEmail: '',
            mailInboxUrl: 'https://example.com/inbox',
            cpaUrl: 'https://cpa.example.com',
            cpaKey: 'cpa-key'
        });
    }, /aliasEmailDomain/);
});

test('requires ddgToken when alias email mode is disabled', () => {
    assert.throws(() => {
        validateRuntimeConfig({
            aliasEmailEnabled: false,
            aliasEmailDomain: '',
            ddgToken: '',
            gmailEmail: '',
            mailInboxUrl: 'https://example.com/inbox',
            cpaUrl: 'https://cpa.example.com',
            cpaKey: 'cpa-key'
        });
    }, /ddgToken/);
});

test('requires cpaUrl for runtime registration flow', () => {
    assert.throws(() => {
        validateRuntimeConfig({
            aliasEmailEnabled: true,
            aliasEmailDomain: 'lllooolll.aleeas.com',
            ddgToken: '',
            gmailEmail: '',
            mailInboxUrl: 'https://example.com/inbox',
            cpaUrl: '',
            cpaKey: 'cpa-key'
        });
    }, /cpaUrl/);
});

test('requires cpaKey for runtime registration flow', () => {
    assert.throws(() => {
        validateRuntimeConfig({
            aliasEmailEnabled: true,
            aliasEmailDomain: 'lllooolll.aleeas.com',
            ddgToken: '',
            gmailEmail: '',
            mailInboxUrl: 'https://example.com/inbox',
            cpaUrl: 'https://cpa.example.com',
            cpaKey: ''
        });
    }, /cpaKey/);
});

test('does not require ddgToken when gmail mode is enabled', () => {
    assert.doesNotThrow(() => {
        validateRuntimeConfig({
            aliasEmailEnabled: false,
            aliasEmailDomain: '',
            ddgToken: '',
            gmailEmail: 'lokiwanglokiwang@gmail.com',
            mailInboxUrl: 'https://example.com/inbox',
            cpaUrl: 'https://cpa.example.com',
            cpaKey: 'cpa-key'
        }, {
            emailMode: 'gmail'
        });
    });
});

test('requires gmailEmail when gmail mode is enabled', () => {
    assert.throws(() => {
        validateRuntimeConfig({
            aliasEmailEnabled: false,
            aliasEmailDomain: '',
            ddgToken: '',
            gmailEmail: '',
            mailInboxUrl: 'https://example.com/inbox',
            cpaUrl: 'https://cpa.example.com',
            cpaKey: 'cpa-key'
        }, {
            emailMode: 'gmail'
        });
    }, /gmailEmail/);
});
