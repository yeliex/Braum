import { get } from 'lodash';
import { Context as KoaContext } from 'koa';
import Context from '../libs/Context';
import * as Span from './span';
import * as Service from './service';
import * as Action from './action';
import * as Annotation from './annotation';
import * as Error from './error';
import * as System from './system';

export const Controllers = {
  Service,
  Span,
  Action,
  Annotation,
  Error,
  System,
};

export default function genController(path: string) {
  const controller = get(Controllers, path);

  return async (ctx: KoaContext) => {
    const context = new Context(ctx);
    if (typeof controller === 'function') {
      return controller(context);
    }
    ctx.throw(404);
  };
}
