import * as KoaRouter from 'koa-router';
import middleware from '../middleware';
import controller from '../controller';

const router = new KoaRouter({
  prefix: '',
  strict: true
});

// Creation error(s)
router.get('/_config', middleware([]), controller('System.getConfig'));

// Query errors
router.get('/_mock/exception', middleware([]), controller('System.mockException'));

export const system = router;
