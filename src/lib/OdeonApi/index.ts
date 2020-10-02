import {BearerTokenHelper} from "./BearerTokenHelper";
import axios, {AxiosRequestConfig} from "axios";
import * as odeonConfig from "./config.json";

export class OdeonApi {
  token: string | null = null;
  constructor() {
  }

  private async makeApiCall(url :string, config?: AxiosRequestConfig) {
    if (!this.token) {
      this.token = await BearerTokenHelper.getAuthJwt();
    }
    return await axios.get(url, {
      ...config,
      headers: {
        ...odeonConfig.headers,
        "Authorization": `Bearer ${this.token}`
      }
    });
  }

  async getAllFilmsForCinema(siteId: number) {
    // TODO: Need to add types for response to this call.
    const response = await this.makeApiCall(`https://vwc.odeon.co.uk/WSVistaWebClient/ocapi/v1/browsing/master-data/films?siteIds=${siteId}`);
    return response.data;
  };
}
