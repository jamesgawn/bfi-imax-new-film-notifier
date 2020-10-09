import {LoggerHelper} from "./LoggerHelper";

export class Base {
  log: LoggerHelper
  constructor() {
    this.log = new LoggerHelper(this.constructor["name"]);
  }
}
