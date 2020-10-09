import {IRecord} from "./IRecord";

export class FilmRecord implements IRecord {
  id: string;
  title: string;
  earliestShowing: number;
  constructor(id: string, title: string, earliestShowing: number) {
    this.id = id;
    this.title = title;
    this.earliestShowing = earliestShowing;
  }
}
