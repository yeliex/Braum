import Enums from '@braum/enums';

declare module BrarumTypes {
  export type UtcDuration = string | number | Date

  export type UtcDurations = UtcDuration[];

  export interface QueryBase {
    page?: number;
    pageSize?: number;
  }

  export interface Service {
    id: number;
    name: string;
    host: string;
    ipv4: string;
    ipv6: string;
    port: number;
    status: Enums.ServiceStatus;
    utcCreate: number;
    utcStart: number;
  }

  export namespace Service {
    export interface CreateService {
      host: string;
      service: string;
      port: number;
      host_ip: string;
    }

    export interface QueryService extends QueryBase {
      name?: string[];
      id?: number[] | string[];
      host?: string[];
      ip?: string[];
    }
  }

  export interface Span {
    id: string;
    traceId: string;
    parentId?: string;
    duration: number;
    utcCreate: Date;
    actions?: Actions;
  }

  export type Spans = Span[];

  export namespace Span {
    export interface CreateSpan {
      id: string;
      traceId?: string;
      parentId?: string;
      duration?: number;
      utcCreate?: number;
      actions?: Action.CreateActions;
    }

    export type CreateSpans = CreateSpan[];

    export interface QuerySpan extends QueryBase {
      id?: string[];
      traceId?: string[];
      parentId?: string[];
      duration?: UtcDurations; // [durMin, durMax]
      utcCreate?: UtcDurations; // [createBegin, createEnd]
    }
  }

  export interface Action {
    id: string;
    spanId: string;
    traceId: string;
    serviceId: number;
    type: Enums.ActionTypes;
    utcCreate: Date;
    errors?: Errors;
    annotations?: Annotations;
  }

  export type Actions = Action[];

  export namespace Action {
    export interface CreateAction {
      id: string;
      spanId: string;
      traceId?: string;
      serviceId?: number;
      type: Enums.ActionTypes;
      utcCreate?: Date;
      errors?: Error.CreateErrors;
      annotations?: Annotation.CreateAnnotations;
    }

    export type CreateActions = CreateAction[]

    export interface QueryAction extends QueryBase {
      id?: string[];
      spanId?: string[];
      traceId?: string[];
      serviceId?: string[] | number[];
      type?: Enums.ActionTypes[];
      utcCreate?: UtcDurations;
    }
  }

  export interface Annotation {
    actionId: string;
    spanId: string;
    traceId: string;
    key: string;
    value?: string;
    utcCreate: Date;
  }

  export type Annotations = Annotation[];

  export namespace Annotation {
    export interface CreateAnnotation {
      actionId: string;
      spanId?: string;
      traceId?: string;
      key: string;
      value?: any;
      utcCreate?: Date;
    }

    export type CreateAnnotations = CreateAnnotation[];

    export interface QueryAnnotation extends QueryBase {
      actionId?: string[];
      spanId?: string[];
      traceId?: string[];
      key?: string[];
      keyword?: string;
      utcCreate?: UtcDurations;
    }

    export interface QueryAnnotationKeys extends QueryBase {
      actionId?: string[];
      spanId?: string[];
      traceId?: string[];
      keyword?: string;
      utcCreate?: UtcDurations;
    }
  }

  export interface Error {
    id: string;
    actionId: string;
    spanId: string;
    traceId: string;
    name: string;
    message: string;
    stack?: string;
    meta?: any;
    utcCreate: Date;
  }

  export type Errors = Error[];

  export namespace Error {
    export interface CreateError {
      id: string;
      actionId: string;
      spanId?: string;
      traceId?: string;
      name: string;
      message: string;
      stack?: string;
      meta?: any;
      utcCreate?: Date;
    }

    export type CreateErrors = CreateError[];

    export interface QueryError extends QueryBase {
      id?: string[];
      actionId?: string[];
      spanId?: string[];
      traceId?: string[];
      name?: string[];
      keyword: string;
      utcCreate?: UtcDurations;
    }
  }
}

export default BrarumTypes;
