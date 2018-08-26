import * as compose from 'koa-compose';

export default function genMiddlewares(middlewares: any[]) {
  return compose(middlewares);
}
