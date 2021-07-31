import {handler} from "./lambda";

const mockCheck = jest.fn();
jest.mock("@jamesgawn/new-film-notifier", () => ({
  NewFilmNotifier: jest.fn().mockImplementation(() => ({
    check: mockCheck,
  }))
}));

describe("lambda.ts", () => {
  beforeEach(() => {
    process.env.dynamodb_table_name = "dynamodb_table_name";
    process.env.twitter_consumer_key = "consumer_key";
    process.env.twitter_consumer_secret = "consumer_secret";
    process.env.twitter_access_token_key = "access_token_key";
    process.env.twitter_access_token_secret = "access_token_secret";
    process.env.film_look_forward_days = "1";
    mockCheck.mockReset();
  });
  test("should successfully identify new films and process them", async () => {
    delete process.env.film_look_forward_days;
    process.env.dry_run = "asda";
    await handler({} as any, {
      awsRequestId: "test"
    } as any, {} as any);
    expect(mockCheck).toBeCalledWith(150, 2, false);
  });
  test("should fail if no dynamo DB table name provided", async () => {
    delete process.env.dynamodb_table_name;
    let error = new Error("not this one");
    try {
      await handler({} as any, {
        awsRequestId: "test"
      } as any, {} as any);
    } catch (err) {
      error = err;
    }
    expect(error).toStrictEqual(new Error("DynamoDB Table not set in env vars."));
  });
  test("should fail if no twitter consumer key not provided", async () => {
    delete process.env.twitter_consumer_key;
    let error = new Error("not this one");
    try {
      await handler({} as any, {
        awsRequestId: "test"
      } as any, {} as any);
    } catch (err) {
      error = err;
    }
    expect(error).toStrictEqual(new Error("Twitter credentials not set in env vars."));
  });
  test("should fail if no twitter consumer secret not provided", async () => {
    delete process.env.twitter_consumer_secret;
    let error = new Error("not this one");
    try {
      await handler({} as any, {
        awsRequestId: "test"
      } as any, {} as any);
    } catch (err) {
      error = err;
    }
    expect(error).toStrictEqual(new Error("Twitter credentials not set in env vars."));
  });
  test("should fail if no twitter access key not provided", async () => {
    delete process.env.twitter_access_token_key;
    let error = new Error("not this one");
    try {
      await handler({} as any, {
        awsRequestId: "test"
      } as any, {} as any);
    } catch (err) {
      error = err;
    }
    expect(error).toStrictEqual(new Error("Twitter credentials not set in env vars."));
  });
  test("should fail if no twitter access secret not provided", async () => {
    delete process.env.twitter_access_token_secret;
    let error = new Error("not this one");
    try {
      await handler({} as any, {
        awsRequestId: "test"
      } as any, {} as any);
    } catch (err) {
      error = err;
    }
    expect(error).toStrictEqual(new Error("Twitter credentials not set in env vars."));
  });
  test("should pass dry run field if provided", async () => {
    process.env.dry_run = "true";
    await handler({} as any, {
      awsRequestId: "test"
    } as any, {} as any);
    expect(mockCheck).toBeCalledWith(150, 1, true);
  });
});
