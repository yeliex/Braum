const { resolve } = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rucksack = require('rucksack-css');
const TsImportPlugin = require('ts-import-plugin');
const autoprefixer = require('autoprefixer');
const entries = require('./webpack.entries');
const babelOptions = require('./babel.config');

const PostcssOptions = {
  sourceMap: true,
  plugins: [
    rucksack(),
    autoprefixer(),
  ],
};

module.exports = (config = {}) => {
  config.entry = Object.keys(entries).reduce((total, key) => {
    total[key] = Array.isArray(entries[key]) ? entries[key] : [entries[key]];
    return total;
  }, {});

  config.output = {
    path: resolve(__dirname, '../../dist'),
    filename: '[name]-[chunkhash].js',
    chunkFilename: 'chunk/[chunkhash].js',
    publicPath: '/',
    crossOriginLoading: 'anonymous',
  };

  config.devtool = '#source-map';

  config.resolve = {
    modules: [
      'node_modules',
    ],
    mainFiles: ['index.web', 'index'],
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
    mainFields: ['browser', 'module', 'main'],
  };

  config.module = {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: babelOptions,
          },
          {
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: true,
              logInfoToStdOut: true,
              colors: true,
              getCustomTransformers: () => ({
                before: [
                  TsImportPlugin({
                    libraryName: 'ant-design-pro',
                    libraryDirectory: 'es',
                    camel2DashComponentName: false,
                    style: false,
                  }),
                ],
              }),
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: babelOptions,
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: true,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: PostcssOptions,
          },
        ],
      },
      {
        test: /\.less$/,
        include: /(node_modules)|(\.plain\.less$)/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[local]',
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: PostcssOptions,
          },
          {
            loader: require.resolve('less-loader'),
            options: {
              javascriptEnabled: true,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        exclude: /(node_modules)|(\.plain\.less$)/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]',
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: PostcssOptions,
          },
          {
            loader: require.resolve('less-loader'),
            options: {
              javascriptEnabled: true,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|ttf|svg|otf)(\?.*)?$/,
        use: {
          loader: require.resolve('url-loader'),
          options: { limit: 8192 },
        },
      },
      {
        test: /\.eot(\?.*)?$/,
        use: { loader: require.resolve('url-loader') },
      },
      {
        test: /\.(png|jpg|jpeg|gif)(\?.*)?$/,
        use: {
          loader: require.resolve('url-loader'),
          options: { limit: 8192 },
        },
      },
    ],
  };

  config.plugins = [
    new CaseSensitivePathsPlugin(),

    new HtmlWebpackPlugin({
      title: 'Braum',
      inject: 'body',
      filename: 'index.html',
      template: require.resolve('../../src/index.html'),
      hash: true,
      cache: true,
    }),
  ];

  config.optimization = {
    splitChunks: {
      chunks: 'async',
      name: true,
    },
  };

  config.stats = {
    assets: true,
    colors: true,
    cached: true,
    chunks: false,
    children: false,
    errors: true,
    modules: false,
    reasons: false,
    source: false,
    timings: true,
    warnings: true,
    version: true,
  };

  config.target = 'web';

  return config;
};
