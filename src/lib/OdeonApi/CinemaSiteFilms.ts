type FilmSummary = {
  id: string,
  title: {
    text: string
  },
  synopsis: {
    text: string
  },
  shortSynopsis: {
    text: string
  },
  releaseDate: string,
  runtimeInMinutes: number,
  trailerUrl: string
  categories: string[],
  externalIds: {
    moviexchangeReleaseId: string,
    corporateId: string
  }
  distributorName: string
};

export type CinemaSiteFilms = {
  films: FilmSummary[]
};
