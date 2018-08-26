import Context from '../libs/Context';
import Service from '../service';
import { parseQuery } from '../libs/utils';
import * as assert from 'assert';

export const createSpans = async (ctx: Context) => {
  ctx.body = await Service.Span.bulkCreate(ctx, ctx.body);
};

export const querySpans = async (ctx: Context) => {
  const query = parseQuery(ctx.query);
  const {list, total} = await Service.Span.queryList(ctx, query);

  ctx.body = {
    list, total,
  };
};

export const countSpans = async (ctx: Context) => {
  const query = parseQuery(ctx.query);
  ctx.body = await Service.Span.countSpans(ctx, query);
};

export const getSpan = async (ctx: Context) => {
  const {id} = ctx.params;
  assert(typeof id === 'string' && id !== '', 'id must be non-empty string');
  ctx.body = await Service.Span.getById(ctx, id);
};
