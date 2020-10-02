import {BearerTokenHelper} from "./lib/OdeonApi/BearerTokenHelper";

export const handler = async ()
    : Promise<string> => {
  await BearerTokenHelper.getAuthJwt();
  return "Hello World";
};
