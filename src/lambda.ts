import {CinemaInfoService} from "./service/CinemaInfoService";
import {DynamoDBHelper} from "./lib/DynamoDBHelper";
import {FilmRecord} from "./domain/FilmRecord";
import Twitter from "twitter-lite";
import {FriendlyError} from "./lib/FriendlyError";

export const handler = async ()
    : Promise<void> => {
  const cis = new CinemaInfoService();
  const dbh = new DynamoDBHelper("bfi-film-showings");
  if (!process.env.twitter_consumer_key || !process.env.twitter_consumer_secret || !process.env.twitter_access_token_key || !process.env.twitter_access_token_secret) {
    throw new FriendlyError("Twitter credentials unavailable, unable to proceed.");
  }
  const twitter = new Twitter({
    consumer_key: process.env.twitter_consumer_key,
    consumer_secret: process.env.twitter_consumer_secret,
    access_token_key: process.env.twitter_access_token_key,
    access_token_secret: process.env.twitter_access_token_secret
  });
  const upcomingFilms = await cis.getNextShowingByFilmForCinema(150, new Date(), 2);
  for (const [filmId, showing] of upcomingFilms) {
    const persistedFilm = await dbh.getRecordById<FilmRecord>(filmId);
    // If not previously seen, then do things
    if (!persistedFilm) {
      // Store the film has been identified
      await dbh.putRecord<FilmRecord>(showing.toRecord());
      // Tweet to let people know it's available for booking
      if (process.env.twitter_enabled == "true") {
        await twitter.post("statuses/update", {
          status: `${showing.film.title.text} is now available for booking! For more details go to https://beta.odeon.co.uk/films/film/${showing.film.id}/?cinema=150`
        });
      } else {
        console.log("Not tweeted, but here's the message.");
        console.log(`${showing.film.title.text} is now available for booking! For more details go to https://beta.odeon.co.uk/films/film/${showing.film.id}/?cinema=150`);
      }
    }
  }
};
