import BraumCore, { CoreProps } from './libs/core';

export interface BraumProps extends CoreProps {

}

export default class Braum extends BraumCore {
  static default = Braum;

  static TraceHeader = 'X-TraceId';

  static SpanHeader = 'X-SpanId';

  static ParentHeader = 'X-ParentId';

  public async init() {

  }
}
