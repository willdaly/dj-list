import { z } from 'zod';

export const songSchema = z.object({
  _id: z.string(),
  Artist: z.string(),
  Album: z.string().default(''),
  Song: z.string(),
  BPM: z.number(),
  Key: z.string(),
  genre: z.string(),
  order: z.number().optional()
});

export const playlistSchema = z.object({
  _id: z.string(),
  name: z.string(),
  userId: z.string(),
  songs: z.array(songSchema)
});

export const songsResponseSchema = z.object({
  songs: z.array(songSchema)
});

export const songResponseSchema = z.object({
  song: songSchema
});

export const playlistsResponseSchema = z.object({
  playlists: z.array(playlistSchema)
});

export const playlistResponseSchema = z.object({
  playlist: playlistSchema.nullable()
});

export const artistSuggestionsResponseSchema = z.object({
  artists: z.array(z.string())
});
