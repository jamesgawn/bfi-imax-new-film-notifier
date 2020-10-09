import {CinemaInfoService} from "./service/CinemaInfoService";
import {DynamoDBHelper} from "./lib/DynamoDBHelper";
import {FilmRecord} from "./domain/FilmRecord";
import Twitter from "twitter-lite";
import {FriendlyError} from "./lib/FriendlyError";
import {LoggerHelper} from "./lib/LoggerHelper";

export const handler = async ()
    : Promise<void> => {
  const log = new LoggerHelper("lambda.handler");
  const cis = new CinemaInfoService();
  const dbh = new DynamoDBHelper("bfi-film-showings");
  if (!process.env.twitter_consumer_key || !process.env.twitter_consumer_secret || !process.env.twitter_access_token_key || !process.env.twitter_access_token_secret) {
    log.error("Twitter credentials not set in env vars, unable to proceed.");
    throw new FriendlyError("Twitter credentials not set in env vars, unable to proceed.");
  }
  const twitter = new Twitter({
    consumer_key: process.env.twitter_consumer_key,
    consumer_secret: process.env.twitter_consumer_secret,
    access_token_key: process.env.twitter_access_token_key,
    access_token_secret: process.env.twitter_access_token_secret
  });
  let lookForwardDays = 2;
  if (process.env.film_look_forward_days) {
    lookForwardDays = Number.parseInt(process.env.film_look_forward_days);
  }
  const upcomingFilms = await cis.getNextShowingByFilmForCinema(150, new Date(), lookForwardDays);
  for (const [filmId, showing] of upcomingFilms) {
    const persistedFilm = await dbh.getRecordById<FilmRecord>(filmId);
    // If not previously seen, then do things
    if (!persistedFilm) {
      // Store the film has been identified
      await dbh.putRecord<FilmRecord>(showing.toRecord());
      // Tweet to let people know it's available for booking
      // eslint-disable-next-line max-len
      const newFilmTweet = `${showing.film.title.text} is now available for booking! For more details go to https://beta.odeon.co.uk/films/film/${showing.film.id}/?cinema=150`;
      if (process.env.twitter_enabled == "true") {
        log.info("Tweeting new film alert", {
          tweet: newFilmTweet
        });
        await twitter.post("statuses/update", {
          status: newFilmTweet
        });
      } else {
        log.info("Not tweeted, but here's the message.", {
          tweet: newFilmTweet
        });
      }
    }
  }
};
