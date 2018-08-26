import * as Sequelize from 'sequelize';
import * as Debug from 'debug';
import * as _ from 'lodash';
import config from '../config';
import modelDefine from './models';
import { DataTypeAbstract, DefineAttributeColumnOptions, DefineAttributes, DefineOptions, Model } from 'sequelize';

const debug = Debug('braum:sequelize');

interface DB {
  models: Sequelize.ModelsHashInterface,
  db: Sequelize.Sequelize,
  Sequelize: typeof Sequelize
}

let sequelize: DB = <DB>{
  Sequelize,
};

const init = async () => {
  if (sequelize.models) {
    return sequelize;
  }

  const db = new Sequelize({
    dialect: 'mysql',
    host: config.storage.mysql.host,
    port: config.storage.mysql.port,
    database: config.storage.mysql.db,
    username: config.storage.mysql.user,
    password: config.storage.mysql.password,
    typeValidation: true,
    logging: false,
    benchmark: false,
    operatorsAliases: false,
    define: {
      paranoid: false,
      underscored: true,
      underscoredAll: true,
      timestamps: false,
      updatedAt: false,
      deletedAt: 'utc_delete',
      createdAt: 'utc_create',
    },
  });

  const define = db.define;

  Object.defineProperty(db, 'define', {
    get: function () {
      return (function MidifiedDefine<TInstance, TAttributes>(modelName: string, attributes: DefineAttributes, options?: DefineOptions<TInstance>): Model<TInstance, TAttributes> {
        const attrs = Object.keys(attributes).reduce((total, key) => {
          const field = (typeof attributes[key] === 'string' ? {
            type: attributes[key],
          } : <DataTypeAbstract | DefineAttributeColumnOptions>attributes[key]);

          total[_.camelCase(key)] = {
            field: _.snakeCase(key),
            ...field,
          };
          return total;
        }, {});

        return define.call(db, modelName, attrs, options);
      }).bind(db);
    },
  });

  modelDefine(db);

  sequelize.db = db;

  try {
    await db.authenticate();

    debug('db connect success');
  } catch (e) {
    debug(e);
    throw e;
  }

  const models = db.models;

  sequelize.models = models;

  return sequelize;
};

export const ready = async () => {
  await init();
};

export default (() => {
  // @ts-ignore
  return sequelize;
})();
