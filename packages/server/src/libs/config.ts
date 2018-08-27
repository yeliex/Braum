import { resolve } from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import { safeLoad } from 'js-yaml';
import * as _ from 'lodash';
import * as Debug from 'debug';
import DefaultConfig from './config.default';

const debug = Debug('braum:config');

export namespace Props {
  export interface Configs {
    server: {
      listenPort: number;
      queryAllowOrigins: string[];
      reportAllowOrigins: string[];
    },
    storage: {
      type: string;
      mysql: {
        host: string,
        port: number,
        db: string,
        user: string,
        password: string
      }
    },
    trace: {
      selfTracingEnabled: boolean
    }
    plugin: {
      [type: string]: (string | {
        package: string;
        [key: string]: any
      })[]
    }

    [key: string]: any;
  }

  export interface InputConfig {
    [key: string]: any
  }
}

const custromConfig = process.env.NODE_ENV === 'production' ? resolve('/braum/config/config.yml') : resolve(__dirname, '../../config/config.yml');

class Config {
  static load() {
    debug('start load');

    const config = new Config(_.defaultsDeep(Config.loadFile(custromConfig), DefaultConfig));

    return config;
  }

  private static loadFile(path: string) {
    try {
      const fileExist = fs.statSync(path);
      if (!fileExist) {
        return {};
      }

      assert(fileExist.isFile(), `config file is not a valid file: ${path}`);

      const str = fs.readFileSync(path, 'utf8');

      const config = safeLoad(str);

      if (!config) {
        return {};
      }

      assert(typeof config === 'object', 'config set must be object');

      return config;
    } catch (e) {
      if (e.code === 'ENOENT') {
        return {};
      }

      throw e;
    }
  }

  static check(obj: Props.InputConfig): Props.Configs {
    const config = <Props.Configs>_.cloneDeep(obj);

    ['server.listenPort', 'storage.mysql.port'].forEach((key) => {
      const value = Number(_.get(config, key));

      assert(value && !Number.isNaN(value), `${key} must be number, but got ${typeof _.get(obj, key)}`);
      _.set(config, key, value);
    });

    ['server.queryAllowOrigins', 'server.reportAllowOrigins'].forEach((key) => {
      const v = _.get(config, key);
      const value = !v.length || v === '*' ? [] : (Array.isArray(v) ? v : [v]);

      _.set(config, key, value);
    });

    if (config.storage.type) {
      assert(['mysql'].includes(config.storage.type), `storage.type only support mysql, but got ${config.storage.type}`);
    }

    ['storage.mysql.host', 'storage.mysql.db', 'storage.mysql.user', 'storage.mysql.password'].forEach((key) => {
      const value = _.get(config, key);
      assert(typeof value === 'string' && value !== '', `${key} must be non-empty string, but got ${typeof _.get(obj, key)}`);
    });

    if (config.trace.selfTracingEnabled !== undefined) {
      config.trace.selfTracingEnabled = ['true', true].includes(config.trace.selfTracingEnabled);
    }

    assert(typeof config.plugin === 'object', `plugin must be object, but got ${typeof config.plugin}`);

    return config;
  }

  protected readonly config: Props.Configs;

  constructor(config: Props.InputConfig) {
    this.config = this.getter(Config.check(config));
  }

  private getter<T>(obj: T): T {
    const config = {};

    Object.defineProperties(config, Object.keys(obj).reduce((total: any, key) => {
      const value = (<any>obj)[key];

      total[key] = <PropertyDescriptor>{
        enumerable: true,
        get: () => {
          return (typeof value === 'object' && !Array.isArray(value)) ? this.getter(value) : value;
        },
      };
      return total;
    }, {}));

    return <T>config;
  }

  get server() {
    return this.config.server;
  }

  get storage() {
    return this.config.storage;
  }

  get trace() {
    return this.config.trace;
  }

  get plugin() {
    return this.config.plugin;
  }
}

const config = Config.load();

export default config;
