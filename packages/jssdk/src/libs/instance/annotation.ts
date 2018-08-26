import Base from './base';
import Action from './action';

interface AnnotationPropsBase {
  value: any;
  action: Action;
}

export interface AnnotationProps extends AnnotationPropsBase {
  key: any;
}

export interface AnnotationsPropsObj {
  [key: string]: any | AnnotationPropsBase
}

export type AnnotationsProps = AnnotationProps[] | AnnotationsPropsObj;

export default class Annotation extends Base {
  protected readonly props: AnnotationProps;

  constructor(props: AnnotationProps) {
    super();
    this.props = props;
  }

  public get full(): any {
    const {key, value, action} = this.props;

    return {
      key,
      value,
      actionId: action.id,
      spanId: action.spanId,
      traceId: action.traceId,
    };
  }

  public get data(): any {
    const {key, value} = this.props;
    return {
      key, value,
    };
  }
}
