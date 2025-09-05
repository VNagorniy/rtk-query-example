import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CreatePlaylistArgs, FetchPlaylistsArgs, PlaylistData, PlaylistsResponse, UpdatePlaylistArgs } from './playlistsApi.types';

export const playlistsApi = createApi({
	reducerPath: 'playlistsApi',
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_BASE_URL,
		headers: {
			'API-KEY': import.meta.env.VITE_API_KEY
		},
		prepareHeaders: (headers) => {
			headers.set('Authorization', `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`);
			return headers;
		}
	}),
	tagTypes: ['Playlist'],
	endpoints: (build) => ({
		// `query` по умолчанию создает запрос `get` и указание метода необязательно
		//типизация 1й аргумент - что возвращает запрос, 2й аргумент - тип аргумента
		fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
			query: () => `playlists`,
			providesTags: ['Playlist']
		}),
		createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
			query: (body) => ({ method: 'post', url: 'playlists', body }),
			invalidatesTags: ['Playlist']
		}),
		deletePlaylist: build.mutation<void, string>({
			query: (playlistId) => ({
				url: `playlists/${playlistId}`,
				method: 'delete'
			}),
			invalidatesTags: ['Playlist']
		}),
		updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
			query: ({ playlistId, body }) => ({
				url: `playlists/${playlistId}`,
				method: 'put',
				body
			}),
			invalidatesTags: ['Playlist']
		})
	})
});

export const { useFetchPlaylistsQuery, useCreatePlaylistMutation, useDeletePlaylistMutation, useUpdatePlaylistMutation } = playlistsApi;
