import { Props } from './config';
import { defaultTo } from 'lodash';

export default <Props.InputConfig> {
  server: {
    listenPort: 3000,
    queryAllowOrigins: '*',
    reportAllowOrigins: '*'
  },
  storage: {
    type: 'mysql',
    mysql: {
      host: defaultTo(process.env.MYSQL_HOST, 'localhost'),
      port: defaultTo(process.env.MYSQL_POST, 3306),
      db: defaultTo(process.env.MYSQL_DB, 'braum'),
      user: defaultTo(process.env.MYSQL_USER, 'root'),
      password: defaultTo(process.env.MYSQL_PASSWORD, 'passwd')
    }
  },
  trace: {
    selfTracingEnabled: false
  },
  plugin: {}
};
