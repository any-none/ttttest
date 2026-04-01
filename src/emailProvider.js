const { randomBytes } = require('node:crypto');

const config = require('./config');
const { DDGEmailProvider } = require('./ddgProvider');

class ConfigurableEmailProvider {
    constructor(providerConfig = config, deps = {}) {
        this.providerConfig = providerConfig;
        this.randomBytes = deps.randomBytes || randomBytes;
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

    async generateAlias() {
        if (this.providerConfig.aliasEmailEnabled) {
            this.emailAddress = this.generateLocalAlias();
            console.log('[Email] 已生成 catch-all alias 邮箱');
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
