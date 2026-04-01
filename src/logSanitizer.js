function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function maskEmailForLog(input) {
    return String(input ?? '').replace(
        /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})(?!\.[A-Za-z0-9])/g,
        (_, localPart, domain) => {
            const visibleChars = localPart.length <= 3 ? 1 : 3;
            return `${localPart.slice(0, visibleChars)}***@${domain}`;
        }
    );
}

function sanitizeForLog(input, secrets = {}) {
    let output = String(input ?? '');

    const exactSecrets = [
        secrets.cpaKey,
        secrets.ddgToken,
        secrets.mailInboxUrl,
        secrets.cpaUrl,
        secrets.uploadUrl,
    ].filter(Boolean);

    for (const secret of exactSecrets) {
        output = output.replace(new RegExp(escapeRegExp(secret), 'g'), '[REDACTED]');
    }

    output = output.replace(/https?:\/\/[^\s"'`]+?\?jwt=[^&\s"'`]+/gi, '[REDACTED]');
    output = output.replace(/(jwt=)[^&\s"'`]+/gi, '$1[REDACTED]');
    output = output.replace(/(code=)[^&\s"'`]+/gi, '$1[REDACTED]');
    output = output.replace(/(state=)[^&\s"'`]+/gi, '$1[REDACTED]');
    output = output.replace(/Bearer\s+([A-Za-z0-9._-]+)/gi, 'Bearer [REDACTED]');
    output = maskEmailForLog(output);

    return output;
}

function sanitizeArgs(args, secrets) {
    return args.map((arg) => {
        if (typeof arg === 'string') {
            return sanitizeForLog(arg, secrets);
        }

        if (arg instanceof Error) {
            return sanitizeForLog(arg.stack || arg.message, secrets);
        }

        if (arg && typeof arg === 'object') {
            try {
                return sanitizeForLog(JSON.stringify(arg), secrets);
            } catch (error) {
                return arg;
            }
        }

        return arg;
    });
}

function installConsoleSanitizer(secrets = {}) {
    if (console.__codexSanitizerInstalled) {
        return;
    }

    const methods = ['log', 'info', 'warn', 'error'];
    for (const method of methods) {
        const original = console[method].bind(console);
        console[method] = (...args) => original(...sanitizeArgs(args, secrets));
    }

    Object.defineProperty(console, '__codexSanitizerInstalled', {
        value: true,
        configurable: false,
        enumerable: false,
        writable: false,
    });
}

module.exports = {
    maskEmailForLog,
    sanitizeForLog,
    installConsoleSanitizer,
};
