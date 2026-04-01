const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, '..', 'config.json');

function normalizeBoolean(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
}

function getOverrideValue(env, envKey, fallbackValue) {
    if (Object.prototype.hasOwnProperty.call(env, envKey) && env[envKey] !== '') {
        return env[envKey];
    }

    return fallbackValue;
}

// 读取配置文件
function loadConfig(filePath = configPath) {
    if (!fs.existsSync(filePath)) {
        console.error(`[Config] 配置文件不存在: ${filePath}`);
        return {};
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('[Config] 解析配置文件失败:', error.message);
        return {};
    }
}

function normalizeConfig(rawConfig = {}) {
    return {
        ddgToken: rawConfig.ddgToken,
        gmailEmail: rawConfig.gmailEmail || '',
        mailInboxUrl: rawConfig.mailInboxUrl,
        oauthClientId: rawConfig.oauthClientId || 'app_EMoamEEZ73f0CkXaXp7hrann',
        oauthRedirectPort: parseInt(rawConfig.oauthRedirectPort, 10) || 1455,
        aliasEmailEnabled: normalizeBoolean(rawConfig.aliasEmailEnabled),
        aliasEmailDomain: rawConfig.aliasEmailDomain || '',
        cpaUrl: rawConfig.cpaUrl || '',
        cpaKey: rawConfig.cpaKey || '',
    };
}

function resolveConfig(rawConfig = loadConfig(), env = process.env) {
    return normalizeConfig({
        ddgToken: getOverrideValue(env, 'DDG_TOKEN', rawConfig.ddgToken),
        gmailEmail: getOverrideValue(env, 'GMAIL_EMAIL', rawConfig.gmailEmail),
        mailInboxUrl: getOverrideValue(env, 'MAIL_INBOX_URL', rawConfig.mailInboxUrl),
        oauthClientId: getOverrideValue(env, 'OAUTH_CLIENT_ID', rawConfig.oauthClientId),
        oauthRedirectPort: getOverrideValue(env, 'OAUTH_REDIRECT_PORT', rawConfig.oauthRedirectPort),
        aliasEmailEnabled: getOverrideValue(env, 'ALIAS_EMAIL_ENABLED', rawConfig.aliasEmailEnabled),
        aliasEmailDomain: getOverrideValue(env, 'ALIAS_EMAIL_DOMAIN', rawConfig.aliasEmailDomain),
        cpaUrl: getOverrideValue(env, 'CPA_URL', rawConfig.cpaUrl),
        cpaKey: getOverrideValue(env, 'CPA_KEY', rawConfig.cpaKey),
    });
}

const config = resolveConfig(loadConfig());

module.exports = {
    loadConfig,
    normalizeConfig,
    resolveConfig,
    // DDG Email Alias
    ddgToken: config.ddgToken,

    // Gmail Plus Alias
    gmailEmail: config.gmailEmail,
    
    // Mail Inbox
    mailInboxUrl: config.mailInboxUrl,
    
    // OAuth
    oauthClientId: config.oauthClientId || 'app_EMoamEEZ73f0CkXaXp7hrann',
    oauthRedirectPort: parseInt(config.oauthRedirectPort, 10) || 1455,

    // Catch-all Alias Email
    aliasEmailEnabled: config.aliasEmailEnabled,
    aliasEmailDomain: config.aliasEmailDomain,

    // CPA Upload
    cpaUrl: config.cpaUrl,
    cpaKey: config.cpaKey,
};
