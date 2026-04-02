const DEFAULT_EMAIL_MODE = 'default';
const GMAIL_EMAIL_MODE = 'gmail';

function normalizeEmailMode(value) {
    const normalized = String(value ?? '').trim().toLowerCase();

    if (!normalized || normalized === DEFAULT_EMAIL_MODE) {
        return DEFAULT_EMAIL_MODE;
    }

    if (normalized === GMAIL_EMAIL_MODE || normalized === 'gamil') {
        return GMAIL_EMAIL_MODE;
    }

    throw new Error(`Unsupported email mode: ${value}`);
}

function resolveEmailMode(argv = process.argv) {
    return normalizeEmailMode(argv[3]);
}

module.exports = {
    DEFAULT_EMAIL_MODE,
    GMAIL_EMAIL_MODE,
    normalizeEmailMode,
    resolveEmailMode,
};
