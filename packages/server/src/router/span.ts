import * as KoaRouter from 'koa-router';
import middleware from '../middleware';
import controller from '../controller';

const router = new KoaRouter({
  prefix: '/api',
  strict: true,
});

// Count spans
router.get('/spans/count', middleware([]), controller('Span.countSpans'));

// Get span
router.get('/spans/:id', middleware([]), controller('Span.getSpan'));

// Create span(s)
router.post('/spans', middleware([]), controller('Span.createSpans'));

// Query spans
router.get('/spans', middleware([]), controller('Span.querySpans'));

export const span = router;
