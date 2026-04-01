const fs = require('fs');

function normalizeRegistrationTarget(target = {}) {
    return {
        gmailEmail: String(target.gmailEmail || '').trim(),
        mailInboxUrl: String(target.mailInboxUrl || '').trim(),
    };
}

function normalizeRegistrationTargets(targets = []) {
    if (!Array.isArray(targets)) {
        return [];
    }

    return targets.map(normalizeRegistrationTarget);
}

function parseRegistrationTargetsJson(value) {
    if (!value) {
        return [];
    }

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
        throw new Error('registrationTargets must be a JSON array');
    }

    return normalizeRegistrationTargets(parsed);
}

function parseRegistrationTargetsFile(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return [];
    }

    return parseRegistrationTargetsJson(fs.readFileSync(filePath, 'utf8'));
}

function resolveRegistrationTargetCount(config = {}, env = process.env) {
    const configuredCount = parseInt(env.REGISTRATION_TARGET_COUNT, 10);
    if (Number.isInteger(configuredCount) && configuredCount > 0) {
        return configuredCount;
    }

    const normalizedTargets = normalizeRegistrationTargets(config.registrationTargets);
    if (normalizedTargets.length > 0) {
        return normalizedTargets.length;
    }

    return resolveRegistrationTargets(config, env).length;
}

function resolveRegistrationTargets(config = {}, env = process.env) {
    if (env.REGISTRATION_TARGETS_JSON) {
        return parseRegistrationTargetsJson(env.REGISTRATION_TARGETS_JSON);
    }

    if (env.REGISTRATION_TARGETS_FILE) {
        return parseRegistrationTargetsFile(env.REGISTRATION_TARGETS_FILE);
    }

    if (env.GMAIL_EMAIL || env.MAIL_INBOX_URL) {
        return normalizeRegistrationTargets([
            {
                gmailEmail: env.GMAIL_EMAIL,
                mailInboxUrl: env.MAIL_INBOX_URL,
            }
        ]);
    }

    return normalizeRegistrationTargets(config.registrationTargets);
}

function validateRegistrationTarget(target, options = {}) {
    const normalizedTarget = normalizeRegistrationTarget(target);
    const slotLabel = Number.isInteger(options.targetIndex)
        ? `registrationTargets[${options.targetIndex}]`
        : 'registrationTarget';

    if (!normalizedTarget.mailInboxUrl) {
        throw new Error(`${slotLabel}.mailInboxUrl is required`);
    }

    if (options.emailMode === 'gmail' && !normalizedTarget.gmailEmail) {
        throw new Error(`${slotLabel}.gmailEmail is required when emailMode=gmail`);
    }

    return normalizedTarget;
}

function buildRegistrationMatrix(totalCount, targets = []) {
    const normalizedTargets = normalizeRegistrationTargets(targets);
    const safeTotalCount = Number.isInteger(totalCount) && totalCount > 0 ? totalCount : 0;
    const include = [];

    if (safeTotalCount === 0 || normalizedTargets.length === 0) {
        return { include };
    }

    const baseCount = Math.floor(safeTotalCount / normalizedTargets.length);
    const remainder = safeTotalCount % normalizedTargets.length;

    for (let index = 0; index < normalizedTargets.length; index += 1) {
        const assignedCount = baseCount + (index < remainder ? 1 : 0);

        if (assignedCount <= 0) {
            continue;
        }

        include.push({
            targetIndex: index,
            assignedCount,
            slotNumber: index + 1,
        });
    }

    return { include };
}

function getRegistrationTarget(targets = [], targetIndex = 0) {
    const normalizedTargets = normalizeRegistrationTargets(targets);
    const selectedTarget = normalizedTargets[targetIndex];

    if (!selectedTarget) {
        throw new Error(`registration target not found for index ${targetIndex}`);
    }

    return selectedTarget;
}

module.exports = {
    buildRegistrationMatrix,
    getRegistrationTarget,
    normalizeRegistrationTarget,
    normalizeRegistrationTargets,
    parseRegistrationTargetsFile,
    parseRegistrationTargetsJson,
    resolveRegistrationTargetCount,
    resolveRegistrationTargets,
    validateRegistrationTarget,
};
