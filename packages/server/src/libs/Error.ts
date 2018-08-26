export default class CustomError extends Error {
  static get NotFound() {
    return NotFoundError;
  };

  public readonly code: number;

  constructor(code: number)
  constructor(message: string)
  constructor(code: number, message?: string)
  constructor(code: number | string, message?: string) {
    if (!message && typeof code !== 'number') {
      message = code;
      code = 500;
    }

    message = message || undefined;
    code = code || 500;

    super(message);

    this.code = <number>code;
  }
}

export class NotFoundError extends CustomError {
  constructor(name = 'resource') {
    super(404, `${name} not found`);
  }
}
