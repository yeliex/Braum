import Context from '../libs/Context';
import Types from '@braum/types';

const ipv4Reg = /(\d{1,3}\.){3}\d{1,3}/;

export const createService = async (ctx: Context, query: Types.Service.CreateService) => {
  const {host, service: name, port, host_ip: hostIp} = query;

  const ip = hostIp ? `::ffff:${hostIp}` : ctx.ip;

  const ipv4Match = ipv4Reg.exec(ip);
  const ipv4 = ipv4Match ? ipv4Match[0] : undefined;

  const {Service} = ctx.db;
  const {Op} = ctx.Sequelize;

  const where: any = {name, ipv6: hostIp};
  if (port) where.port = port;

  const data = {
    host,
    name,
    ipv4,
    ipv6: ip,
    port,
    status: ctx.Enums.ServiceStatus.START,
    utcStart: ctx.time,
  };

  // detect exist service
  const [service, created] = await Service.findOrCreate({
    where: <any>{
      name,
      [Op.or]: [
        {host},
        {ipv6: ip, port},
      ],
    },
    defaults: data,
  });

  if (created) {
    await service.reload();
  } else {
    await service.update(data);
  }

  return service;
};

export const getHostList = async (ctx: Context, query: Types.Service.QueryService) => {
  const {name, id, host, ip} = query;

  const where: any = {};

  name && name.length && (where.name = name);
  id && id.length && (where.id = id);
  host && host.length && (where.host = host);
  ip && ip.length && (where.ipv4 = ip);

  return await ctx.db.Service.findAll({
    where,
    order: [
      ['utcStart', 'DESC'],
    ],
  });
};

export const getByHostName = async (ctx: Context, host: string) => {
  const endpoint = await ctx.db.Service.findOne({
    where: {
      host,
    },
  });

  if (endpoint) {
    return endpoint;
  }

  throw new ctx.Error.NotFound('endpoint');
};

export const getById = async (ctx: Context, id: number) => {
  const endpoint = await ctx.db.Service.findOne({
    where: {id},
  });

  if (endpoint) {
    return endpoint;
  }

  throw new ctx.Error.NotFound('endpoint');
};
