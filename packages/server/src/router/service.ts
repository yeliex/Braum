import * as KoaRouter from 'koa-router';
import middleware from '../middleware';
import controller from '../controller';

const router = new KoaRouter({
  prefix: '/api',
  strict: true
});

// Get specified endpoint
router.get('/services/:id', middleware([]), controller('Service.getById'));

// Regist service endpoint
router.get('/service', middleware([]), controller('Service.createService'));
router.post('/services', middleware([]), controller('Service.postService'));

// Query services
router.get('/services', middleware([]), controller('Service.getList'));

export const service = router;
