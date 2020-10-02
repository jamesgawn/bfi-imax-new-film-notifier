import {BearerTokenHelper} from "./BearerTokenHelper";
import axios from "axios";
import * as fs from "fs";

jest.mock("axios");
const mockedAxios: jest.Mocked<typeof axios> = axios as any;

describe("BearerTokenHelper.ts", () => {
  let validPage : string;
  let invalidPageMissingLine : string;
  beforeAll(() => {
    validPage = fs.readFileSync("./src/lib/OdeonApi/testdata/auth-page.html").toString();
    invalidPageMissingLine = fs.readFileSync("./src/lib/OdeonApi/testdata/auth-page-missing-line.html").toString();
  });
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: validPage
    });
  });
  describe("getAuthJwt", () => {
    test("should return the auth JWT with valid page retrieved successfully", async () => {
      const authJwt = await BearerTokenHelper.getAuthJwt();
      expect(authJwt).toBe("eyJhbGciOiJSUB1QifQ.eyJzdWIiOiJx-WtjOHo5eGJiZzF0YTN");
    });
    test("should return throw an error if unable to retrieve the page", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Weird"));
      let error = new Error();
      try {
        await BearerTokenHelper.getAuthJwt();
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("Unable to retrieve page contents from https://beta.odeon.co.uk/cinemas/bfi-imax/#. Weird");
    });
    test("should return throw an error if able to return successfully, but there's not content", async () => {
      mockedAxios.get.mockResolvedValue({});
      let error = new Error();
      try {
        await BearerTokenHelper.getAuthJwt();
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("No page data returned from https://beta.odeon.co.uk/cinemas/bfi-imax/#.");
    });
  });
  describe("findLineContainingJwt", () => {
    test("should throw error if not able to find line with authToken in it", () =>{
      mockedAxios.get.mockResolvedValue({
        data: invalidPageMissingLine
      });
      let error = new Error();
      try {
        BearerTokenHelper.findLineContainingJwt(invalidPageMissingLine);
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("Unable to find authToken in page");
    });
  });
  describe("getJwtFromLine", () => {
    test("should throw an error when valid token is not present", () => {
      // eslint-disable-next-line max-len
      const line = "    initialiseWidgetsFromData({\"api\":{\"url\":\"https://vwc.odeon.co.uk/WSVistaWebClient/\",\"regionCode\":\"UK\",\"authToken\":\"eyJhbGciOiJS234523£$UzIO2SuqXOGOPk\"},\"cache\":{\"durations\":{\"showtimes\":15,\"screeningDates\":60,\"items\":60,\"films\":60,\"sites\":60}},\"cdn\":{\"vista\":{\"url\":\"https://vwc.odeon.co.uk/CDN\"},\"moviexchange\":{\"url\":\"https://film-cdn.moviexchange.com/api/cdn\"}},\"cxm\":{\"enabled\":false,\"maxAttempts\":0,\"requestWindowInMillis\":0,\"timeoutInMillis\":0},\"ticketing\":{\"isSeatFirstOrdering\":true,\"maximumAllowedTicketsInAnOrder\":10,\"ticketRedemptionCodeTypes\":[{\"id\":\"limitless-with-central-london\",\"category\":\"LoyaltySubscriptionCard\",\"loyaltySubscriptionId\":0,\"label\":\"Limitless Card\",\"icon\":\"limitless-card\",\"codeFormat\":{\"prefixLength\":5,\"partialFormat\":\"^39935\\\\d{0,8}$\",\"fullFormat\":\"^39935\\\\d{8}$\"}},{\"id\":\"limitless-without-central-london\",\"category\":\"LoyaltySubscriptionCard\",\"loyaltySubscriptionId\":1,\"label\":\"Limitless Card\",\"icon\":\"limitless-card\",\"codeFormat\":{\"prefixLength\":5,\"partialFormat\":\"^39935\\\\d{0,8}$\",\"fullFormat\":\"^39935\\\\d{8}$\"}},{\"id\":\"meerkat\",\"category\":\"ThirdPartyMemberCard\",\"thirdPartyMemberSchemeId\":\"OrangeWednesday\",\"label\":\"Meerkat Movies Code\",\"icon\":\"meerkat-code\",\"codeFormat\":{\"prefixLength\":0,\"partialFormat\":\"^\\\\d{0,8}$\",\"fullFormat\":\"^\\\\d{7,8}$\"}},{\"id\":\"cea\",\"category\":\"ThirdPartyMemberCard\",\"thirdPartyMemberSchemeId\":\"CEA\",\"label\":\"CEA\",\"icon\":\"cea-card\",\"codeFormat\":{\"prefixLength\":0,\"partialFormat\":\"^\\\\d{0,9}$\",\"fullFormat\":\"^\\\\d{7,9}$\"}},{\"id\":\"voucher\",\"category\":\"Voucher\",\"label\":\"Voucher\",\"pin\":\"None\",\"icon\":\"voucher\"}]},\"browsing\":{\"maximumSelectedSites\":5},\"localisation\":{\"nowShowingFilmsLabel\":\"Now showing\",\"comingSoonFilmsLabel\":\"Coming soon\",\"componentErrorTitle\":\"Whoops, something has gone wrong\",\"componentErrorIcon\":\"something-went-wrong-error-odeon\",\"filmRuntimeFormat\":\"${hours}h ${minutes}m\",\"currency\":{\"symbol\":\"£\",\"decimalSeparator\":\".\",\"decimalPrecision\":2,\"thousandsSeparator\":\",\",\"format\":{\"pos\":\"%s%v\",\"neg\":\"%s-%v\",\"zero\":\"%s%v\"}}},\"watchlist\":{\"enabled\":false},\"enablePropertyValidation\":true,\"memberForm\":{\"validation\":{\"givenName\":{\"required\":true,\"type\":\"Text\"},\"familyName\":{\"required\":true,\"type\":\"Text\"},\"email\":{\"type\":\"Email\",\"required\":true},\"mobileNumber\":{\"required\":false,\"type\":\"Text\"},\"homeNumber\":{\"required\":false,\"type\":\"Text\"},\"dateOfBirth\":{\"type\":\"Date\",\"required\":false},\"gender\":{\"type\":\"Other\",\"required\":false},\"nationalId\":{\"required\":false,\"type\":\"Text\"},\"externalId\":{\"required\":false,\"type\":\"Text\"},\"address\":{\"required\":false,\"type\":\"Text\"},\"suburb\":{\"required\":false,\"type\":\"Text\"},\"city\":{\"required\":false,\"type\":\"Text\"},\"state\":{\"required\":false,\"type\":\"Text\"},\"postCode\":{\"required\":false,\"type\":\"Text\"},\"primarySite\":{\"type\":\"Other\",\"required\":false},\"favouriteGenres\":{\"type\":\"Other\",\"required\":false},\"newsletter\":{\"type\":\"Other\",\"required\":false},\"termsAndConditions\":{\"type\":\"Other\",\"required\":true},\"captcha\":{\"type\":\"Other\",\"required\":false},\"password\":{\"required\":true,\"type\":\"Password\",\"maxLength\":64,\"rules\":[{\"displayText\":\"One uppercase letter required\",\"regExpression\":\"([A-Z])\"},{\"displayText\":\"One lowercase letter required\",\"regExpression\":\"([a-z])\"},{\"displayText\":\"One number required\",\"regExpression\":\"([0-9])\"},{\"displayText\":\"At least 8 characters required\",\"regExpression\":\".{8,}\"},{\"displayText\":\"At least 1 special character required\",\"regExpression\":\"([#?!@$%^&*-])\"}]}}}}, {\"currentBuildVersion\":\"1.8.0+3408\",\"isoCurrencyCode\":\"GBP\",\"showFB\":true,\"distanceUnits\":\"miles\",\"mapDistanceThresholdRadius\":30}, [{\"componentType\":\"VersionInfo\",\"props\":{\"config\":{\"display\":false},\"displayText\":{\"vistaDigitalWebsiteBuildNumber\":\"1.8.0+3408\",\"vistaDigitalEnvironment\":\"[NOT_SET]\",\"vistaConnectVersion\":\"5.0 Release 8 Preview 9\",\"vistaOCCVersion\":\"4.29.0\"}},\"id\":\"8480423e-d745-48a9-86d1-ab0672446b0b\",\"lazyLoad\":false}], null);";
      let error = new Error();
      try {
        BearerTokenHelper.getJwtFromLine(line);
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe("Unable to find JWT in line");
    });
  });
});
