import {handler} from "./lambda";
import {SimpleShowing} from "./service/domain/SimpleShowing";
import {Film} from "./lib/OdeonApi/odeonTypes";
import {add} from "date-fns";

const mockGetNextShowingByFilmForCinema = jest.fn();
jest.mock("./service/CinemaInfoService", () => ({
  CinemaInfoService: jest.fn().mockImplementation(() => ({
    getNextShowingByFilmForCinema: mockGetNextShowingByFilmForCinema
  }))
}));
const mockGetRecordById = jest.fn();
const mockPutRecord = jest.fn();
jest.mock("./lib/DynamoDBHelper", () => ({
  DynamoDBHelper: jest.fn().mockImplementation(() => ({
    getRecordById: mockGetRecordById,
    putRecord: mockPutRecord
  }))
}));

describe("lambda.ts", () => {
  const film1 = {
    "id": "filmid1",
    "title": {
      "text": "Film 1",
    }
  } as Film;
  const film2 = {
    "id": "filmid2",
    "title": {
      "text": "Film 2",
    }
  } as Film;
  const showing1 = new SimpleShowing("film1", film1, add(new Date(), {days: 1}));
  const showing2 = new SimpleShowing("film2", film2, add(new Date(), {days: 2}));
  test("handler", async () => {
    mockGetNextShowingByFilmForCinema.mockResolvedValue(new Map<string, SimpleShowing>([
      ["film1", showing1],
      ["film2", showing2]
    ]));
    mockGetRecordById.mockResolvedValueOnce(film1);
    mockGetRecordById.mockResolvedValueOnce(undefined);
    const result = await handler();
    expect(mockGetRecordById).toHaveBeenNthCalledWith(1, "film1");
    expect(mockGetRecordById).toHaveBeenNthCalledWith(2, "film2");
    expect(mockPutRecord).toHaveBeenCalledTimes(1);
    expect(mockPutRecord).toBeCalledWith(showing2.toRecord());
    console.log(result);
  });
});
