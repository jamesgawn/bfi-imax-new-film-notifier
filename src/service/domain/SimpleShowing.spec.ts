import {parse} from "date-fns";
import {SimpleShowing} from "./SimpleShowing";
import {Film, Showtime} from "../../lib/OdeonApi/odeonTypes";
import {FriendlyError} from "../../lib/FriendlyError";
// import {FriendlyError} from "../../lib/FriendlyError";

describe("SimpleShowing", () => {
  let testShowtime: Showtime;
  let testFilms: Film[];
  beforeEach(() => {
    testShowtime = {
      id: "123",
      filmId: "randomFilmId",
      schedule: {
        businessDate: "2019-01-01"
      },
      requires3dGlasses: false
    } as Showtime;
    testFilms = [
      {
        id: "randomFilmId",
        title: {
          text: "random film name"
        }
      }] as Film[];
  });
  describe("adaptFromDto", () => {
    test("should create object from Showtimes object", () => {
      const showing = SimpleShowing.adaptFromDto(testShowtime, testFilms);
      expect(showing.id).toBe(testShowtime.id);
      expect(showing.filmId).toBe(testShowtime.filmId);
      expect(showing.filmName).toBe(testFilms[0].title.text);
      expect(showing.date).toStrictEqual(parse(testShowtime.schedule.businessDate, "yyyy-MM-dd", new Date()));
    });
    test("should throw error if unable to find film name for film in Showtimes object", () => {
      let error: FriendlyError = new FriendlyError("");
      try {
        SimpleShowing.adaptFromDto(testShowtime, []);
      } catch (err) {
        error = err;
      }
      expect(error.message).toBe("Unable to find matching film name for randomFilmId in schedule");
    });
  });
});
