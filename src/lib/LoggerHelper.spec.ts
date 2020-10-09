import {LoggerHelper} from "./LoggerHelper";
import bunyan from "bunyan";

jest.mock("bunyan", () => ({
  createLogger: jest.fn()
}));
const mockedBunyan: jest.Mocked<typeof bunyan> = bunyan as any;

describe("LoggerHelper", () => {
  let log: LoggerHelper;
  const name: string = "test";
  const infoMock: jest.Mock<void> = jest.fn();
  const errorMock: jest.Mock<void> = jest.fn();
  beforeEach(() => {
    log = new LoggerHelper(name);
    mockedBunyan.createLogger.mockReturnValue({
      info: infoMock,
      error: errorMock
    } as any);
  });
  describe("constructor", () => {
    test("should create logger with specified name", () => {
      expect(mockedBunyan.createLogger).toBeCalledWith({
        name: "bfi-imax-new-film-notifier",
        child: name,
        src: true
      });
    });
  });
  describe("info", () => {
    test("should log info level message to logger", () => {
      const data = {
        pies: "pork"
      };
      log.info("test info message", data);
      expect(infoMock).toBeCalledWith({
        data: data
      }, "test info message");
    });
  });
  describe("error", () => {
    test("should log error level message to logger", () => {
      const data = {
        pies: "pork"
      };
      const err = new Error("nooooooo!");
      log.error("test info message", err, data);
      expect(errorMock).toBeCalledWith(err, "test info message", {
        data: data
      });
    });
  });
});
