module.exports = {
    appid: 'wxe848c704ff29506e',
    projectPath: './dist/dev/mp-weixin',
    keyPath: './shell/private.upload.key', // 上传授权KEY
    qrcodeOutput: './dist',
    maxVersionNum: 5, // test|demo|prod每个环境至多留存10个版本
    build: false, // 是否需要编译 需要编译的话写上编译的话，目前默认为uni-app编译命令
};
