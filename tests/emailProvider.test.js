const test = require('node:test');
const assert = require('node:assert/strict');

const { ConfigurableEmailProvider } = require('../src/emailProvider');

test('generates a local catch-all alias email when alias mode is enabled', async () => {
    let ddgCalls = 0;
    const provider = new ConfigurableEmailProvider(
        {
            aliasEmailEnabled: true,
            aliasEmailDomain: 'lllooolll.aleeas.com',
            ddgToken: 'unused-token'
        },
        {
            axios: {
                post: async () => {
                    ddgCalls += 1;
                    throw new Error('DDG should not be called in alias mode');
                }
            },
            randomBytes: () => Buffer.from('abcdef0123456789')
        }
    );

    const email = await provider.generateAlias();

    assert.match(email, /^[a-z0-9]+@lllooolll\.aleeas\.com$/);
    assert.equal(provider.getEmail(), email);
    assert.equal(ddgCalls, 0);
});

test('uses DDG alias generation when alias mode is disabled', async () => {
    const provider = new ConfigurableEmailProvider(
        {
            aliasEmailEnabled: false,
            aliasEmailDomain: 'lllooolll.aleeas.com',
            ddgToken: 'ddg-token'
        },
        {
            axios: {
                post: async () => ({
                    data: {
                        address: 'duck-alias'
                    }
                })
            }
        }
    );

    const email = await provider.generateAlias();

    assert.equal(email, 'duck-alias@duck.com');
    assert.equal(provider.getEmail(), 'duck-alias@duck.com');
});

test('throws a clear error when alias mode is enabled without a domain', async () => {
    const provider = new ConfigurableEmailProvider({
        aliasEmailEnabled: true,
        aliasEmailDomain: '',
        ddgToken: 'unused-token'
    });

    await assert.rejects(
        () => provider.generateAlias(),
        /aliasEmailDomain/
    );
});
