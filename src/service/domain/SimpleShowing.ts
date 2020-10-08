import {Film, Showtime} from "../../lib/OdeonApi/odeonTypes";
import {parse} from "date-fns";
import {FriendlyError} from "../../lib/FriendlyError";
import {FilmRecord} from "../../domain/FilmRecord";

export class SimpleShowing {
  id: string;
  film: Film;
  date: Date;
  constructor(id: string, film: Film, date: Date) {
    this.id = id;
    this.film = film;
    this.date = date;
  }

  static fromDto(showtime: Showtime, films: Film[]) {
    const date = parse(showtime.schedule.businessDate, "yyyy-MM-dd", new Date());
    const film = films.find((film) => film.id == showtime.filmId);
    if (!film) throw new FriendlyError(`Unable to find matching film name for ${showtime.filmId} in schedule`);
    return new SimpleShowing(showtime.id, film, date);
  }

  toRecord() : FilmRecord {
    return new FilmRecord(this.id, this.film.title.text, this.date.getTime());
  }
}
