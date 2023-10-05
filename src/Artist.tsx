interface Image {
    url: string;
  }

export interface Artist {
    id: string;
    name: string;
    images: Image[];
    genres: string[];
    popularity: number;
    followers: {
      total: number;
    };
  }