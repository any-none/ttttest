const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeCpaAuthFilesUrl, uploadAuthFile } = require('../src/cpaUploader');

test('normalizes a CPA root URL to the auth-files endpoint', () => {
    assert.equal(
        normalizeCpaAuthFilesUrl('https://cpa.example.com'),
        'https://cpa.example.com/v0/management/auth-files'
    );
});

test('retries CPA upload and eventually succeeds', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-cpa-'));
    const filePath = path.join(tempDir, 'codex-user@example.com.json');
    fs.writeFileSync(filePath, '{"type":"codex"}');

    const calls = [];
    let attempt = 0;
    const result = await uploadAuthFile(filePath, {
        cpaUrl: 'https://cpa.example.com',
        cpaKey: 'example-cpa-key'
    }, {
        fetch: async (url, options) => {
            attempt += 1;
            calls.push({ url, options });

            if (attempt < 3) {
                return {
                    ok: false,
                    status: 500,
                    text: async () => 'temporary failure'
                };
            }

            return {
                ok: true,
                status: 200,
                text: async () => 'ok'
            };
        },
        delay: async () => {}
    });

    assert.equal(calls.length, 3);
    assert.equal(result.uploaded, true);
    assert.equal(result.attempts, 3);
    assert.equal(calls[0].url, 'https://cpa.example.com/v0/management/auth-files');
    fs.rmSync(tempDir, { recursive: true, force: true });
});
