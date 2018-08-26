import * as assert from 'assert';
import Context from '../libs/Context';
import Services from '../service';
import { parseQuery } from '../libs/utils';

export const createActions = async (ctx: Context) => {
  ctx.body = await Services.Action.bulkCreate(ctx, ctx.body);
};

export const queryActions = async (ctx: Context) => {
  const query = parseQuery(ctx.query);
  const {list, total} = await Services.Action.queryList(ctx, query);

  ctx.body = {
    list,
    total
  };
};

export const countActions = async (ctx: Context) => {
  const query = parseQuery(ctx.query);
  ctx.body = {
    total: await Services.Action.countQuery(ctx, query)
  };
};

export const getById = async (ctx: Context) => {
  const {id} = ctx.params;
  assert(typeof id === 'string' && id !== '', 'id must be non-empty string');
  ctx.body = await Services.Action.getById(ctx, ctx.params.id);
};
