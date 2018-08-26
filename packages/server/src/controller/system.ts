import Context from '../libs/Context';
import Config from '../libs/config';

export const getConfig = (ctx: Context) => {
  ctx.body = Config;
};

export const mockException = () => {
  throw new Error('mock exception');
};
