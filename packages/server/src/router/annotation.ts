import * as KoaRouter from 'koa-router';
import middleware from '../middleware';
import controller from '../controller';

const router = new KoaRouter({
  prefix: '/api',
  strict: true
});

// Creation annotation(s)
router.post('/annotations', middleware([]), controller('Annotation.createAnnotations'));

// Query annotations
router.get('/annotations', middleware([]), controller('Annotation.queryAnnotations'));

// Count annotations
router.get('/annotations/count', middleware([]), controller('Annotation.countAnnotations'));

// Get annotations Keys
router.get('/annotations/count', middleware([]), controller('Annotation.getKeys'));

export const annotation = router;
