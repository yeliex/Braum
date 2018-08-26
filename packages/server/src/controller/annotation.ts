import Context from '../libs/Context';
import Services from '../service';
import { parseQuery } from '../libs/utils';

export const createAnnotations = async (ctx: Context) => {
  ctx.body = await Services.Annotation.bulkCreate(ctx, ctx.body);
};

export const queryAnnotations = async (ctx: Context) => {
  const query = parseQuery(ctx.query);
  ctx.body = {
    list: await Services.Annotation.queryList(ctx, query)
  };
};

export const countAnnotations = async (ctx: Context) => {
  const query = parseQuery(ctx.query);

  ctx.body = {
    total: await Services.Annotation.countQuery(ctx, query)
  };
};

export const getKeys = async (ctx: Context) => {
  const query = parseQuery(ctx.query);
  ctx.body = {
    list: await Services.Annotation.queryKeys(ctx, query)
  };
};
