import {OdeonBearerTokenHelper} from "./lib/OdeonApi/OdeonBearerTokenHelper";

export const handler = async ()
    : Promise<string> => {
  await OdeonBearerTokenHelper.getAuthJwt();
  return "Hello World";
};
