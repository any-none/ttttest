function resolveTargetCount(argv = process.argv) {
    const parsed = parseInt(argv[2], 10);

    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
    }

    return 10;
}

module.exports = {
    resolveTargetCount,
};
