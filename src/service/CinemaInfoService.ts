import {add, eachDayOfInterval} from "date-fns";
import {OdeonApi} from "../lib/OdeonApi";
import {SimpleShowing} from "./domain/SimpleShowing";

export class CinemaInfoService {
  api: OdeonApi;
  constructor() {
    this.api = new OdeonApi();
  }

  async getNextShowingByFilmForCinema(siteId: number, startDate: Date, lookForwardDays: number) {
    const dates = eachDayOfInterval({start: startDate, end: add(startDate, {days: lookForwardDays})});
    const data = await Promise.all(dates.map((date) => this.api.getShowtimesForCinema(siteId, date)));
    return data.reduce<Map<string, SimpleShowing>>((nextShowings, currentShowtimes) => {
      const showings = currentShowtimes.showtimes.map((showtime) => SimpleShowing.fromDto(showtime, currentShowtimes.relatedData.films));
      for (const showing of showings) {
        const existingShowing = nextShowings.get(showing.film.id);
        if (!existingShowing || (existingShowing && showing.date < existingShowing.date)) {
          nextShowings.set(showing.film.id, showing);
        }
      }
      return nextShowings;
    }, new Map<string, SimpleShowing>());
  }
}


