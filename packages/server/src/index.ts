import { ready as dbReady } from './libs/db';

dbReady().then(() => {
  require('./server');
});
