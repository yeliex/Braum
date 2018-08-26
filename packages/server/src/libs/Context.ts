import { Context as KoaContext } from 'koa';
import * as Cookies from 'cookies';
import { Accepts } from 'accepts';
import * as Sequelize from 'sequelize';
import * as Debug from 'debug';
import * as createError from 'http-errors';
import * as httpAssert from 'http-assert';
import Enums from '@braum/enums';
import db from './db';
import Error from './Error';
import * as utils from './utils';
import snowflake from './snowflake';

const responseDebug = Debug('braum:response');

export default class Context implements KoaContext {
  public readonly time;

  constructor(public readonly ctx: KoaContext) {
    this.time = new Date();
  }

  get span() {
    return this.ctx.span;
  }

  get action() {
    return this.ctx.action;
  }

  get fetch() {
    return this.ctx.fetch;
  }

  get id() {
    return async () => {
      return snowflake.next();
    };
  }

  get app() {
    return this.ctx.app;
  }

  get request() {
    return this.ctx.request;
  }

  get response() {
    return this.ctx.response;
  }

  get req() {
    return this.ctx.req;
  }

  get res() {
    return this.ctx.res;
  }

  get originalUrl() {
    return this.ctx.originalUrl;
  }

  get cookies(): Cookies {
    return this.ctx.cookies;
  }

  get accept(): Accepts {
    return this.ctx.accept;
  }

  get state() {
    return this.ctx.state;
  }

  set state(state) {
    this.ctx.state = state;
  }

  get respond() {
    return this.ctx.respond;
  }

  set respond(respond) {
    this.ctx.respond = respond;
  }

  get Error() {
    return Error;
  }

  get Enums() {
    return Enums;
  }

  get utils() {
    return utils;
  }

  get db(): typeof db.models {
    return db.models;
  }

  get Sequelize(): typeof Sequelize {
    return db.Sequelize;
  }

  get dbInstance(): typeof db.db {
    return db.db;
  }

  get params() {
    return this.ctx.params;
  }

  get query() {
    return this.ctx.query;
  }

  get body() {
    return this.ctx.request.body;
  }

  set body(body) {
    this.ctx.body = {
      code: 200,
      data: body,
    };
    responseDebug(this.ctx.method, this.ctx.originalUrl, this.ctx.status, JSON.stringify(this.ctx.response.body));
  }

  get rawBody() {
    return this.ctx.response.body;
  }

  set rawBody(rawBody) {
    this.ctx.response.body = rawBody;
  }

  throw(message: string, code?: number, properties?: {}): never
  throw(status: number): never
  throw(...properties: Array<number | string | {}>): never
  throw(...properties) {
    const error = createError(...properties);

    this.ctx.response.body = {
      code: error.status,
      message: error.message,
    };

    this.ctx.status = error.status;

    responseDebug(this.ctx.method, this.ctx.originalUrl, this.ctx.status, JSON.stringify(this.ctx.response.body));
  }

  get inspect() {
    return this.ctx.inspect;
  }

  get toJSON() {
    return this.ctx.toJSON;
  }

  get toString() {
    return this.ctx.toString;
  }

  get assert(): typeof httpAssert {
    return this.ctx.assert;
  }

  onerror(err: Error) {
    return this.ctx.onerror(err);
  }

  get header() {
    return this.ctx.header;
  }

  get headers() {
    return this.ctx.headers;
  }

  get url() {
    return this.ctx.url;
  }

  get origin() {
    return this.ctx.origin;
  }

  get href() {
    return this.ctx.href;
  }

  get method() {
    return this.ctx.method;
  }

  get path() {
    return this.ctx.path;
  }

  get querystring() {
    return this.ctx.querystring;
  }

  get search() {
    return this.ctx.search;
  }

  get host() {
    return this.ctx.host;
  }

  get hostname() {
    return this.ctx.hostname;
  }

  get URL() {
    return this.ctx.URL;
  }

  get fresh() {
    return this.ctx.fresh;
  }

  get stale() {
    return this.ctx.stale;
  }

  get idempotent() {
    return this.ctx.idempotent;
  }

  get socket() {
    return this.ctx.socket;
  }

  get protocol() {
    return this.ctx.protocol;
  }

  get secure() {
    return this.ctx.secure;
  }

  get ip() {
    return this.ctx.ip;
  }

  get ips() {
    return this.ctx.ips;
  }

  get subdomains() {
    return this.ctx.subdomains;
  }

  get accepts() {
    return this.ctx.accepts;
  }

  get acceptsEncodings() {
    return this.ctx.acceptsEncodings;
  }

  get acceptsCharsets() {
    return this.ctx.acceptsCharsets;
  }

  get acceptsLanguages() {
    return this.ctx.acceptsLanguages;
  }

  get is() {
    return this.ctx.is;
  }

  get get() {
    return this.ctx.get;
  }

  get status() {
    return this.ctx.status;
  }

  set status(status: number) {
    this.ctx.status = status;
  }

  get message() {
    return this.ctx.message;
  }

  get length() {
    return this.ctx.length;
  }

  set length(length: number) {
    this.ctx.length = length;
  }

  get headerSent() {
    return this.ctx.headerSent;
  }

  get vary() {
    return this.ctx.vary;
  }

  get redirect() {
    return this.ctx.redirect;
  }

  get attachment() {
    return this.ctx.attachment;
  }

  get type() {
    return this.ctx.type;
  }

  set type(type: string) {
    this.ctx.type = type;
  }

  get lastModified() {
    return this.ctx.lastModified;
  }

  set lastModified(lastModified: Date) {
    this.ctx.lastModified = lastModified;
  }

  get etag() {
    return this.ctx.etag;
  }

  set etag(etag: string) {
    this.ctx.etag = etag;
  }

  get set() {
    return this.ctx.set;
  }

  get append() {
    return this.ctx.append;
  }

  get remove() {
    return this.ctx.remove;
  }

  get writable() {
    return this.ctx.writable;
  }

  get flushHeaders() {
    return this.ctx.flushHeaders;
  }
}
