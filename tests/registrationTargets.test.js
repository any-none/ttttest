const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildRegistrationMatrix,
    getRegistrationTarget,
    resolveRegistrationTargets,
    validateRegistrationTarget,
} = require('../src/registrationTargets');

test('prefers REGISTRATION_TARGETS_JSON over config registration targets', () => {
    const targets = resolveRegistrationTargets(
        {
            registrationTargets: [
                { gmailEmail: 'config@example.com', mailInboxUrl: 'https://config.example.com' }
            ]
        },
        {
            REGISTRATION_TARGETS_JSON: JSON.stringify([
                { gmailEmail: 'env@example.com', mailInboxUrl: 'https://env.example.com' }
            ])
        }
    );

    assert.equal(targets.length, 1);
    assert.deepEqual(targets[0], {
        gmailEmail: 'env@example.com',
        mailInboxUrl: 'https://env.example.com'
    });
});

test('falls back to config registration targets when env secret is absent', () => {
    const targets = resolveRegistrationTargets(
        {
            registrationTargets: [
                { gmailEmail: 'config@example.com', mailInboxUrl: 'https://config.example.com' }
            ]
        },
        {}
    );

    assert.equal(targets.length, 1);
    assert.deepEqual(targets[0], {
        gmailEmail: 'config@example.com',
        mailInboxUrl: 'https://config.example.com'
    });
});

test('falls back to a single target built from legacy env vars', () => {
    const targets = resolveRegistrationTargets(
        {
            registrationTargets: []
        },
        {
            GMAIL_EMAIL: 'legacy@example.com',
            MAIL_INBOX_URL: 'https://legacy.example.com'
        }
    );

    assert.deepEqual(targets, [
        {
            gmailEmail: 'legacy@example.com',
            mailInboxUrl: 'https://legacy.example.com'
        }
    ]);
});

test('builds a full matrix with evenly distributed counts', () => {
    const matrix = buildRegistrationMatrix(50, [
        { gmailEmail: 'one@example.com', mailInboxUrl: 'https://example.com/1' },
        { gmailEmail: 'two@example.com', mailInboxUrl: 'https://example.com/2' },
        { gmailEmail: 'three@example.com', mailInboxUrl: 'https://example.com/3' },
        { gmailEmail: 'four@example.com', mailInboxUrl: 'https://example.com/4' },
        { gmailEmail: 'five@example.com', mailInboxUrl: 'https://example.com/5' }
    ]);

    assert.deepEqual(matrix, {
        include: [
            { targetIndex: 0, assignedCount: 10, slotNumber: 1 },
            { targetIndex: 1, assignedCount: 10, slotNumber: 2 },
            { targetIndex: 2, assignedCount: 10, slotNumber: 3 },
            { targetIndex: 3, assignedCount: 10, slotNumber: 4 },
            { targetIndex: 4, assignedCount: 10, slotNumber: 5 }
        ]
    });
});

test('distributes remainder across the earliest slots', () => {
    const matrix = buildRegistrationMatrix(7, [
        { gmailEmail: 'one@example.com', mailInboxUrl: 'https://example.com/1' },
        { gmailEmail: 'two@example.com', mailInboxUrl: 'https://example.com/2' },
        { gmailEmail: 'three@example.com', mailInboxUrl: 'https://example.com/3' },
        { gmailEmail: 'four@example.com', mailInboxUrl: 'https://example.com/4' },
        { gmailEmail: 'five@example.com', mailInboxUrl: 'https://example.com/5' }
    ]);

    assert.deepEqual(matrix, {
        include: [
            { targetIndex: 0, assignedCount: 2, slotNumber: 1 },
            { targetIndex: 1, assignedCount: 2, slotNumber: 2 },
            { targetIndex: 2, assignedCount: 1, slotNumber: 3 },
            { targetIndex: 3, assignedCount: 1, slotNumber: 4 },
            { targetIndex: 4, assignedCount: 1, slotNumber: 5 }
        ]
    });
});

test('does not create zero-count matrix entries', () => {
    const matrix = buildRegistrationMatrix(2, [
        { gmailEmail: 'one@example.com', mailInboxUrl: 'https://example.com/1' },
        { gmailEmail: 'two@example.com', mailInboxUrl: 'https://example.com/2' },
        { gmailEmail: 'three@example.com', mailInboxUrl: 'https://example.com/3' }
    ]);

    assert.deepEqual(matrix, {
        include: [
            { targetIndex: 0, assignedCount: 1, slotNumber: 1 },
            { targetIndex: 1, assignedCount: 1, slotNumber: 2 }
        ]
    });
});

test('selects the requested registration target by index', () => {
    const selected = getRegistrationTarget([
        { gmailEmail: 'one@example.com', mailInboxUrl: 'https://example.com/1' },
        { gmailEmail: 'two@example.com', mailInboxUrl: 'https://example.com/2' }
    ], 1);

    assert.deepEqual(selected, {
        gmailEmail: 'two@example.com',
        mailInboxUrl: 'https://example.com/2'
    });
});

test('validates required fields for gmail mode', () => {
    assert.throws(() => {
        validateRegistrationTarget(
            { gmailEmail: '', mailInboxUrl: 'https://example.com/1' },
            { emailMode: 'gmail', targetIndex: 0 }
        );
    }, /gmailEmail/);

    assert.throws(() => {
        validateRegistrationTarget(
            { gmailEmail: 'one@example.com', mailInboxUrl: '' },
            { emailMode: 'gmail', targetIndex: 0 }
        );
    }, /mailInboxUrl/);
});
