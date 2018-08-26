const minimist = require('minimist');

const args = Object.assign({}, minimist(process.argv), minimist(JSON.parse(process.env.npm_config_argv).original));

let env = process.env.NODE_ENV;

if (args.prod || args.production) {
  env = 'production';
}

process.env.NODE_ENV = env || 'development';

const CommonConfig = require('./webpack.config')({});
const EnvConfig = env === 'production' ? require('./webpack.config.production') : require('./webpack.config.development');

module.exports = EnvConfig(CommonConfig);
