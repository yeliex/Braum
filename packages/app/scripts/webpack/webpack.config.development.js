const minimist = require('minimist');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const args = Object.assign({}, minimist(process.argv), minimist(JSON.parse(process.env.npm_config_argv).original));

const port = args.port || 3000;

module.exports = (config) => {
  config.devtool = '#cheap-module-source-map';

  const { entry } = config;

  config.entry = Object.keys(config.entry).reduce((total, key) => {
    const file = entry[key];
    total[key] = [
      require.resolve('../libs/stylehot.js'),
      ...(Array.isArray(file) ? file : [file]),
    ];

    return total;
  }, {});

  config.devServer = {
    compress: false,
    host: '0.0.0.0',
    port,
    hot: true,
    disableHostCheck: true,
    publicPath: '/',
    overlay: {
      warnings: false,
      errors: true,
    },
    watchContentBase: false,
    historyApiFallback: {
      index: '/index.html',
    },
  };

  config.output.filename = '[name].js';

  config.output.chunkFilename = '[id]-[name].js';

  config.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }));

  config.plugins.push(new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css',
  }));

  config.mode = 'development';

  return config;
};
