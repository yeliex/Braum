import Types from '@braum/types';
import * as _ from 'lodash';
import * as assert from 'assert';
import Context from '../libs/Context';
import Service from '../service';
import { FindOptions, Op } from 'sequelize';

declare type CreateSpans = Types.Span.CreateSpan | Types.Span.CreateSpans;

export const serialize = async (ctx: Context, list: CreateSpans) => {
  list = <Types.Span.CreateSpans>(Array.isArray(list) ? list : [list]);

  const dataList: Types.Span.CreateSpans = [];

  const parentIds: string[] = [];

  list.forEach((item) => {
    const {traceId, parentId} = item;
    if (!traceId && parentId) {
      parentIds.push(parentId);
    }
  });

  const {list: parents} = parentIds.length ? await queryList(ctx, {id: _.uniq(parentIds)}) : {list: []};

  const parentsById: { [key: string]: Types.Span } = <any>_.groupBy(parents, 'id');

  for (const item of list) {
    const {parentId, traceId, utcCreate} = item;
    const data = {
      ...item,
      id: item.id || (await ctx.id()).toString('hex'),
      utcCreate: _.defaultTo(utcCreate, ctx.time),
    };

    if (!traceId) {
      if (parentId) {
        const parent = parentsById[parentId];
        assert(parent, `parent not found, please check parentId: ${parentId}`);

        data.traceId = parent.traceId;
      } else {
        data.traceId = data.id;
      }
    }

    dataList.push(data);
  }

  return dataList;
};

export const bulkCreate = async (ctx: Context, list: CreateSpans) => {
  list = await serialize(ctx, list);

  const {Span} = ctx.db;

  const spans = (await Span.bulkCreate(list)).map(s => s.toJSON());

  const bulkActions: Types.Action.CreateActions = [];

  const listById: { [key: string]: Types.Span.CreateSpan } = <any>_.groupBy(list, 'id');

  spans.forEach((span) => {
    const {traceId, id} = span;

    const {actions: action} = listById[span.id][0];

    if (action) {
      const actions = Array.isArray(action) ? action : [action];
      bulkActions.push(...actions.map((action) => {
        return {
          ...action,
          spanId: id,
          traceId,
        };
      }));
    }
  });

  const actions = await Service.Action.bulkCreate(ctx, bulkActions);
  const spansById: { [key: string]: Types.Span } = <any>_.groupBy(spans, 'id');

  actions.forEach((action) => {
    const span = spansById[action.spanId];
    span.actions = span.actions || [];
    span.actions.push(action);
  });

  return Object.values(spansById).map(spans => spans[0]);
};

export const genQuery = (query: Types.Span.QuerySpan): any => {
  const {id} = query;
  const where: any = {};

  if (id && id.length) {
    where.id = id;
    return where;
  }

  const {traceId, parentId, duration, utcCreate} = query;

  traceId && traceId.length && (where.traceId = traceId);
  parentId && parentId.length && (where.parentId = parentId);
  duration && duration.length && (where.duration = {[Op.between]: duration.map((t: any) => new Date(t))});
  utcCreate && utcCreate.length && (where.utcCreate = {[Op.between]: utcCreate.map((t: any) => new Date(t))});

  return where;
};

export const queryList = async (ctx: Context, query: Types.Span.QuerySpan): Promise<{ list: Types.Spans, total: Number }> => {
  const where = genQuery(query);
  const options: FindOptions<Types.Span.QuerySpan> = {where};

  if (!query.id || !query.id.length) {
    const {page = 0, pageSize = 20} = query;

    options.limit = Number(pageSize);
    options.offset = page * pageSize;
  }

  const {rows, count} = await ctx.db.Span.findAndCountAll(options);

  return {
    list: rows,
    total: count,
  };
};

export const countSpans = async (ctx: Context, query: Types.Span.QuerySpan) => {
  const where = genQuery(query);
  return ctx.db.Span.count({where});
};

export const getById = async (ctx: Context, id: string) => {
  return ctx.db.Span.findById(id);
};
