function isActiveTokenFilename(filename) {
    if (typeof filename !== 'string' || filename.startsWith('old_')) {
        return false;
    }

    return /^(token_.+|codex-.+)\.json$/.test(filename);
}

module.exports = {
    isActiveTokenFilename,
};
