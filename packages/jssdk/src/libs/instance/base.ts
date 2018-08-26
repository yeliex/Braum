export default abstract class Base {
  private _consumed: boolean = false;

  public get consumed() {
    return this._consumed;
  }

  public set consumed(consumed: boolean) {
    this._consumed = consumed;
  }
}
