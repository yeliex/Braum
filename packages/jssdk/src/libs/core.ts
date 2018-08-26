import * as assert from 'assert';
import fetch, { FetchRequest } from './fetch';
import Snowflake from '@yeliex/snowflake';
import { ActionTypes } from '@braum/enums';
import Span, { SpanProps } from './instance/span';
import { is } from './util';
import { debounce } from 'lodash';

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

    const res = await fetch(path, options);

    const json = await res.json();

    if (json.code && json.code < 400) {
      return json.data;
    }
    return json;
  }

  public genFetch(parent: Span) {
    const originFetch = this.props.fetch;
    const braum = this;
    return async function decoratedFetch(path: string, options: FetchRequest = {}) {
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
      const res = await (<typeof fetch>originFetch)(path, options);

      span.createAction({
        type: ActionTypes.CLIENT_RECEIVE,
        annotations: {
          status: res.status,
        },
      });

      braum.push(span.data);

      return res;
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

    await this.request('/api/spans', {
      method: 'POST',
      body: list,
    });
  }

  private get save() {
    return debounce(this._save, 500);
  }

  public push(data: any) {
    this.stack.push(data);
    this.save();
  }
}
