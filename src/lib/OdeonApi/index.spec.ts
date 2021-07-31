import {OdeonApi} from "./index";
import axios from "axios";
import {BearerTokenHelper} from "./BearerTokenHelper";
import {FriendlyError} from "../FriendlyError";

jest.mock("axios");
const mockedAxios: jest.Mocked<typeof axios> = axios as any;
jest.mock("./BearerTokenHelper");
const mockedBearerTokenHelper: jest.Mocked<typeof BearerTokenHelper> = BearerTokenHelper as any;

describe("OdeonApi", () => {
  beforeEach(() => {
    mockedBearerTokenHelper.getAuthJwt.mockReset();
    mockedBearerTokenHelper.getAuthJwt.mockResolvedValue("supertoken");
    mockedAxios.get.mockReset();
  });
  describe("getAllFilmsForCinema", () => {
    test("should return film data for cinema when receiving a valid response", async () => {
      mockedAxios.get.mockResolvedValue({
        data: "piles of stuff"
      });
      const oapi = new OdeonApi();
      await oapi.initialise();
      const filmData = await oapi.getAllFilmsForCinema(150);
      expect(filmData).toBe("piles of stuff");
      expect(mockedAxios.get).toBeCalledWith("https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/films?siteIds=150", {
        headers: {
          "Authorization": "Bearer supertoken",
          "User-Agent": OdeonApi.userAgent
        }
      });
      expect(mockedBearerTokenHelper.getAuthJwt).toBeCalledTimes(1);
    });
    test("should only attempt to retrieve an authentication token once if multiple calls are made", async () => {
      mockedAxios.get.mockResolvedValue({
        data: "piles of stuff"
      });
      const oapi = new OdeonApi();
      await oapi.getAllFilmsForCinema(150);
      await oapi.getAllFilmsForCinema(150);
      expect(mockedBearerTokenHelper.getAuthJwt).toBeCalledTimes(1);
    });
    test("should throw an error if the API failed to provide a valid response", async () => {
      const mockedError = new Error("Weird");
      mockedAxios.get.mockRejectedValue(mockedError);
      let error : FriendlyError = new FriendlyError("nope");
      try {
        const oapi = new OdeonApi();
        await oapi.getAllFilmsForCinema(149);
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("Unable to retrieve films for cinema site 149");
      expect(error.err).toBe(mockedError);
    });
  });
  describe("getShowtimesForCinema", () => {
    test("should return showtime data for successful API request", async () => {
      mockedAxios.get.mockResolvedValue({
        data: "piles of stuff"
      });
      const oapi = new OdeonApi();
      const filmData = await oapi.getShowtimesForCinema(149, new Date("2020-01-01"));
      expect(filmData).toBe("piles of stuff");
      expect(mockedAxios.get).toBeCalledWith("https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/showtimes/business-date/2020-01-01?siteIds=149", {
        headers: {
          "Authorization": "Bearer supertoken",
          "User-Agent": OdeonApi.userAgent
        }
      });
    });
    test("should throw an error if the API failed to provide a valid response", async () => {
      const mockedError = new Error("Weird");
      mockedAxios.get.mockRejectedValue(mockedError);
      let error : FriendlyError = new FriendlyError("nope");
      try {
        const oapi = new OdeonApi();
        await oapi.getShowtimesForCinema(149, new Date("2020-01-01"));
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("Unable to retrieve showtimes on 2020-01-01 for cinema site 149");
      expect(error.err).toBe(mockedError);
    });
  });
});
