const fs = require('fs');

const config = require('../src/config');
const { normalizeEmailMode } = require('../src/emailMode');
const {
    buildRegistrationMatrix,
    resolveRegistrationTargetCount,
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
    normalizeEmailMode(process.argv[3]);
    const targetCount = resolveRegistrationTargetCount(config, process.env);

    if (targetCount <= 0) {
        throw new Error('No registration targets configured. Set REGISTRATION_TARGET_COUNT or provide configured targets.');
    }

    const matrix = buildRegistrationMatrix(
        totalCount,
        Array.from({ length: targetCount }, () => ({}))
    );
    if (!matrix.include.length) {
        throw new Error(`No registration jobs were generated for total count ${totalCount}.`);
    }

    appendOutput('matrix', JSON.stringify(matrix));
    appendOutput('target_count', String(targetCount));
    appendOutput('job_count', String(matrix.include.length));

    console.log(`[Matrix] Prepared ${matrix.include.length} job(s) from ${targetCount} configured target(s), total count ${totalCount}.`);
}

try {
    main();
} catch (error) {
    console.error(`[Matrix] ${error.message}`);
    process.exit(1);
}
