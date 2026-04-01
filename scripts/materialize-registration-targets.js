const fs = require('fs');
const path = require('path');

const config = require('../src/config');
const { resolveRegistrationTargets } = require('../src/registrationTargets');

function main() {
    const outputPath = process.argv[2] || '.codex-runtime/registration-targets.json';
    const targets = resolveRegistrationTargets(config, process.env);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(targets));

    console.log(`[Targets] Materialized ${targets.length} registration target(s).`);
}

try {
    main();
} catch (error) {
    console.error(`[Targets] ${error.message}`);
    process.exit(1);
}
