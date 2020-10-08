import {CinemaInfoService} from "./service/CinemaInfoService";

export const handler = async ()
    : Promise<string> => {
  new CinemaInfoService();
  return "Hello World";
};
