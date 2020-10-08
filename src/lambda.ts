import {CinemaInfoService} from "./service/CinemaInfoService";
import {DynamoDBHelper} from "./lib/DynamoDBHelper";
import {FilmRecord} from "./domain/FilmRecord";

export const handler = async ()
    : Promise<string> => {
  const cis = new CinemaInfoService();
  const dbh = new DynamoDBHelper("bfi-film-showings");
  const upcomingFilms = await cis.getNextShowingByFilmForCinema(150, new Date(), 2);
  for (const [filmId, showing] of upcomingFilms) {
    const persistedFilm = await dbh.getRecordById<FilmRecord>(filmId);
    // If not previously seen, then do things
    if (!persistedFilm) {
      await dbh.putRecord<FilmRecord>(showing.toRecord());
    }
  }
  return "Hello World";
};
