const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
const shell = require("shelljs");
shell.cp(process.cwd() + "/config/" + process.env.NULS_ENV + ".js",process.cwd() + "/src/config.js");
const isProduction = process.env.NODE_ENV === 'production';
console.log("use config file : " + process.cwd() + "/config/" + process.env.NULS_ENV + ".js");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
module.exports = {

  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    },
  },

  configureWebpack: config => {
    if (isProduction) {
      config.plugins.push(new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
      }));

    }
    config.externals = {
      'vue': 'Vue',
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'moment': 'moment',
      'element-ui': 'ELEMENT',
    }
    // config.plugins.push(new BundleAnalyzerPlugin())
  },

  devServer: {
    port: 8075,
    host: '0.0.0.0',
    https: false,
    open: true,
    proxy: {
      "/bridge-api": {
        // target: "http://192.168.1.204:8085",
        target: "http://beta.bridge.nerve.network",
        // target: "https://bridge.nerve.network",
        changeOrigin: true,  // 是否跨域
      },
      "/nabox-api": {
        // target: "http://192.168.1.204:8083",
        target: "http://beta.bridge.nerve.network",
        // target: "https://bridge.nerve.network",
        changeOrigin: true,  // 是否跨域
      },
    }
  }
};
