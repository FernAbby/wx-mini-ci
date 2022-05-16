const ci = require('miniprogram-ci');
const shell = require('shelljs');
const chalk = require('chalk');
const { getPrefix, getPath } = require('./util');
const { runBuild } = require('./build');
const { getTagsList, getCurrentBranch } = require('./tag');

const startIndex = { demo: 2, test: 1, prod: 0 }; // 机器人对应起始游标

const generateRobot = function(length, env, maxVersionNum) {
    let number = maxVersionNum > 10 ? 10 :maxVersionNum ;
    return (length % number) + (startIndex[env] * number + 1);
}

const upload = async function({ version, desc, robot, config }) {
    shell.echo(chalk.green.bold('开始上传...'));

    const { appid, projectPath, keyPath } = config;

    try {
        const project = new ci.Project({
            appid,
            type: 'miniProgram',
            projectPath: getPath(projectPath),
            privateKeyPath: getPath(keyPath),
            ignores: ['node_modules/**/*'],
        });
        await ci.upload({
            robot,
            version,
            desc,
            project,
            onProgressUpdate: shell.echo,
            setting: {
                es6: true, // es6转es5
                es7: true, // 增强编译
                minifyJS: true, // 上传压缩JS代码
                minifyWXML: true, // 上传压缩wxml代码
                minifyWXSS: true, // 上传压缩wxss代码
                minify: true, // 上传时压缩所有代码，对应于微信开发者工具的 "上传时压缩代码"
                codeProtect: false, // 对应于微信开发者工具的 "上传时进行代码保护"
                autoPrefixWXSS: false, // 对应于微信开发者工具的 "上传时样式自动补全"
            },
        });
        shell.echo(chalk.green.bold('上传成功'));
    } catch (e) {
        shell.echo(chalk.red('上传失败!'));
        shell.echo(chalk.red(e));
        shell.exit(1);
    }
}

const create = function ({ env, branch, config }) {
    // if (['prod', 'demo'].includes(env) && branch !== 'master') {
    //     shell.echo(chalk.red('demo和生产环境发布只能在master分支发布!'));
    //     shell.echo(chalk.red(`当前分支: ${branch}`));
    //     shell.exit(1);
    // }
    shell.exec(`git --version`);
    const tagsList = getTagsList(getPrefix(env));
    if (tagsList && tagsList[0] && tagsList[0].version) {
        const { version, desc } = tagsList[0];
        shell.echo(`当前版本：${version}`);
        shell.echo(`版本备注：${desc}`);

        if (config.build) {
            runBuild(env, version);
        }
        const robot = generateRobot(tagsList.length, env, config.maxVersionNum);

        upload({ version, desc, robot, config });
    } else {
        shell.echo(chalk.red('拉取最新tag失败！！！'));
    }
}

module.exports = {
    create,
};
