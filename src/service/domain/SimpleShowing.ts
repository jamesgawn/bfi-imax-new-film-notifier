import {Film, Showtime} from "../../lib/OdeonApi/odeonTypes";
import {parse} from "date-fns";
import {FriendlyError} from "../../lib/FriendlyError";

export class SimpleShowing {
  id: string;
  filmId: string;
  filmName: string;
  date: Date;
  constructor(id: string, filmId: string, filmName: string, date: Date) {
    this.id = id;
    this.filmId = filmId;
    this.filmName = filmName;
    this.date = date;
  }

  static adaptFromDto(showtime: Showtime, films: Film[]) {
    const date = parse(showtime.schedule.businessDate, "yyyy-MM-dd", new Date());
    const film = films.find((film) => film.id == showtime.filmId);
    if (!film) throw new FriendlyError(`Unable to find matching film name for ${showtime.filmId} in schedule`);
    return new SimpleShowing(showtime.id, showtime.filmId, film.title.text, date);
  }
}
