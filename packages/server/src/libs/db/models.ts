import * as Sequelize from 'sequelize';
import Enums from '@braum/enums';
import { Transforms } from '../utils';

export default (db: Sequelize.Sequelize) => {
  db.define('Span', {
    id: {
      type: Sequelize.BIGINT(20), primaryKey: true, unique: true,
      ...Transforms.Id('id'),
    },
    traceId: {
      type: Sequelize.BIGINT(20), primaryKey: true, unique: false, allowNull: false,
      ...Transforms.Id('traceId'),
    },
    parentId: {
      type: Sequelize.BIGINT(20), unique: false, allowNull: true,
      ...Transforms.Id('parentId'),
    },
    duration: {type: 'TIMESTAMP', allowNull: true},
    utcCreate: {type: 'TIMESTAMP', allowNull: true, unique: false},
  }, {
    tableName: 'span',
    timestamps: false,
    indexes: [
      {
        fields: ['id'],
        name: 'uk_i',
        unique: true,
      },
      {
        fields: ['id', 'parentId'],
        unique: true,
        name: 'uk_i_p',
      },
      {
        fields: ['id', 'traceId', 'parentId'],
        name: 'uk_i_t_p',
        unique: true,
      },
    ],
  });

  db.define('Service', {
    id: {type: Sequelize.INTEGER(6), autoIncrement: true, primaryKey: true, unique: true},
    name: {type: Sequelize.STRING(255), unique: false, allowNull: false},
    host: {type: Sequelize.STRING(255), unique: false, allowNull: false},
    ipv4: {type: Sequelize.STRING(15), field: 'ipv4', unique: false, allowNull: true},
    ipv6: {type: Sequelize.STRING(39), field: 'ipv6', unique: false, allowNull: true},
    port: {type: Sequelize.TINYINT(6), unique: false, allowNull: true},
    status: {
      type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0,
      ...Transforms.Enum('status', Enums.ServiceStatus),
    },
    utcCreate: {type: 'TIMESTAMP', allowNull: true, unique: false},
    utcStart: {type: 'TIMESTAMP', unique: false, allowNull: false, defaultValue: Sequelize.NOW},
  }, {
    tableName: 'service',
    timestamps: false,
  });

  db.define('Action', {
    id: {
      type: Sequelize.BIGINT(20), allowNull: false, primaryKey: true, unique: true,
      ...Transforms.Id('id'),
    },
    spanId: {
      type: Sequelize.BIGINT(20), allowNull: false, unique: false,
      ...Transforms.Id('spanId'),
    },
    traceId: {
      type: Sequelize.BIGINT(20), allowNull: false, unique: false,
      ...Transforms.Id('traceId'),
    },
    serviceId: {type: Sequelize.INTEGER(6), allowNull: true, unique: false},
    type: {
      type: Sequelize.INTEGER(4), allowNull: false, unique: false,
      ...Transforms.Enum('type', Enums.ActionTypes),
    },
    utcCreate: {type: 'TIMESTAMP', allowNull: true, unique: false},
  }, {
    tableName: 'action',
    timestamps: false,
    indexes: [
      {
        fields: ['spanId'],
        name: 'idx_sid',
      },
      {
        fields: ['spanId', 'traceId'],
        name: 'idx_sid_tid',
      },
      {
        fields: ['serviceId'],
        name: 'idx_svc',
      },
      {
        fields: ['spanId', 'type'],
        name: 'idx_sid_t',
      },
      {
        fields: ['serviceId', 'type'],
        name: 'idx_svc_t',
      },
      {
        fields: ['type'],
        name: 'idx_t',
      },
      {
        fields: ['traceId'],
        name: 'idx_tid',
      },
      {
        fields: ['traceId', 'type'],
        name: 'idx_tid_t',
      },
    ],
  });

  db.define('Annotation', {
    actionId: {
      type: Sequelize.BIGINT(20), unique: false, allowNull: false,
      ...Transforms.Id('actionId'),
    },
    spanId: {
      type: Sequelize.BIGINT(20), unique: false, allowNull: false,
      ...Transforms.Id('spanId'),
    },
    traceId: {
      type: Sequelize.BIGINT(20), unique: false, allowNull: false,
      ...Transforms.Id('traceId'),
    },
    key: {type: Sequelize.STRING(255), unique: false, allowNull: false},
    value: {type: Sequelize.TEXT('long'), unique: false, allowNull: false},
  }, {
    tableName: 'annotation',
    timestamps: false,
    indexes: [
      {
        fields: ['actionId'],
        name: 'idx_a',
      },
      {
        fields: ['actionId', 'key'],
        name: 'idx_a_k',
      },
      {
        fields: ['actionId', 'spanId', 'traceId', 'key'],
        name: 'idx_a_s_t_k',
      },
      {
        fields: ['spanId', 'actionId', 'key'],
        name: 'idx_s_a_k',
      },
      {
        fields: ['spanId', 'key'],
        name: 'idx_s_k',
      },
      {
        fields: ['spanId', 'traceId'],
        name: 'idx_s_t',
      },
      {
        fields: ['traceId', 'key'],
        name: 'idx_t_k',
      },
    ],
  });

  db.models.Annotation.removeAttribute('id');

  db.define('Error', {
    id: {
      type: Sequelize.BIGINT(20), primaryKey: true, unique: false, allowNull: false,
      ...Transforms.Id('id'),
    },
    actionId: {
      type: Sequelize.BIGINT(20), unique: false, allowNull: false,
      ...Transforms.Id('actionId'),
    },
    spanId: {
      type: Sequelize.BIGINT(20), unique: false, allowNull: false,
      ...Transforms.Id('spanId'),
    },
    traceId: {
      type: Sequelize.BIGINT(20), unique: false, allowNull: false,
      ...Transforms.Id('traceId'),
    },
    name: {type: Sequelize.STRING, unique: false, allowNull: false, defaultValue: 'Error'},
    message: {type: Sequelize.TEXT, unique: false, allowNull: true},
    stack: {
      type: Sequelize.BLOB, unique: false, allowNull: true,
      ...Transforms.Bolb('stack'),
    },
    meta: {
      type: Sequelize.BLOB, unique: false, allowNull: true,
      ...Transforms.Bolb('meta'),
    },
    utcCreate: {type: 'TIMESTAMP', allowNull: true, unique: false},
  }, {
    tableName: 'error',
    timestamps: false,
  });
}
