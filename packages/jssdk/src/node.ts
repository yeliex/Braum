import * as assert from 'assert';
import { Context } from 'koa';
import { defaults } from 'lodash';
import { hostname } from 'os';
import * as compose from 'koa-compose';
import { ActionTypes } from '@braum/enums';
import BraumCore, { CoreProps } from './libs/core';
import Span, { SpanProps } from './libs/instance/span';
import Action from './libs/instance/action';
import { is } from './libs/util';
import fetch from './libs/fetch';

export interface BraumProps extends CoreProps {
  host?: string;
  service?: string;
  port?: number;
  ip?: string;
}

type ErrorHandler = (error: any, ctx: Context) => void

const defaultErrorHandler: ErrorHandler = (error: Error, ctx: Context) => {
  ctx.body = error.message || error;
  ctx.state = 500;
};

export interface MiddlewareOptions {
  errorHandler: ErrorHandler
}

const defaultProps: BraumProps = {
  host: hostname(),
  snowflake: 'snowflake',
  service: 'braum-service',
  endpoint: 'braum',
};

declare module 'koa' {
  interface Context {
    span: Span;
    action: Action;
    fetch: typeof fetch
  }
}

export default class Braum extends BraumCore {
  static default = Braum;

  static TraceHeader = 'X-TraceId';

  static SpanHeader = 'X-SpanId';

  static ParentHeader = 'X-ParentId';

  protected readonly props: BraumProps;

  protected _serviceId: string;

  static check(props: BraumProps): BraumProps {
    const {host, service, port, ip} = props;
    assert(
      is.string(service),
      `service must be non-empty string, but got ${typeof service}`,
    );

    if (ip && !is.container()) {
      console.warn('do not set ip if run with docker');
    }

    return {
      host,
      service,
      port,
      ip,
      ...BraumCore.check(props),
    };
  }

  constructor(props: BraumProps) {
    super(props);
    this.props = Braum.check(defaults(props, defaultProps));
    this.init();
  }

  async init() {
    const {service, host, ip} = this.props;
    const body: any = {
      service,
      host,
    };
    if (is.string(ip)) {
      body.ip = ip;
    }
    const res = await this.request('/api/services', {
      method: 'POST',
      body,
    });

    this._serviceId = res.id;

    return res;
  }

  public async ready() {
    if (this.serviceId) {
      return;
    }
    await this.init();
  }

  public get serviceId() {
    return this._serviceId;
  }

  public createSpan(props: SpanProps) {
    props.serviceId = this.serviceId;
    return super.createSpan(props);
  }

  public get middleware() {
    const braum = this;

    return (options: MiddlewareOptions = <MiddlewareOptions>{}) => {
      const errorHandler: ErrorHandler = options.errorHandler || defaultErrorHandler;

      const middleware = async (ctx: Context, next) => {
        if (ctx.get('X-Trace') === 'false') {
          return await next();
        }
        const spanId = ctx.get(Braum.SpanHeader) || await this.genId();
        const traceId = ctx.get(Braum.TraceHeader) || spanId;
        const parentId = ctx.get(Braum.ParentHeader) || undefined;

        ctx.response.set(Braum.SpanHeader, spanId);
        ctx.response.set(Braum.TraceHeader, traceId);

        const span = braum.createSpan({
          id: spanId,
          traceId,
          parentId,
        });

        ctx.span = span;
        ctx.fetch = this.genFetch(span);

        span.createAction({
          type: ActionTypes.SERVER_RECEIVE,
          annotations: {
            method: ctx.method,
            path: ctx.path,
          },
        });

        ctx.action = span.createAction({
          type: ActionTypes.SERVER_SEND,
          annotations: {
            status: ctx.state,
          },
        });

        await next();

        ctx.action.utcCreate = Date.now();

        braum.push(span.data);
      };

      const errorMiddleware = async (ctx, next) => {
        try {
          await next();
        } catch (error) {
          const e: any = error instanceof Error ? {error} : {
            name: 'ResponseError',
            message: error.message || error.error || error,
            meta: {code: error.code || error.status},
          };
          ctx.action && ctx.action.createError(e);
          errorHandler(error, ctx);
        }
      };

      return compose([middleware, errorMiddleware]);
    };
  }
}
