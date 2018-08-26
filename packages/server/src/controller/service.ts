import Context from '../libs/Context';
import Services from '../service';
import { parseQuery } from '../libs/utils';

/**
 * 创建服务
 * 根据设备hostname,ip创建/获取数据库中的服务, 由服务端sdk缓存
 * @param ctx
 */
export const createService = async (ctx: Context) => {
  const {query} = ctx;

  ctx.body = await Services.Service.createService(ctx, query);
};

export const postService = async (ctx: Context) => {
  const {body} = ctx;

  ctx.body = await Services.Service.createService(ctx, body);
};

export const getList = async (ctx: Context) => {
  const query = parseQuery(ctx.query);

  const list = await Services.Service.getHostList(ctx, query);

  const groupByName = list.reduce((total, item) => {
    total[item.name] = total[item.name] || [];
    total[item.name].push(item);

    return total;
  }, {});

  ctx.body = Object.keys(groupByName).map((name) => {
    const hosts = groupByName[name];
    return {
      name,
      utcCreate: hosts.map(({utcCreate}) => utcCreate).sort()[0],
      hosts
    };
  });
};

const NumIdRegex = /^\d+$/;

export const getById = async (ctx: Context) => {
  const {id} = ctx.params;

  if (NumIdRegex.exec(id)) {
    ctx.body = await Services.Service.getById(ctx, id);
  }

  ctx.body = await Services.Service.getByHostName(ctx, id);
};
