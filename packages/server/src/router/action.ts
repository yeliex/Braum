import * as KoaRouter from 'koa-router';
import middleware from '../middleware';
import controller from '../controller';

const router = new KoaRouter({
  prefix: '/api',
  strict: true
});

// Creation action(s)
router.post('/actions', middleware([]), controller('Action.createActions'));

// Query actions
router.get('/actions', middleware([]), controller('Action.queryActions'));

// Count actions
router.get('/actions/count', middleware([]), controller('Action.countActions'));

// Get action by id
router.get('/actions/:id', middleware([]), controller('Action.getById'));

export const action = router;
