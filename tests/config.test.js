const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveConfig } = require('../src/config');

test('prefers environment variables over config file values', () => {
    const config = resolveConfig(
        {
            ddgToken: 'file-ddg',
            mailInboxUrl: 'https://file.example.com',
            cpaUrl: 'https://file-cpa.example.com',
            cpaKey: 'file-cpa-key',
            aliasEmailEnabled: false,
            aliasEmailDomain: 'file.example.com',
            gmailEmail: 'file@gmail.com',
            registrationTargets: [
                { gmailEmail: 'config@example.com', mailInboxUrl: 'https://config.example.com' }
            ]
        },
        {
            DDG_TOKEN: 'env-ddg',
            MAIL_INBOX_URL: 'https://env.example.com',
            CPA_URL: 'https://env-cpa.example.com',
            CPA_KEY: 'env-cpa-key',
            ALIAS_EMAIL_ENABLED: 'true',
            ALIAS_EMAIL_DOMAIN: 'env.example.com',
            GMAIL_EMAIL: 'env@gmail.com',
            REGISTRATION_TARGETS_JSON: JSON.stringify([
                { gmailEmail: 'env1@example.com', mailInboxUrl: 'https://env1.example.com' },
                { gmailEmail: 'env2@example.com', mailInboxUrl: 'https://env2.example.com' }
            ])
        }
    );

    assert.equal(config.ddgToken, 'env-ddg');
    assert.equal(config.mailInboxUrl, 'https://env.example.com');
    assert.equal(config.cpaUrl, 'https://env-cpa.example.com');
    assert.equal(config.cpaKey, 'env-cpa-key');
    assert.equal(config.aliasEmailEnabled, true);
    assert.equal(config.aliasEmailDomain, 'env.example.com');
    assert.equal(config.gmailEmail, 'env@gmail.com');
    assert.deepEqual(config.registrationTargets, [
        { gmailEmail: 'env1@example.com', mailInboxUrl: 'https://env1.example.com' },
        { gmailEmail: 'env2@example.com', mailInboxUrl: 'https://env2.example.com' }
    ]);
});

test('falls back to config file values when environment variables are absent', () => {
    const config = resolveConfig(
        {
            ddgToken: 'file-ddg',
            mailInboxUrl: 'https://file.example.com',
            cpaUrl: 'https://file-cpa.example.com',
            cpaKey: 'file-cpa-key',
            aliasEmailEnabled: false,
            aliasEmailDomain: 'file.example.com',
            gmailEmail: 'file@gmail.com',
            registrationTargets: [
                { gmailEmail: 'config@example.com', mailInboxUrl: 'https://config.example.com' }
            ]
        },
        {}
    );

    assert.equal(config.ddgToken, 'file-ddg');
    assert.equal(config.mailInboxUrl, 'https://file.example.com');
    assert.equal(config.cpaUrl, 'https://file-cpa.example.com');
    assert.equal(config.cpaKey, 'file-cpa-key');
    assert.equal(config.aliasEmailEnabled, false);
    assert.equal(config.aliasEmailDomain, 'file.example.com');
    assert.equal(config.gmailEmail, 'file@gmail.com');
    assert.deepEqual(config.registrationTargets, [
        { gmailEmail: 'config@example.com', mailInboxUrl: 'https://config.example.com' }
    ]);
});
