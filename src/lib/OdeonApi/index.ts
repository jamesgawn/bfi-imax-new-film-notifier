import {BearerTokenHelper} from "./BearerTokenHelper";
import axios, {AxiosRequestConfig} from "axios";
import {FriendlyError} from "../FriendlyError";
import {format} from "date-fns";
import {Films, Showtimes} from "./odeonTypes";

export class OdeonApi {
  token: string | null = null;
  static userAgent = "BFI IMAX New Film Notifier";
  constructor() {
  }

  private async makeApiCall<T>(url :string, config?: AxiosRequestConfig) {
    if (!this.token) {
      this.token = await BearerTokenHelper.getAuthJwt();
    }
    return await axios.get<T>(url, {
      ...config,
      headers: {
        "User-Agent": OdeonApi.userAgent,
        "Authorization": `Bearer ${this.token}`
      }
    });
  }

  async getAllFilmsForCinema(siteId: number) {
    try {
      const response = await this.makeApiCall<Films>(`https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/films?siteIds=${siteId}`);
      return response.data;
    } catch (err) {
      throw new FriendlyError(`Unable to retrieve films for cinema site ${siteId}`, err);
    }
  };

  async getShowtimesForCinema(siteId: number, date: Date) {
    const convertedDate = format(date, "yyyy-MM-dd");
    try {
      const response = await this.makeApiCall<Showtimes>(
          `https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/showtimes/business-date/${convertedDate}?siteIds=${siteId}`);
      return response.data;
    } catch (err) {
      throw new FriendlyError(`Unable to retrieve showtimes on ${convertedDate} for cinema site ${siteId}`, err);
    }
  }
}
