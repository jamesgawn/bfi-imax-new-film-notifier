export type Showtime = {
  id: string,
  schedule: {
    businessDate: string
  }
  filmId: string,
  requires3dGlasses: boolean
}

export type Film = {
  id: string,
  title: {
    text: string
  },
  synopsis: {
    text: string
  }
  externalIds: {
    moviexchangeReleaseId: string
  }
};
export type Showtimes = {
  showtimes: Showtime[],
  relatedData: {
    films: Film[]
  }
}
export type Films = {
  films: Film[]
};
