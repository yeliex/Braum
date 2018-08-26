import Base from './base';
import Span from './span';
import Error, { ErrorProps } from './error';
import Annotation, { AnnotationProps, AnnotationsProps } from './annotation';
import { is } from '../util';
import { ActionTypes } from '@braum/enums';

export interface ActionProps {
  span?: Span;
  serviceId?: string;
  id?: string;
  type: ActionTypes;
  annotations?: AnnotationsProps;
  errors?: ErrorProps[];
  utcCreate?: number;
}

export default class Action extends Base {
  protected readonly props: ActionProps;

  private errorStack: Error[] = [];
  private annotationStack: Annotation[] = [];

  constructor(props: ActionProps) {
    super();
    const {span, id, type, annotations = [], errors = [], utcCreate, serviceId} = props;

    this.props = {
      span, id, type, utcCreate: utcCreate || Date.now(), serviceId,
    };

    this.createErrors(errors);
    this.createAnnotations(annotations);
  }

  public createError(props: ErrorProps) {
    const error = new Error(props);
    props.utcCreate = props.utcCreate || this.props.utcCreate;
    this.errorStack.push(error);
    return error;
  }

  public createErrors(errors: ErrorProps[]) {
    return errors.map(this.createError);
  }

  public createAnnotation(props: AnnotationProps | string) {
    props = <AnnotationProps>(!is.object(props) ? {value: props} : props);
    const annotation = new Annotation(props);
    this.annotationStack.push(annotation);

    return annotation;
  }

  public createAnnotations(annotations: AnnotationsProps) {
    if (is.object(annotations)) {
      return Object.keys(annotations).map((key) => {
        const annotation = annotations[key];
        return this.createAnnotation({
          ...annotation,
          key,
        });
      });
    }

    return (<AnnotationProps[]>annotations).map(this.createAnnotation);
  }

  public get span(): Span {
    return <Span>this.props.span;
  }

  public get errors() {
    return this.errorStack;
  }

  public get annotations() {
    return this.annotationStack;
  }

  public get id() {
    return this.props.id;
  }

  public get spanId() {
    return this.span.id;
  }

  public get traceId() {
    return this.span.traceId;
  }

  public get serviceId() {
    return this.props.serviceId;
  }

  private get annotationsData() {
    return this.annotationStack
      .filter(a => !a.consumed)
      .map(a => (a.consumed = true, a.data));
  }

  private get errorsData() {
    return this.errorStack
      .filter(e => !e.consumed)
      .map(e => (e.consumed = true, e.data));
  }

  public get full(): any {
    const {span} = this;
    const {id, type, utcCreate} = this.props;
    return {
      id,
      type: type || ActionTypes.DEFAULT,
      spanId: span.id,
      traceId: span.traceId,
      serviceId: this.serviceId,
      utcCreate,
      annotations: this.annotationsData,
      errors: this.errorsData,
    };
  }

  public get data(): any {
    const {id, type} = this.props;
    return {
      id,
      type: ActionTypes[type] || ActionTypes.DEFAULT,
      annotations: this.annotationsData,
      errors: this.errorsData,
      serviceId: this.serviceId,
    };
  }
}
