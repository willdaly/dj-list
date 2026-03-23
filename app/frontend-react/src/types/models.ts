export interface Song {
  _id: string;
  Artist: string;
  Album: string;
  Song: string;
  BPM: number;
  Key: string;
  genre: string;
  order?: number;
  previewUrl?: string | null;
  camelotCode?: string;
  harmonicCodes?: string[];
  energyTier?: string;
  setCategory?: string;
  similarSongIds?: string[];
}

export interface Playlist {
  _id: string;
  name: string;
  userId: string;
  songs: Song[];
}

export interface User {
  _id: string;
  spotifyId: string | null;
  email: string | null;
  displayName: string | null;
  isValid: boolean;
}

export interface SessionState {
  authenticated: boolean;
  user: User | null;
}
