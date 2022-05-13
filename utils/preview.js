const ci = require('miniprogram-ci');
const shell = require('shelljs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { runBuild } = require('./build');

const questions = [{
    type: 'list',
    name: 'env',
    message: '服务端环境:',
    prefix: '=>',
    choices: [
        'test',
        // 'demo',
        'prod',
    ],
    default: 'test'
},{
    type: 'input',
    name: 'path',
    message: '预览路径:',
    prefix: '=>',
    default: 'pages/index/index'
}, {
    type: 'input',
    name: 'query',
    message: '预览参数:',
    prefix: '=>',
    // default: '' // searchQuery: 'a=1&b=2'
}];

const prompts = function () {
    return inquirer.prompt(questions);
};

const preview = async function(pagePath, params, desc) {
    const { appid, projectPath, keyPath, qrcodeOutput } = config;
    shell.echo('开始生成预览...');
    try {
        const project = new ci.Project({
            appid,
            type: 'miniProgram',
            projectPath,
            privateKeyPath: keyPath,
            ignores: ['node_modules/**/*'],
        });
        await ci.preview({
            project,
            desc,
            qrcodeFormat: 'image',
            qrcodeOutputDest: `${qrcodeOutput}/qrcode.jpg`,
            pagePath: pagePath, // 预览页面
            searchQuery: params,  // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
            setting: {
                es6: true,
                es7: true,
            },
        });
        shell.echo(chalk.green.bold('预览成功!'));
    } catch (e) {
        shell.echo(chalk.red('预览失败!'));
        shell.echo(chalk.red(e));
        shell.exit(1);
    }
}

const create = async function({ build, config }) {
    const { env, path, query, desc } = await prompts();
    if (build) {
        runBuild(env);
    }
    preview(path, query, desc);
}

module.exports = {
    create,
};
