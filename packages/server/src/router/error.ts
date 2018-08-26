import * as KoaRouter from 'koa-router';
import middleware from '../middleware';
import controller from '../controller';

const router = new KoaRouter({
  prefix: '/api',
  strict: true
});

// Creation error(s)
router.post('/errors', middleware([]), controller('Error.createErrors'));

// Query errors
router.get('/errors', middleware([]), controller('Error.queryErrors'));

// Count errors
router.get('/errors/count', middleware([]), controller('Error.countErrors'));

export const error = router;
