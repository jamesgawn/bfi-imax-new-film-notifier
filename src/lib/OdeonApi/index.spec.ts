import {OdeonApi} from "./index";
import axios from "axios";
import {BearerTokenHelper} from "./BearerTokenHelper";

jest.mock("axios");
const mockedAxios: jest.Mocked<typeof axios> = axios as any;
jest.mock("./BearerTokenHelper");
const mockedBearerTokenHelper: jest.Mocked<typeof BearerTokenHelper> = BearerTokenHelper as any;

describe("OdeonApi", () => {
  beforeEach(() => {
    mockedBearerTokenHelper.getAuthJwt.mockResolvedValue("supertoken");
    mockedAxios.get.mockReset();
    mockedAxios.get.mockResolvedValue({
      data: "piles of stuff"
    });
  });
  describe("getAllFilmsForCinema", () => {
    test("should return film data for cinema when receiving a valid response", async () => {
      const oapi = new OdeonApi();
      const filmData = await oapi.getAllFilmsForCinema(150);
      expect(filmData).toBe("piles of stuff");
    });
    test("should only attempt to retrieve an authentication token once if multiple calls are made", async () => {
      const oapi = new OdeonApi();
      await oapi.getAllFilmsForCinema(150);
      await oapi.getAllFilmsForCinema(150);
      expect(mockedBearerTokenHelper.getAuthJwt).toBeCalledTimes(1);
    });
    // TODO: Add negative scenario coverage.
  });
});
