const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');

const readEnvFile = function() {
    const results = {};
    try {
        fs.readFileSync(path.resolve(__dirname, '../../.env'), 'utf-8')
            .split('\n')
            .filter(item => item)
            .forEach(item => {
                const [key, value] = item.split('=');
                results[key.trim()] = value.trim();
            });
        return results;
    } catch (error) {
        shell.echo(chalk.red(error));
        shell.exit(1);
    }
}

const writeEnvFile = function(params) {
    try {
        fs.writeFileSync(path.resolve(__dirname, '../../_config.js'), `module.exports = ${JSON.stringify(params)};`, 'utf-8');
        shell.echo(chalk.green(`设置环境变量: ${params.SEVER_ENV}`));
    } catch (error) {
        shell.echo(chalk.red(error));
        shell.exit(1);
    }
}

const create = function({ env }) {
    const results = readEnvFile();
    results.SEVER_ENV = env;
    writeEnvFile(results);
}

module.exports = {
    create,
};
