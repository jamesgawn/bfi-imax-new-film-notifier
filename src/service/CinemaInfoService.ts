import {add, eachDayOfInterval} from "date-fns";
import {OdeonApi} from "../lib/OdeonApi";
import {SimpleShowing} from "./domain/SimpleShowing";
import {Base} from "../lib/Base";

export class CinemaInfoService extends Base {
  api: OdeonApi;
  constructor() {
    super();
    this.api = new OdeonApi();
  }

  async getNextShowingByFilmForCinema(siteId: number, startDate: Date, lookForwardDays: number) {
    const dates = eachDayOfInterval({start: startDate, end: add(startDate, {days: lookForwardDays})});
    this.log.info(`Obtaining showtimes for cinema ${siteId} for the next ${lookForwardDays} days`, {
      dataInterval: dates
    });
    const data = await Promise.all(dates.map((date) => this.api.getShowtimesForCinema(siteId, date)));
    this.log.info(`Obtained showtimes for cinema ${siteId} for the next ${lookForwardDays} days`);
    const newOrUpdatedShowings = data.reduce<Map<string, SimpleShowing>>((nextShowings, currentShowtimes) => {
      const showings = currentShowtimes.showtimes.map((showtime) => SimpleShowing.fromDto(showtime, currentShowtimes.relatedData.films));
      for (const showing of showings) {
        this.log.info(`Finding existing showing ${showing.film.id}`);
        const existingShowing = nextShowings.get(showing.film.id);
        if (!existingShowing) {
          this.log.info(`Adding new film ${showing.film.id}`);
          nextShowings.set(showing.film.id, showing);
        }
        if (existingShowing && showing.date < existingShowing.date) {
          this.log.info(`Adding film ${showing.film.id} with earlier showing`);
          nextShowings.set(showing.film.id, showing);
        }
      }
      return nextShowings;
    }, new Map<string, SimpleShowing>());
    this.log.info("Returning new or earlier showings for films");
    return newOrUpdatedShowings;
  }
}


