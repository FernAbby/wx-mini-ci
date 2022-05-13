const inquirer = require('inquirer');
const childProcess = require('child_process');
const { DEFAULT_ENVIRONMENTS, ENV2BRANCH } = require('./contant');
const { getPrefix, getVersionNumber } = require('./util');

const questions = [{
    type: 'list',
    name: 'env',
    message: '发布环境:',
    choices: DEFAULT_ENVIRONMENTS,
    prefix: '=>',
    default: DEFAULT_ENVIRONMENTS[0],
},{
    type: 'list',
    name: 'branch',
    message: '发布分支:',
    choices: ['develop', 'master', 'current'],
    prefix: '=>',
    default: 'develop',
    when: ({ env }) => env !== 'prod',
}, {
    type: 'list',
    name: 'type',
    message: '更新类型:',
    choices: [
        // bug修复
        'fix',
        // 特性更新
        'feature',
        // 版本升级
        'major',
    ],
    prefix: '=>',
    default: 'fix'
}, {
    type: 'input',
    name: 'desc',
    prefix: '=>',
    message: '请输入更新描述:',
}];

// 版本自增
const processMiniVersion = (type, version) => {
    switch (type) {
        case 'major': {
            const [major] = version.split('.');
            return `${Number(major) + 1}.0.0`;
        }
        case 'feature': {
            const [major, feat] = version.split('.');
            return `${major}.${Number(feat) + 1}.0`;
        }
        case 'fix': {
            const [major, feat, fix] = version.split('.');
            return `${major}.${feat}.${Number(fix) + 1}`;
        }
        default:
            return version;
    }
};

// 获取当前分支
const getCurrentBranch = function () {
    return childProcess
        .execSync('git rev-parse --abbrev-ref HEAD | grep -v HEAD')
        .toString()
        .replace(/\s+$/, '');
}

// 获取当前分支最新一次commitId
const getLatestCommitId = function (branch) {
    return childProcess
        .execSync(`git rev-list origin/${branch} -n 1`)
        .toString()
        .replace(/\s+$/, '');
}

// 清缓存
const clearTagCache = function() {
    childProcess.execSync(`git tag -l | xargs git tag -d`);
    childProcess.execSync(`git fetch -t -p -f`);
}

// (tag是按字母排序，而非时间排序) 为了兼容低版本git而写的方法，否则可以用getTagsListNew
const getTagsList = function(prefix = 't') {
    const tagsList = childProcess.execSync(`git tag -l -n ${prefix}[0-9]*`).toString()
        .split('\n')
        .filter(item => item)
        .map(item => {
            const [version, desc] = item.split('  ').filter(item => item);
            return { version, desc };
        }).sort((a, b) => b.version.localeCompare(a.version));
    return tagsList;
}

// 获取tag列表 低版本git不支持--sort --format 参数，所以参看getTagsList实现
const getTagsListNew = function(prefix, num = 10) {
    const command = `git tag -l ${prefix}[0-9]* --sort=-creatordate --format \'%(refname:short)$$%(subject)$$%(creatordate:format:%Y-%m-%d %H:%M:%S)\' | head -n ${num}`;
    const tags = childProcess.execSync(command).toString()
        .split('\n')
        .filter(item => item);
    return tags.map((item) => {
        const [version, desc, createTime] = item.split('$$');
        return { version, desc, createTime };
    });
};

// 获取最新tag
const getLatestTag = function(prefix = 't') {
    const tagsList = getTagsList(prefix);
    return tagsList && tagsList.length ? tagsList[0] : null;
}

// 创建tag
const generateTag = function(version, desc, branch) {
    if (branch !== 'current') {
        const commitId = getLatestCommitId(branch);
        childProcess.execSync(`git tag -a ${version} -m "${branch}: ${desc}" ${commitId} && git push origin --tags`);
    } else {
        const currentBranch = getCurrentBranch();
        childProcess.execSync(`git tag -a ${version} -m "${currentBranch}: ${desc}" && git push origin --tags`);
    }
};

const prompts = function (questionList) {
    return inquirer.prompt(questionList);
};

const create = async function({ clearCache, config }) {
    const { env, branch, type, desc } = await prompts(questions);
    if (clearCache) clearTagCache();
    const prefix = getPrefix(env);
    const latestTag = getLatestTag(prefix);
    const currentVersion = getVersionNumber(latestTag && latestTag.version);
    const newVersion = `${prefix}${processMiniVersion(type, currentVersion)}`;
    generateTag(newVersion, desc, branch || ENV2BRANCH[env]);
};

module.exports = {
    getCurrentBranch,
    getLatestTag,
    generateTag,
    getTagsList,
    getTagsListNew,
    create,
};
