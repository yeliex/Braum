import * as _ from 'lodash';
import Types from '@braum/types';
import { Op } from 'sequelize';
import * as assert from 'assert';
import Context from '../libs/Context';
import Service from './index';

declare type CreateErrors = Types.Error.CreateError | Types.Error.CreateErrors;

export const serializeErrors = async (ctx: Context, list: CreateErrors): Promise<Types.Error.CreateErrors> => {
  list = <Types.Error.CreateErrors>(Array.isArray(list) ? list : [list]);

  const actionIds: string[] = [];
  const spanIds: string[] = [];

  list.forEach((item) => {
    const {actionId, spanId, traceId} = item;

    if (actionId && (!spanId || !traceId)) {
      actionIds.push(actionId);
      return;
    }
    if (spanId && !traceId) {
      spanIds.push(spanId);
    }
  });

  const {list: actions} = actionIds.length ? await Service.Action.queryList(ctx, {id: _.uniq(actionIds)}) : {list: []};
  const {list: spans} = spanIds.length ? await Service.Span.queryList(ctx, {id: _.uniq(spanIds)}) : {list: []};

  const actionsById: { [key: string]: Types.Action } = <any>_.groupBy(actions, 'id');
  const spansById: { [key: string]: Types.Span } = <any>_.groupBy(spans, 'id');

  const dataList: Types.Error.CreateErrors = [];

  for (const item of list) {
    const {actionId, spanId, traceId} = item;
    const data: Types.Error.CreateError = {
      id: (await ctx.id()).toString('hex'),
      ...item,
      utcCreate: _.defaultTo(item.utcCreate, ctx.time),
    };

    if (actionId && (!spanId || !traceId)) {
      const action = actionsById[actionId];

      assert(action, `action not found, please check actionId: ${actionId}`);

      data.spanId = action.spanId;
      data.traceId = action.traceId;

      dataList.push(data);
      continue;
    }

    if (spanId && !traceId) {
      const span = spansById[spanId] || {};
      assert(span, `span is not found, please check spanId: ${spanId}`);

      data.traceId = span.traceId;
    }

    dataList.push(data);
  }

  return dataList;
};

export const genQuery = (query: Types.Error.QueryError): any => {
  const {actionId, spanId, name, keyword, utcCreate} = query;

  const where: any = {};

  actionId && actionId.length && (where.actionId = actionId);
  spanId && spanId.length && (where.spanId = spanId);
  name && name.length && (where.name = name);
  keyword && keyword.length && (where.keyword = {[Op.like]: keyword});
  utcCreate && utcCreate.length && (where.utcCreate = {[Op.between]: utcCreate.map((t: any) => new Date(t))});

  return where;
};

// todo: 需要支持span异常
export const bulkCreate = async (ctx: Context, errors: CreateErrors): Promise<Types.Errors> => {
  errors = await serializeErrors(ctx, errors);
  return ctx.db.Error.bulkCreate(errors);
};

export const queryErrors = async (ctx: Context, query: Types.Error.QueryError) => {
  const where = genQuery(query);

  return await ctx.db.Error.findAll({where});
};

export const countErrors = async (ctx: Context, query: Types.Error.QueryError) => {
  const where = genQuery(query);

  return ctx.db.Error.count({where});
};
