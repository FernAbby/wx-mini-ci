const DEFAULT_ENVIRONMENTS = ['test', 'demo', 'prod'];

const ENV2BRANCH = {
    test: 'develop',
    demo: 'release',
    prod: 'master',
};

const ENV2PREFIX = {
    test: 't',
    demo: 'd',
    prod: 'v',
};

module.exports = {
    DEFAULT_ENVIRONMENTS,
    ENV2BRANCH,
    ENV2PREFIX,
};
