export class FriendlyError {
  message: string;
  err: Error | undefined;
  constructor(message: string, err?: Error) {
    this.message = message;
    this.err = err;
  }
}
