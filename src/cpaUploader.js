const fs = require('node:fs/promises');
const path = require('node:path');

const config = require('./config');
const { sanitizeForLog } = require('./logSanitizer');

function normalizeCpaAuthFilesUrl(apiUrl) {
    const normalized = String(apiUrl || '').trim().replace(/\/+$/, '');
    const lowerUrl = normalized.toLowerCase();

    if (!normalized) {
        return '';
    }

    if (lowerUrl.endsWith('/auth-files')) {
        return normalized;
    }

    if (lowerUrl.endsWith('/v0/management') || lowerUrl.endsWith('/management')) {
        return `${normalized}/auth-files`;
    }

    if (lowerUrl.endsWith('/v0')) {
        return `${normalized}/management/auth-files`;
    }

    return `${normalized}/v0/management/auth-files`;
}

async function extractResponseText(response) {
    try {
        const text = await response.text();
        return text.slice(0, 200);
    } catch (error) {
        return `HTTP ${response.status}`;
    }
}

async function postMultipart(uploadUrl, filename, fileContent, cpaKey, fetchImpl) {
    const formData = new FormData();
    formData.append(
        'file',
        new Blob([fileContent], { type: 'application/json' }),
        filename
    );

    return fetchImpl(uploadUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${cpaKey}`,
            Accept: 'application/json, text/plain, */*',
        },
        body: formData,
    });
}

async function postRawJson(uploadUrl, filename, fileContent, cpaKey, fetchImpl) {
    const rawUploadUrl = `${uploadUrl}?name=${encodeURIComponent(filename)}`;
    return fetchImpl(rawUploadUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${cpaKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
        },
        body: fileContent,
    });
}

async function uploadAuthFile(filePath, uploadConfig = config, deps = {}) {
    const fetchImpl = deps.fetch || globalThis.fetch;
    const delay = deps.delay || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    const logger = deps.logger || console;
    const maxAttempts = Number.isInteger(uploadConfig.maxUploadAttempts)
        ? uploadConfig.maxUploadAttempts
        : 3;

    const cpaUrl = uploadConfig.cpaUrl;
    const cpaKey = uploadConfig.cpaKey;
    const uploadUrl = normalizeCpaAuthFilesUrl(cpaUrl);
    const filename = path.basename(filePath);
    const fileContent = await fs.readFile(filePath);

    let lastError = 'unknown error';

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            let response = await postMultipart(uploadUrl, filename, fileContent, cpaKey, fetchImpl);

            if (!response.ok && [404, 405, 415].includes(response.status)) {
                response = await postRawJson(uploadUrl, filename, fileContent, cpaKey, fetchImpl);
            }

            if (response.ok) {
                logger.log('[CPA] auth file 上传成功');
                return { uploaded: true, attempts: attempt };
            }

            lastError = await extractResponseText(response);
        } catch (error) {
            lastError = sanitizeForLog(error.message || String(error), {
                cpaKey,
                cpaUrl,
                uploadUrl,
            });
        }

        if (attempt < maxAttempts) {
            logger.warn(`[CPA] 上传失败，准备重试 (${attempt}/${maxAttempts}): ${lastError}`);
            await delay(300 * attempt);
            continue;
        }
    }

    logger.error(`[CPA] 上传失败，已达到最大尝试次数: ${lastError}`);
    return { uploaded: false, attempts: maxAttempts, error: lastError };
}

module.exports = {
    normalizeCpaAuthFilesUrl,
    uploadAuthFile,
};
