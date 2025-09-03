import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchPlaylistsArgs, PlaylistsResponse } from './playlistsApi.types';

export const playlistsApi = createApi({
	reducerPath: 'playlistsApi',
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_BASE_URL,
		headers: {
			'API-KEY': import.meta.env.VITE_API_KEY
		}
	}),
	endpoints: (build) => ({
		// `query` по умолчанию создает запрос `get` и указание метода необязательно
		//типизация 1й аргумент - что возвращает запрос, 2й аргумент - тип аргумента
		fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
			query: () => `playlists`
		})
	})
});

export const { useFetchPlaylistsQuery } = playlistsApi;
