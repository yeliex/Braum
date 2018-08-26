import Braum from 'braum';
import snowflake from './snowflake';
import config from './config';

const braum = new Braum({
  service: 'braum',
  snowflake,
  endpoint: `http://127.0.0.1:${config.server.listenPort}`,
});

export const ready = braum.ready;

export default braum;
