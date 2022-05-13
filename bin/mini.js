#!/usr/bin/env node
const { program } = require('commander');
const shell = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const tag = require('../utils/tag');
const preview = require('../utils/preview');
const upload = require('../utils/upload');

const { APP_ENV, GIT_BRANCH } = process.env;

// 获取配置文件
const exportConfig = function() {
    const configPath = path.resolve(__dirname, '../ci_config.js');
    if (shell.find(configPath).code !== 0) {
       shell.echo(chalk.red('请添加配置文件ci_config.js到根目录'));
       shell.exit(1);
    }
    return require(configPath);
}

const run = function() {
    const config = exportConfig();
    program.version(require('../package').version,'-v, --version', 'display current version');

    // 创建tag
    program.command('tag [env]')
        .description('generate a tag based on the currently committed version')
        .action((env) => {
            console.log('执行===> tag', env);
            tag.create({
                clearCache: true,
                config,
            });
        });

    // 生成二维码预览
    program.command('preview [env]')
        .description('generate qrcode to preview current program')
        .action(() => {
            console.log('执行===> preview');
            preview.create({
                build,
            });
        });

    // 代码上传到云端
    program.command('upload [env]').description('CI upload')
        .action((env) => {
            console.log('执行===> upload');
            upload.create({
                env: APP_ENV || env || 'test',
                branch: GIT_BRANCH,
                build,
            });
        });

    program.parse(process.argv);
}

shell.echo(chalk.green(`APP_ENV: ${APP_ENV}`));

run();
