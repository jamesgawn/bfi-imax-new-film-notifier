import {IRecord} from "./IRecord";

export class FilmRecord implements IRecord {
  id: string;
  name: string;
  earliestShowing: number;
  constructor(id: string, name: string, earliestShowing: number) {
    this.id = id;
    this.name = name;
    this.earliestShowing = earliestShowing;
  }
}
