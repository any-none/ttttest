const fs = require('fs');

const config = require('../src/config');
const { normalizeEmailMode } = require('../src/emailMode');
const {
    getRegistrationTarget,
    resolveRegistrationTargets,
    validateRegistrationTarget,
} = require('../src/registrationTargets');

function appendEnv(name, value) {
    if (!process.env.GITHUB_ENV) {
        throw new Error('GITHUB_ENV is required');
    }

    fs.appendFileSync(process.env.GITHUB_ENV, `${name}=${value}\n`);
}

function main() {
    const targetIndex = parseInt(process.argv[2], 10);
    if (!Number.isInteger(targetIndex) || targetIndex < 0) {
        throw new Error(`Invalid target index: ${process.argv[2]}`);
    }

    const emailMode = normalizeEmailMode(process.argv[3]);
    const targets = resolveRegistrationTargets(config, process.env);
    const target = validateRegistrationTarget(
        getRegistrationTarget(targets, targetIndex),
        {
            emailMode,
            targetIndex,
        }
    );

    console.log(`::add-mask::${target.mailInboxUrl}`);
    appendEnv('MAIL_INBOX_URL', target.mailInboxUrl);

    if (target.gmailEmail) {
        console.log(`::add-mask::${target.gmailEmail}`);
        appendEnv('GMAIL_EMAIL', target.gmailEmail);
    }

    appendEnv('REGISTRATION_TARGET_SLOT', String(targetIndex + 1));
    console.log(`[Targets] Loaded isolated registration target slot ${targetIndex + 1}.`);
}

try {
    main();
} catch (error) {
    console.error(`[Targets] ${error.message}`);
    process.exit(1);
}
