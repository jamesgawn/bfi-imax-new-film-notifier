import bunyan from "bunyan";
import Logger from "bunyan";

export class LoggerHelper {
  static additionalFields : object = {};
  log: Logger;
  constructor(name: string) {
    this.log = bunyan.createLogger({
      ...LoggerHelper.additionalFields,
      name: "bfi-imax-new-film-notifier",
      child: name,
      src: true
    });
  };

  info(msg: string, data?: any) {
    if (data) {
      this.log.info({
        data: data
      }, msg);
    } else {
      this.log.info(msg);
    }
  }

  error(msg: string, err?: Error, data?: any) {
    if (data) {
      this.log.error(err, msg, {
        data: data
      });
    } else {
      this.log.error(err, msg);
    }
  }

  static set setAdditionalFields(data: any) {
    this.additionalFields = data;
  }
}
