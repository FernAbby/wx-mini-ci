const ci = require('miniprogram-ci');
const shell = require('shelljs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { runBuild } = require('./build');
const { getPath } = require('./util');
const { DEFAULT_ENVIRONMENTS } = require('./contant');

const questions = [{
    type: 'list',
    name: 'env',
    prefix: '=>',
    message: '服务端环境:',
    choices: DEFAULT_ENVIRONMENTS,
    default: DEFAULT_ENVIRONMENTS[0]
},{
    type: 'input',
    name: 'path',
    prefix: '=>',
    message: '预览路径:',
    default: 'pages/index/index'
}, {
    type: 'input',
    name: 'query',
    prefix: '=>',
    message: '预览参数:',
    // default: '' // searchQuery: 'a=1&b=2'
}];

const prompts = function () {
    return inquirer.prompt(questions);
};

const preview = async function({ pagePath, params, desc, config }) {
    const { appid, projectPath, keyPath, qrcodeOutput } = config;
    shell.echo('开始生成预览...');
    try {
        const project = new ci.Project({
            appid,
            type: 'miniProgram',
            projectPath: getPath(projectPath),
            privateKeyPath: getPath(keyPath),
            ignores: ['node_modules/**/*'],
        });
        await ci.preview({
            project,
            desc,
            qrcodeFormat: 'image',
            qrcodeOutputDest: `${getPath(qrcodeOutput)}/qrcode.jpg`,
            pagePath: pagePath, // 预览页面
            searchQuery: params,  // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
            setting: {
                es6: true,
                es7: true,
                minifyJS: true,
                minifyWXML: true,
                minifyWXSS: true,
                minify: true,
            },
        });
        shell.echo(chalk.green.bold('生成预览成功!'));
    } catch (e) {
        shell.echo(chalk.red('生成预览失败!'));
        shell.echo(chalk.red(e));
        shell.exit(1);
    }
}

const create = async function({ config }) {
    const { env, path, query, desc } = await prompts();
    if (config.build) {
        runBuild(env);
    }
    preview({ pagePath: path, params: query, desc, config });
}

module.exports = {
    create,
};
