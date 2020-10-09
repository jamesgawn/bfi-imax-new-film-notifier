import bunyan from "bunyan";
import Logger from "bunyan";

export class LoggerHelper {
  log: Logger;
  constructor(name: string) {
    this.log = bunyan.createLogger({
      name: "bfi-imax-new-film-notifier",
      child: name,
      src: true
    });
  };

  info(msg: string, data?: object) {
    this.log.info(msg, {
      data: data,
    });
  }

  error(msg: string, err?: Error, data?: any) {
    this.log.error(err, msg, {
      data: data
    });
  }
}
