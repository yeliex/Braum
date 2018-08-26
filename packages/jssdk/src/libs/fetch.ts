import originFetch from 'cross-fetch';
import { format } from 'url';

export interface Params {
  [key: string]: string | number;
}

export interface Query {
  [key: string]: string | number;
}

export interface FetchRequest {
  host?: string;
  params?: Params;
  query?: Query;
  body?: string | object;
  headers?: any;
  credentials?: RequestCredentials;
  integrity?: string;
  keepalive?: boolean;
  method?: string;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  signal?: AbortSignal | null;
  window?: any;
}

const pathRegex = /:([a-z-_]+)/gi;

export default async function fetch(path: string, options: FetchRequest = {}) {
  options.headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    ...options.headers,
  };
  options.credentials = options.credentials || 'include';
  options.keepalive = options.keepalive || true;
  if (options.params && Object.keys(options.params).length) {
    path = path.replace(pathRegex, (p, key: keyof Params) => String((<Params>options.params)[key] || p));
  }

  const url = format({
    host: options.host,
    pathname: path,
  });

  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  delete options.params;

  return originFetch(url, <any>options);
}
