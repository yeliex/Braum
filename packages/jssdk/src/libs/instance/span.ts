import Base from './base';
import Action, { ActionProps } from './action';

export interface SpanProps {
  serviceId?: string;
  id?: string;
  traceId?: string;
  parentId?: string;
  duration?: number;
}

export default class Span extends Base {
  protected props: SpanProps;

  protected stack: Action[] = [];

  constructor(props) {
    super();

    this.props = props;
  }

  public createAction(props: ActionProps) {
    const action = new Action({
      ...props,
      span: this,
      serviceId: this.serviceId,
    });

    this.stack.push(action);

    return action;
  }

  public createChild(id?: string) {
    return new Span({
      id,
      serviceId: this.props.serviceId,
      parentId: this.props.id,
      traceId: this.props.traceId,
    });
  }

  public get actions() {
    return this.stack;
  }

  public get id() {
    return this.props.id;
  }

  public get traceId() {
    return this.props.traceId;
  }

  public get serviceId() {
    return this.props.serviceId;
  }

  public get data(): any {
    const {id, parentId, traceId} = this.props;
    this.consumed = true;
    return {
      id,
      parentId,
      traceId,
      actions: this.stack.filter(a => !a.consumed).map(a => {
        a.consumed = true;
        return a.data;
      }),
    };
  }
}
