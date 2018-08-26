module.exports = {
  cacheDirectory: require('os').tmpdir(),
  presets: [
    require.resolve('babel-preset-react'),
    require.resolve('babel-preset-stage-0'),
    require.resolve('babel-preset-env'),
  ],
  plugins: [
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-add-module-exports'),
    require.resolve('babel-plugin-transform-decorators-legacy'),
    require.resolve('babel-plugin-syntax-dynamic-import'),
    [
      require.resolve('babel-plugin-import'),
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ],
    [
      require.resolve('babel-plugin-import'),
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
    ],
  ],
};
