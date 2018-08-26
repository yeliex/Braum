import Types from '@braum/types';
import Context from '../libs/Context';
import Services from '../service';
import { parseQuery } from '../libs/utils';

export const createErrors = async (ctx: Context) => {
  ctx.body = await Services.Error.bulkCreate(ctx, ctx.body);
};

export const queryErrors = async (ctx: Context) => {
  const query: Types.Error.QueryError = parseQuery(ctx.query);

  ctx.body = {list: await Services.Error.queryErrors(ctx, query)};
};

export const countErrors = async (ctx: Context) => {
  const query: Types.Error.QueryError = parseQuery(ctx.query);

  ctx.body = {total: await Services.Error.countErrors(ctx, query)};
};
