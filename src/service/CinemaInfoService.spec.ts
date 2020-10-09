import {CinemaInfoService} from "./CinemaInfoService";
import {parse} from "date-fns";
import {SimpleShowing} from "./domain/SimpleShowing";
import {Film} from "../lib/OdeonApi/odeonTypes";

const mockGetShowtimesForCinema = jest.fn();
jest.mock("../lib/OdeonApi", () => ({
  OdeonApi: jest.fn().mockImplementation(() => ({
    getShowtimesForCinema: mockGetShowtimesForCinema
  }))
}));

describe("CinemaInfoService.ts", () => {
  let cis: CinemaInfoService;
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
  const films = [
    film1,
    film2
  ];
  const emptyShowtimes = {
    showtimes: [],
    relatedData: {
      films: films
    }
  };
  const startDate = parse("2019-01-01", "yyyy-MM-dd", new Date());
  const startDatePlusOne = parse("2019-01-02", "yyyy-MM-dd", new Date());
  const startDatePlusTwo = parse("2019-01-03", "yyyy-MM-dd", new Date());
  beforeEach(() => {
    cis = new CinemaInfoService();
    mockGetShowtimesForCinema.mockReset();
  });
  describe("getNextShowingByFilmForCinema", () => {
    test("should return a film on future date", async ()=> {
      const testData = {
        showtimes: [{
          id: "123-123",
          filmId: "filmid1",
          schedule: {
            businessDate: "2019-01-02",
          }
        }],
        relatedData: {
          films: films
        }
      };
      mockGetShowtimesForCinema.mockResolvedValueOnce(emptyShowtimes);
      mockGetShowtimesForCinema.mockResolvedValueOnce(testData);
      mockGetShowtimesForCinema.mockResolvedValueOnce(emptyShowtimes);

      const result = await cis.getNextShowingByFilmForCinema(150, startDate, 2);
      expect(mockGetShowtimesForCinema).nthCalledWith(1, 150, startDate);
      expect(mockGetShowtimesForCinema).nthCalledWith(2, 150, startDatePlusOne);
      expect(mockGetShowtimesForCinema).nthCalledWith(3, 150, startDatePlusTwo);
      expect(result).toStrictEqual(new Map([
        ["filmid1", new SimpleShowing("123-123", film1.id, film1.title.text, startDatePlusOne)]
      ]));
    });
    test("should return first showing for film on multiple future dates", async ()=> {
      const testData = {
        showtimes: [{
          id: "123-123",
          filmId: "filmid1",
          schedule: {
            businessDate: "2019-01-02",
          }
        }],
        relatedData: {
          films: films
        }
      };
      const testData2 = {
        showtimes: [{
          id: "123-124",
          filmId: "filmid1",
          schedule: {
            businessDate: "2019-01-03",
          }
        }],
        relatedData: {
          films: films
        }
      };
      mockGetShowtimesForCinema.mockResolvedValueOnce(emptyShowtimes);
      mockGetShowtimesForCinema.mockResolvedValueOnce(testData);
      mockGetShowtimesForCinema.mockResolvedValueOnce(testData2);

      const result = await cis.getNextShowingByFilmForCinema(150, startDate, 2);
      expect(mockGetShowtimesForCinema).nthCalledWith(1, 150, startDate);
      expect(mockGetShowtimesForCinema).nthCalledWith(2, 150, startDatePlusOne);
      expect(mockGetShowtimesForCinema).nthCalledWith(3, 150, startDatePlusTwo);
      expect(result).toStrictEqual(new Map([
        ["filmid1", new SimpleShowing("123-123", film1.id, film1.title.text, startDatePlusOne)]
      ]));
    });
    test("should return should return the first showing for multiple films over multiple future dates", async ()=> {
      const firstDaysShowings = {
        showtimes: [{
          id: "1-1",
          filmId: "filmid1",
          schedule: {
            businessDate: "2019-01-01",
          }
        }],
        relatedData: {
          films: films
        }
      };
      const secondDaysShowings = {
        showtimes: [{
          id: "1-2",
          filmId: "filmid1",
          schedule: {
            businessDate: "2019-01-02",
          }
        },
        {
          id: "2-1",
          filmId: "filmid2",
          schedule: {
            businessDate: "2019-01-02",
          }
        }],
        relatedData: {
          films: films
        }
      };
      const thirdDaysShowings = {
        showtimes: [{
          id: "2-2",
          filmId: "filmid2",
          schedule: {
            businessDate: "2019-01-03",
          }
        }],
        relatedData: {
          films: films
        }
      };
      mockGetShowtimesForCinema.mockResolvedValueOnce(firstDaysShowings);
      mockGetShowtimesForCinema.mockResolvedValueOnce(secondDaysShowings);
      mockGetShowtimesForCinema.mockResolvedValueOnce(thirdDaysShowings);

      const result = await cis.getNextShowingByFilmForCinema(150, startDate, 2);
      expect(mockGetShowtimesForCinema).nthCalledWith(1, 150, startDate);
      expect(mockGetShowtimesForCinema).nthCalledWith(2, 150, startDatePlusOne);
      expect(mockGetShowtimesForCinema).nthCalledWith(3, 150, startDatePlusTwo);
      expect(result).toStrictEqual(new Map([
        ["filmid1", new SimpleShowing("1-1", film1.id, film1.title.text, startDate)],
        ["filmid2", new SimpleShowing("2-1", film2.id, film2.title.text, startDatePlusOne)]
      ]));
    });
  });
});
