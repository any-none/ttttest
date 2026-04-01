const fs = require('fs');

const config = require('../src/config');
const { normalizeEmailMode } = require('../src/emailMode');
const {
    buildRegistrationMatrix,
    resolveRegistrationTargets,
    validateRegistrationTarget,
} = require('../src/registrationTargets');
const { resolveTargetCount } = require('../src/targetCount');

function appendOutput(name, value) {
    if (!process.env.GITHUB_OUTPUT) {
        console.log(`${name}=${value}`);
        return;
    }

    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function main() {
    const totalCount = resolveTargetCount(['node', 'build-action-matrix', process.argv[2]]);
    const emailMode = normalizeEmailMode(process.argv[3]);
    const targets = resolveRegistrationTargets(config, process.env);

    if (!targets.length) {
        throw new Error('No registration targets configured. Set REGISTRATION_TARGETS_JSON or legacy GMAIL_EMAIL/MAIL_INBOX_URL secrets.');
    }

    targets.forEach((target, index) => {
        validateRegistrationTarget(target, {
            emailMode,
            targetIndex: index,
        });
    });

    const matrix = buildRegistrationMatrix(totalCount, targets);
    if (!matrix.include.length) {
        throw new Error(`No registration jobs were generated for total count ${totalCount}.`);
    }

    appendOutput('matrix', JSON.stringify(matrix));
    appendOutput('target_count', String(targets.length));
    appendOutput('job_count', String(matrix.include.length));

    console.log(`[Matrix] Prepared ${matrix.include.length} job(s) from ${targets.length} configured target(s), total count ${totalCount}.`);
}

try {
    main();
} catch (error) {
    console.error(`[Matrix] ${error.message}`);
    process.exit(1);
}
