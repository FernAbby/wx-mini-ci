const { ENVIRONMENTS, ENV2PREFIX } = require('./contant');

// 获取环境变量前缀
const getPrefix = function(name) {
    return ENV2PREFIX[name] ? ENV2PREFIX[name] : name.charAt(0).toLowerCase();
}

// 获取版本号数字
const getVersionNumber = function(version) {
    return version ? version.replace(/^[a-zA-Z]/i, '') : '0.0.0';
}

module.exports = {
    getPrefix,
    getVersionNumber,
};
