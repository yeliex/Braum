import * as assert from 'assert';
import Snowflake from '@yeliex/snowflake';
import { ActionTypes } from '@braum/enums';
import { debounce } from 'lodash';
import * as Debug from 'debug';
import Span, { SpanProps } from './instance/span';
import fetch, { FetchRequest } from './fetch';
import { is } from './util';

const debug = Debug('braum');

const requestDebug = Debug('braum:request');

export interface CoreProps {
  endpoint?: string;
  snowflake?: string | Snowflake;
  fetch?: typeof fetch;
}

export default abstract class Braum {
  protected readonly props: CoreProps;

  protected stack: any[] = [];

  static check(props: CoreProps): CoreProps {
    const {endpoint, snowflake, fetch: customFetch = fetch} = props;

    assert(
      is.string(endpoint),
      `endpoint must be non-empty string, but got ${typeof endpoint}`,
    );

    assert(
      is.string(snowflake) || is.instance(snowflake, 'SnowFlake'),
      `snowflake must be non-empty string or snowflake instance, but got ${typeof snowflake}`,
    );

    return {endpoint, snowflake, fetch: customFetch};
  }

  constructor(props: CoreProps) {
    this.props = Braum.check(props);
  }

  abstract async init(): Promise<void>;

  public get endpoint() {
    return this.props.endpoint;
  }

  protected async request(path: string, options: FetchRequest = {}) {
    // options.keepalive = options.keepalive || true;

    options.host = options.host || this.endpoint;

    options.headers = options.headers || {};
    options.headers['X-Trace'] = false;

    try {
      const res = await fetch(path, options);

      if (res.status >= 400) {
        throw new Error(res.statusText);
      }

      const json = await res.json();

      if (json.code && json.code < 400) {
        return json.data;
      }
      throw new Error(json.message || json);
    } catch (e) {
      requestDebug(e.message);
      return;
    }
  }

  public genFetch(parent: Span) {
    const originFetch = this.props.fetch;
    const braum = this;
    return async function decoratedFetch(path: string, options: FetchRequest = {}, ...args: any[]) {
      const span = parent.createChild(await braum.genId());

      const annotations: any = {
        method: (options.method || 'get').toUpperCase(),
        path,
      };

      if (options.params) {
        annotations.params = options.params;
      }
      if (options.query) {
        annotations.query = options.query;
      }

      span.createAction({
        type: ActionTypes.CLIENT_SEND,
        annotations,
      });

      // todo: 需要维护fetch异常的情况, epo server需要维护不兼容的地方
      try {
        const res = await (<any>originFetch)(path, options, ...args);

        span.createAction({
          type: ActionTypes.CLIENT_RECEIVE,
          annotations: {
            status: res.status,
          },
        });

        braum.push(span.data);

        return res;
      } catch (error) {
        const e: any = error instanceof Error ? {error} : {
          name: 'FecthError',
          message: typeof error === 'string' && error || error.message,
          meta: error,
        };

        const action = span.createAction({
          type: ActionTypes.CLIENT_RECEIVE,
          annotations: {
            status: error.status || error.code || 500,
          },
        });

        action.createError(e);

        braum.push(span.data);

        throw error;
      }
    };
  }

  // get snowflake instance
  public get snowflake() {
    return this.props.snowflake;
  }

  // generate a snowflake id
  public async genId() {
    if (is.instance(this.snowflake, 'SnowFlake')) {
      return (await (<Snowflake>this.snowflake).next()).toString('hex');
    }
    // todo: 请求snowflake获取id
    const res = await this.request('/', {
      host: <string>this.snowflake,
    });

    return res;
  }

  public createSpan(props: SpanProps) {
    return new Span(props);
  }

  public get spans() {
    return this.stack;
  }

  private async _save() {
    const list = this.stack;
    this.stack = [];

    debug('[SAVE START]', list.length);

    if (list.length > 0) {
      await this.request('/api/spans', {
        method: 'POST',
        body: list,
      });

      debug('[SAVE FINISH]');
    }
  }

  private get save() {
    return debounce(this._save, 500);
  }

  public push(data: any) {
    this.stack.push(data);
    this.save();
  }
}
