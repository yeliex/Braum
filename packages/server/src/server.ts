import Config from './libs/config';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBody from 'koa-body';
import * as Debug from 'debug';
import * as createHttpError from 'http-errors';
import * as routers from './router';
import trace from './libs/trace';

const debug = Debug('braum:app');
const debugException = Debug('braum:exception');
const debugRequest = Debug('braum:request');

const app = new Koa();

app.proxy = true;

const errorHandler = (error: any, ctx: Koa.Context) => {
  debugException(ctx.method, ctx.originalUrl, error);
  const err = createHttpError(error.status || error.code || 500, error.message || error.error || error);
  ctx.body = {
    code: err.status,
    message: err.message,
  };
  ctx.status = err.status;
};

const errorMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.action.createError(<any>{
      error,
    });
    errorHandler(error, ctx);
  }
};

if (Config.trace.selfTracingEnabled) {
  app.use(trace.middleware({
    errorHandler,
  }));
} else {
  app.use(errorMiddleware);
}

app.on('error', errorHandler);

app.use(KoaBody());

app.use(async function RequestMiddleware(ctx, next) {
  debugRequest(ctx.method, ctx.originalUrl, ctx.request.query, ctx.request.body);
  await next();
});

Object.keys(routers).forEach((routerName) => {
  app.use((<KoaRouter>(<any>routers)[routerName]).middleware());
});

const router = new KoaRouter();

router.get('/api/health', async (ctx) => {
  ctx.throw(200, 'success');
});

router.all('*', async (ctx) => {
  ctx.throw(404);
});

app.use(router.routes()).use(router.allowedMethods({throw: true}));


app.listen(Config.server.listenPort, () => {
  debug('start listen at', Config.server.listenPort);
});
