import Types from '@braum/types';
import { FindOptions, Op } from 'sequelize';
import * as assert from 'assert';
import * as _ from 'lodash';
import Context from '../libs/Context';
import Service from './index';

declare type CreateActions = Types.Action.CreateAction | Types.Action.CreateActions;

export const serialize = async (ctx: Context, list: CreateActions): Promise<Types.Action.CreateActions> => {
  list = <Types.Action.CreateActions>(Array.isArray(list) ? list : [list]);

  const spanIds: string[] = [];

  list.forEach((item) => {
    const {spanId, traceId, serviceId} = item;
    assert(spanId, 'spanId cannot be undefined');

    if (!traceId || !serviceId) {
      spanIds.push(spanId);
    }
  });

  const {list: spans} = spanIds.length ? await Service.Span.queryList(ctx, {id: _.uniq(spanIds)}) : {list: []};

  const spansById = _.groupBy(spans, 'id');

  const dataList: Types.Action.CreateActions = [];

  for (const item of list) {
    const data: Types.Action.CreateAction = {
      id: (await ctx.id()).toString('hex'),
      ...item,
      utcCreate: _.defaultTo(item.utcCreate, ctx.time),
    };
    const {traceId, spanId, serviceId} = item;

    if (!traceId || !serviceId) {
      const span = spanId ? <any>_.get(spansById, spanId) : undefined;
      assert(span, `span not found, please check spanId: ${spanId}`);

      !traceId && (data.traceId = span.traceId);
      !serviceId && (data.serviceId = span.serviceId);
    }
    dataList.push(data);
  }
  return dataList;
};

export const bulkCreate = async (ctx: Context, list: CreateActions): Promise<Types.Actions> => {
  list = await serialize(ctx, list);
  const {Action} = ctx.db;

  const actions = (await Action.bulkCreate(list)).map(a => a.toJSON());

  const bulkErrors: Types.Error.CreateErrors = [];
  const bulkAnnotations: Types.Annotation.CreateAnnotations = [];

  const listById: { [key: string]: Types.Actions } = <any>_.groupBy(list, 'id');

  // bulk create annotations and errors
  actions.forEach((action: Types.Action) => {
    const {id, spanId, traceId, utcCreate} = action;
    const {errors: error, annotations: annotation} = <any>listById[id][0];
    if (error) {
      const errors = Array.isArray(error) ? error : [error];
      bulkErrors.push(...errors.map((error) => {
        return <Types.Error.CreateError>{
          ...error,
          actionId: id,
          spanId,
          traceId,
          utcCreate: _.defaultTo(error.utcCreate, utcCreate),
        };
      }));
    }
    if (annotation) {
      const annotations = Array.isArray(annotation) ? annotation : [annotation];
      bulkAnnotations.push(...annotations.map((annotation) => {
        return <Types.Annotation.CreateAnnotation>{
          ...annotation,
          actionId: id,
          spanId: spanId,
          traceId,
          utcCreate: _.defaultTo(error.utcCreate, utcCreate),
        };
      }));
    }
  });

  if (!bulkErrors.length && !bulkAnnotations.length) {
    return actions;
  }

  const errors = bulkErrors.length ? await Service.Error.bulkCreate(ctx, bulkErrors) : [];
  const annotations = bulkAnnotations.length ? await Service.Annotation.bulkCreate(ctx, bulkAnnotations) : [];

  const actionsById = <any>_.groupBy(actions, 'id');

  errors.forEach((error) => {
    const action = <Types.Action>actionsById[error.actionId];
    action.errors = action.errors || [];
    action.errors.push(error);
  });
  annotations.forEach((annotation) => {
    const action = <Types.Action>actionsById[annotation.actionId];
    action.annotations = action.annotations || [];
    action.annotations.push(annotation);
  });
  return Object.values(actionsById).map(a => a[0]);
};

const genQuery = (query: Types.Action.QueryAction): any => {
  const {id} = query;

  const where: any = {};

  if (id && id.length) {
    where.id = id;
    return where;
  }
  const {spanId, traceId, serviceId, type, utcCreate} = query;

  spanId && spanId.length && (where.spanId = spanId);
  traceId && traceId.length && (where.traceId = traceId);
  serviceId && serviceId.length && (where.serviceId = serviceId);
  type && type.length && (where.type = type);
  utcCreate && utcCreate.length && (where.utcCreate = {[Op.between]: utcCreate.map((t: any) => new Date(t))});

  return where;
};

export const queryList = async (ctx: Context, query: Types.Action.QueryAction): Promise<{ list: Types.Actions, total: Number }> => {
  const where = genQuery(query);
  const options: FindOptions<Types.Action.QueryAction> = {where};

  if (!query.id || !query.id.length) {
    const {page = 0, pageSize = 20} = query;

    options.limit = Number(page);
    options.offset = page * pageSize;
  }

  const {rows, count} = await ctx.db.Action.findAndCountAll(options);

  return {
    list: rows,
    total: count,
  };
};

export const countQuery = async (ctx: Context, query: Types.Action.QueryAction) => {
  const where = genQuery(query);
  return ctx.db.Action.count({where});
};

export const getById = async (ctx: Context, id: string) => {
  return ctx.db.Action.findById(id);
};
