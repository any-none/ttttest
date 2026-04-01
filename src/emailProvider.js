const { randomBytes } = require('node:crypto');

const config = require('./config');
const { DDGEmailProvider } = require('./ddgProvider');
const { maskEmailForLog } = require('./logSanitizer');
const { normalizeEmailMode } = require('./emailMode');

const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz0123456789';

class ConfigurableEmailProvider {
    constructor(providerConfig = config, deps = {}) {
        this.providerConfig = providerConfig;
        this.randomBytes = deps.randomBytes || randomBytes;
        this.emailMode = normalizeEmailMode(deps.emailMode);
        this.ddgProvider = new DDGEmailProvider(
            providerConfig,
            { axios: deps.axios }
        );
        this.emailAddress = null;
    }

    generateLocalAlias() {
        if (!this.providerConfig.aliasEmailDomain) {
            throw new Error('aliasEmailDomain is required when aliasEmailEnabled=true');
        }

        const localPart = this.randomBytes(8).toString('hex');
        return `${localPart}@${this.providerConfig.aliasEmailDomain}`;
    }

    generateRandomAlphaNumeric(length) {
        const bytes = this.randomBytes(length);
        let result = '';

        for (let index = 0; index < length; index += 1) {
            result += ALPHANUMERIC[bytes[index] % ALPHANUMERIC.length];
        }

        return result;
    }

    generateGmailAlias() {
        if (!this.providerConfig.gmailEmail) {
            throw new Error('gmailEmail is required when emailMode=gmail');
        }

        const match = String(this.providerConfig.gmailEmail).trim().match(/^([^@\s]+)@([^@\s]+\.[^@\s]+)$/i);
        if (!match) {
            throw new Error('gmailEmail must be a valid email address');
        }

        const baseLocalPart = match[1].split('+')[0];
        const domain = match[2];
        const suffixLength = 3 + (this.randomBytes(1)[0] % 2);
        const suffix = this.generateRandomAlphaNumeric(suffixLength);

        return `${baseLocalPart}+${suffix}@${domain}`;
    }

    async generateAlias() {
        if (this.emailMode === 'gmail') {
            this.emailAddress = this.generateGmailAlias();
            console.log(`[Email] 已生成 Gmail alias 邮箱: ${maskEmailForLog(this.emailAddress)}`);
            return this.emailAddress;
        }

        if (this.providerConfig.aliasEmailEnabled) {
            this.emailAddress = this.generateLocalAlias();
            console.log(`[Email] 已生成 catch-all alias 邮箱: ${maskEmailForLog(this.emailAddress)}`);
            return this.emailAddress;
        }

        this.emailAddress = await this.ddgProvider.generateAlias();
        return this.emailAddress;
    }

    getEmail() {
        return this.emailAddress;
    }
}

module.exports = {
    ConfigurableEmailProvider,
};
