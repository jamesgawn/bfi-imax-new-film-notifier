import {BearerTokenHelper} from "./BearerTokenHelper";
import axios, {AxiosRequestConfig} from "axios";
import {FriendlyError} from "../FriendlyError";
import {format} from "date-fns";
import {Films, Showtimes} from "./odeonTypes";
import {Base} from "../Base";

export class OdeonApi extends Base {
  token: string | null = null;
  static userAgent = "BFI IMAX New Film Notifier";
  constructor() {
    super();
  }

  private async makeApiCall<T>(url :string, config?: AxiosRequestConfig) {
    if (!this.token) {
      this.token = await BearerTokenHelper.getAuthJwt();
    }
    this.log.info(`Making API Call to ${url}`);
    const result = await axios.get<T>(url, {
      ...config,
      headers: {
        "User-Agent": OdeonApi.userAgent,
        "Authorization": `Bearer ${this.token}`
      }
    });
    this.log.info(`Made API Call to ${url}`);
    return result;
  }

  async getAllFilmsForCinema(siteId: number) {
    try {
      this.log.info(`Getting all films for cinema site ${siteId}`);
      const response = await this.makeApiCall<Films>(`https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/films?siteIds=${siteId}`);
      const data = response.data;
      this.log.info(`Got all films for cinema site ${siteId}`);
      return data;
    } catch (err) {
      this.log.error(`Failed to get all films for cinema site ${siteId}`, err);
      throw new FriendlyError(`Unable to retrieve films for cinema site ${siteId}`, err);
    }
  };

  async getShowtimesForCinema(siteId: number, date: Date) {
    const convertedDate = format(date, "yyyy-MM-dd");
    try {
      this.log.info(`Getting all showtimes for cinema site ${siteId} on ${convertedDate}`);
      const response = await this.makeApiCall<Showtimes>(
          `https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/showtimes/business-date/${convertedDate}?siteIds=${siteId}`);
      const data = response.data;
      this.log.info(`Got all showtimes for cinema site ${siteId} on ${convertedDate}`);
      return data;
    } catch (err) {
      this.log.error(`Failed to get all showtimes for cinema site ${siteId} on ${convertedDate}`, err);
      throw new FriendlyError(`Unable to retrieve showtimes on ${convertedDate} for cinema site ${siteId}`, err);
    }
  }
}
