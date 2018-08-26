import Base from './base';
import Action from './action';

export interface ErrorProps {
  action?: Action;
  error?: Error;
  name?: string;
  message?: string;
  stack?: string;
  meta: any;
  utcCreate?: number;
}

export default class Err extends Base {
  protected readonly props: ErrorProps;

  constructor(props: ErrorProps) {
    super();
    const {error} = props;
    props.meta = props.meta || {};
    if (error) {
      props.name = error.name;
      props.message = error.message;
      props.stack = error.stack;
    }
    props.utcCreate = props.utcCreate || Date.now();
    this.props = props;
  }

  public set meta(meta) {
    this.props.meta = meta;
  }

  public get meta() {
    return this.props.meta;
  }

  public get action(): Action {
    return <Action>this.props.action;
  }

  public get full(): any {
    const {action} = this;
    const {name, message, stack, meta, utcCreate} = this.props;
    return {
      actionId: action.id,
      spanId: action.spanId,
      traceId: action.traceId,
      name,
      message,
      stack,
      meta,
      utcCreate,
    };
  }

  public get data(): any {
    const {name, message, stack, meta, utcCreate} = this.props;
    return {
      name,
      message,
      stack,
      meta,
      utcCreate,
    };
  }
}
