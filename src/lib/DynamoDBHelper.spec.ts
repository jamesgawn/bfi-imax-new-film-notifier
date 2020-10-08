import {DynamoDBHelper} from "./DynamoDBHelper";
import {FilmRecord} from "../domain/FilmRecord";
import {PromiseResult} from "aws-sdk/lib/request";
import {AWSError} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {FriendlyError} from "./FriendlyError";

const mockGet = jest.fn();
const mockPut = jest.fn();
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn().mockImplementation(() => ({
      get: mockGet,
      put: mockPut
    }))
  }
}));

describe("DynamoDBHelper", () => {
  let dbh : DynamoDBHelper;
  const tableName = "bfi-film-showings";
  let mockGetPromise : jest.Mock<Promise<PromiseResult<DocumentClient.GetItemOutput, AWSError>>>;
  let mockPutPromise : jest.Mock<Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>>;
  beforeEach(() => {
    dbh = new DynamoDBHelper(tableName);
    mockGetPromise = jest.fn();
    mockPutPromise = jest.fn();
    mockGet.mockImplementation(() => ({
      promise: mockGetPromise
    }));
    mockPut.mockImplementation(() => ({
      promise: mockPutPromise
    }));
  });
  describe("getRecord", () => {
    test("should return record if in table", async () => {
      const testFilm = new FilmRecord("film1", "Film 1", 1240);
      mockGetPromise.mockResolvedValue({
        "Item": testFilm
      } as any);
      const film = await dbh.getRecordById<FilmRecord>("film1");
      expect(mockGet).toBeCalledWith({
        TableName: tableName,
        Key: {
          "id": "film1",
        }
      });
      expect(film).toBe(testFilm);
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      const sampleError = new Error("error");
      mockGetPromise.mockRejectedValue(sampleError);
      let error = new FriendlyError("blah");
      try {
        await dbh.getRecordById<FilmRecord>("film1");
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("Unable to retrieve record film1");
      expect(error.err).toBe(sampleError);
    });
  });
  describe("putRecord", () => {
    test("should return record", async () => {
      const sampleFilm = new FilmRecord("film2", "Film 2", 12345);
      mockPutPromise.mockResolvedValue("something" as any);
      const film = await dbh.putRecord<FilmRecord>(sampleFilm);
      expect(mockPut).toBeCalledWith({
        TableName: tableName,
        Item: sampleFilm
      });
      expect(film).toBeDefined();
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      const sampleFilm = new FilmRecord("film2", "Film 2", 123);
      const sampleError = new Error("error");
      mockPutPromise.mockRejectedValue(sampleError);
      let error = new FriendlyError("blah");
      try {
        await dbh.putRecord<FilmRecord>(sampleFilm);
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("Unable to store details of record film2");
      expect(error.err).toBe(sampleError);
    });
  });
});
