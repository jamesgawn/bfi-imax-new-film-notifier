import {handler} from "./lambda";
import {Context} from "aws-lambda";

describe("lambda.ts", () => {
  test("handler", async () => {
    const contextMock = {} as Context;
    const result = await handler({}, contextMock);
    expect(result).toBe("Hello World");
  });
});
