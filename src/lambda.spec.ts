import {handler} from "./lambda";

describe("lambda.ts", () => {
  test("handler", async () => {
    const result = await handler();
    expect(result).toBe("Hello World");
  });
});
