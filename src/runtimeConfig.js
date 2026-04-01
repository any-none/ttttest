function validateRuntimeConfig(config, options = {}) {
    if (!config.mailInboxUrl) {
        throw new Error('mailInboxUrl is required');
    }

    if (!config.cpaUrl) {
        throw new Error('cpaUrl is required');
    }

    if (!config.cpaKey) {
        throw new Error('cpaKey is required');
    }

    if (options.emailMode === 'gmail') {
        if (!config.gmailEmail) {
            throw new Error('gmailEmail is required when emailMode=gmail');
        }

        return true;
    }

    if (config.aliasEmailEnabled) {
        if (!config.aliasEmailDomain) {
            throw new Error('aliasEmailDomain is required when aliasEmailEnabled=true');
        }

        return true;
    }

    if (!config.ddgToken) {
        throw new Error('ddgToken is required when aliasEmailEnabled=false');
    }

    return true;
}

module.exports = {
    validateRuntimeConfig,
};
