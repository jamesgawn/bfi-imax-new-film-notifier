import axios, {AxiosResponse} from "axios";
import {FriendlyError} from "../FriendlyError";
import {OdeonApi} from "./index";

export class BearerTokenHelper {
  static async getAuthJwt() : Promise<string> {
    const page = await this.getPageContainingAuthJwt();
    const line = this.findLineContainingJwt(page);
    return this.getJwtFromLine(line);
  }

  static async getPageContainingAuthJwt() : Promise<string> {
    // Get the page, if not throw an error
    let response : AxiosResponse<string>;
    try {
      response = await axios.get<string>("https://beta.odeon.co.uk/cinemas/bfi-imax/#", {
        headers: {
          "User-Agent": OdeonApi.userAgent
        }
      });
    } catch (err) {
      throw new FriendlyError("Unable to retrieve page contents from https://beta.odeon.co.uk/cinemas/bfi-imax/#.", err);
    }

    if (response.data) {
      return response.data;
    } else {
      throw new FriendlyError("No page data returned from https://beta.odeon.co.uk/cinemas/bfi-imax/#.");
    }
  }

  static findLineContainingJwt(page : string) : string {
    // Split the data into managable chunks
    const pageSplitByLine = page.split("\r\n");
    // Find the line with the authToken in it
    let lineWithAuth;
    for (const line of pageSplitByLine) {
      if (line.match("authToken")) {
        lineWithAuth = line;
        break;
      }
    }
    if (lineWithAuth) {
      return lineWithAuth;
    } else {
      throw new FriendlyError("Unable to find authToken in page");
    }
  }

  static getJwtFromLine(line : string) : string {
    const match = line.match('"authToken":"([a-zA-Z0-9-_.]+)"},');
    if (match && match[1]) {
      return match[1];
    } else {
      throw new FriendlyError("Unable to find JWT in line");
    }
  }
}
