import Types from '@braum/types';
import { Op } from 'sequelize';
import * as assert from 'assert';
import * as _ from 'lodash';
import Context from '../libs/Context';
import Service from './index';

declare type CreateAnnotations = Types.Annotation.CreateAnnotation | Types.Annotation.CreateAnnotations;

export const serialize = async (ctx: Context, list: CreateAnnotations): Promise<Types.Annotation.CreateAnnotations> => {
  list = <Types.Annotation.CreateAnnotations>(Array.isArray(list) ? list : [list]);

  const actionIds: string[] = [];
  list.forEach((item) => {
    const {actionId, spanId, traceId} = item;

    assert(actionId, 'actionId cannot be undefined');

    if (!spanId || !traceId) {
      actionIds.push(actionId);
    }
  });

  // query actions by spanId or actionId
  const {list: actions} = actionIds.length ? await Service.Action.queryList(ctx, {id: _.uniq(actionIds)}) : {list: []};

  const actionsById = _.groupBy(actions, 'id');

  return list.map((item) => {
    const {actionId, spanId, traceId} = item;
    const data: Types.Annotation.CreateAnnotation = {
      ...item,
      utcCreate: _.defaultTo(item.utcCreate, ctx.time)
    };

    if (!spanId || !traceId) {
      const action = actionId ? <any>_.get(actionsById, actionId) : undefined;
      assert(action, `action not found, please check actionId: ${actionId}`);

      !spanId && (data.spanId = action.spanId);
      !traceId && (data.traceId = action.traceId);
    }

    return data;
  });
};

export const genQuery = (query: Types.Annotation.QueryAnnotation): any => {
  const {actionId, spanId, traceId, key, keyword, utcCreate} = query;

  const where: any = {};

  actionId && actionId.length && (where.actionId = actionId);
  spanId && spanId.length && (where.spanId = spanId);
  traceId && traceId.length && (where.traceId = traceId);
  key && key.length && (where.key = key);
  keyword && keyword.length && (where.keyword = {[Op.like]: keyword});
  utcCreate && utcCreate.length && (where.utcCreate = {[Op.between]: utcCreate.map((t: any) => new Date(t))});

  return where;
};

export const bulkCreate = async (ctx: Context, list: CreateAnnotations): Promise<Types.Annotations> => {
  list = await serialize(ctx, list);

  return ctx.db.Annotation.bulkCreate(list);
};

export const queryList = async (ctx: Context, query: Types.Annotation.QueryAnnotation) => {
  const where = genQuery(query);

  return ctx.db.Annotation.findAll({where: where});
};

export const queryKeys = async (ctx: Context, query: Types.Annotation.QueryAnnotationKeys) => {
  const where = genQuery(query);

  return ctx.db.Annotation.findAll({
    where: where,
    attributes: ['key'],
    group: ['key']
  });
};

export const countQuery = async (ctx: Context, query: Types.Annotation.QueryAnnotation) => {
  const where = genQuery(query);

  return ctx.db.Annotation.count({
    where: where
  });
};
