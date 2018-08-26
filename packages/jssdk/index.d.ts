import Types from '@braum/types';
import { BraumProps as NodeProps } from './lib/node';
import { BraumProps as BrowserProps } from './lib/browser';
import { Context, Middleware } from 'koa';
import Span from './lib/libs/instance/span';
import Action from './lib/libs/instance/action';
import fetch from './src/libs/fetch';

declare module 'koa' {
  interface Context {
    span: Span;
    action: Action;
    fetch: typeof fetch
  }
}

declare type BraumProps = NodeProps | BrowserProps;

declare type ErrorHandler = (error: any, ctx: Context) => void

declare interface MiddlewareOptions {
  errorHandler: ErrorHandler
}

declare class Braum {
  static defualt: Braum;
  static TraceHeader: string;
  static SpanHeader: string;
  static ParentHeader: string;
  protected readonly props: BraumProps;
  protected _service: Types.Service;

  static check(props: BraumProps): BraumProps;

  constructor(props: BraumProps);

  init(): Promise<void>;

  ready(): Promise<void>;

  readonly service: Types.Service;

  readonly middleware: (options: MiddlewareOptions) => Middleware;
}

export = Braum;
