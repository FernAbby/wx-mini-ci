const shell = require('shelljs');
const chalk = require('chalk');

const runBuild = function (env, config) {
    if (!(env && config.envList.includes(env))) {
        shell.echo(chalk.red(`error: 未匹配到构建环境: ${env}`));
        shell.exit(1);
    }
    const command = `yarn build:mp-weixin --mode ${env}`;
    shell.echo('-------------------------------------- start of build...');
    shell.echo('开始构建...');
    shell.echo(`
        环境: ${chalk.green(env)}
        命令: ${command}    
    `);
    const { code } = shell.exec(command);

    if (code !== 0) {
        shell.echo(chalk.red('构建失败!'));
        shell.exit(1);
    } else {
        shell.echo(chalk.green.bold('构建成功!'));
        shell.echo('-------------------------------------- end of build...');
    }
}

module.exports = {
    runBuild,
};
