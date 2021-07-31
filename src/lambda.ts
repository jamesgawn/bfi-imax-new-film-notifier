import {NewFilmNotifier} from "@jamesgawn/new-film-notifier";
import bunyan from "bunyan";
import {APIGatewayProxyHandlerV2} from "aws-lambda";

export const handler : APIGatewayProxyHandlerV2<void> = async () => {
  await execute();
};

export const execute = async () => {
  const log = bunyan.createLogger({
    name: "bfi-imax-new-film-notifier-lambda",
    child: "lambda",
    src: true
  });
  if (!process.env.twitter_consumer_key || !process.env.twitter_consumer_secret || !process.env.twitter_access_token_key || !process.env.twitter_access_token_secret) {
    log.error("Twitter credentials not set in env vars, unable to proceed.");
    throw new Error("Twitter credentials not set in env vars.");
  }
  if (!process.env.dynamodb_table_name) {
    log.error("DynamoDB Table not set in env vars, unable to proceed.");
    throw new Error("DynamoDB Table not set in env vars.");
  }
  let lookForwardDays = 2;
  if (process.env.film_look_forward_days) {
    lookForwardDays = Number.parseInt(process.env.film_look_forward_days);
  }
  let dryRun = false;
  if (process.env.dry_run) {
    if (process.env.dry_run == "true") {
      dryRun = true;
    }
  }
  const nfn = new NewFilmNotifier("bfi-film-showings",
      process.env.twitter_consumer_key,
      process.env.twitter_consumer_secret,
      process.env.twitter_access_token_key,
      process.env.twitter_access_token_secret);
  await nfn.check(150, lookForwardDays, dryRun);
};
