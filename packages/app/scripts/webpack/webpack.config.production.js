const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (config) => {
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }));


  config.optimization = {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        parallel: 4,
        uglifyOptions: {
          beautify: false,
          sourceMap: true,
          mangle: true,
          keep_fnames: false,
          keep_classnames: true,
          output: {
            comments: false,
          },
          compress: {
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true,
            drop_debugger: true,
            warnings: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin()
    ],
  };

  config.plugins.push(new MiniCssExtractPlugin({
    filename: '[name]-[chunkhash].css',
    chunkFilename: '[id]-[chunkhash].css',
  }));

  config.mode = 'production';

  return config;
};
