const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  devServer: {
    hot: true,
    open: true,
    port: 3030,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '^/api*': {
        target: 'http://127.0.0.1:8888/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
        logLevel: 'debug',
      },
    },
  },
  chainWebpack: config => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("assets", resolve("src/assets"))
      .set("components", resolve("src/components"))
      .set("base", resolve("baseConfig"))
      .set("public", resolve("public"));
  },
}