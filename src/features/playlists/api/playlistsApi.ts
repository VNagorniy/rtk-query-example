import { baseApi } from '@/app/api/baseApi';
import type { CreatePlaylistArgs, FetchPlaylistsArgs, PlaylistData, PlaylistsResponse, UpdatePlaylistArgs } from './playlistsApi.types';
import type { Images } from '@/common/types';

export const playlistsApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		// `query` по умолчанию создает запрос `get` и указание метода необязательно
		//типизация 1й аргумент - что возвращает запрос, 2й аргумент - тип аргумента
		fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
			query: (params) => ({ url: `playlists`, params }),
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
			async onQueryStarted({ playlistId, body }, { dispatch, queryFulfilled, getState }) {
				const args = playlistsApi.util.selectCachedArgsForQuery(getState(), 'fetchPlaylists');

				// eslint-disable-next-line
				const patchResults: any[] = [];

				args.forEach((arg) => {
					patchResults.push(
						dispatch(
							playlistsApi.util.updateQueryData(
								// название эндпоинта, в котором нужно обновить кэш
								'fetchPlaylists',
								// аргументы для эндпоинта
								{
									pageNumber: arg.pageNumber,
									pageSize: arg.pageSize,
									search: arg.search
								},
								// `updateRecipe` - коллбэк для обновления закэшированного стейта мутабельным образом
								(state) => {
									const index = state.data.findIndex((playlist) => playlist.id === playlistId);
									if (index !== -1) {
										state.data[index].attributes = { ...state.data[index].attributes, ...body };
									}
								}
							)
						)
					);
				});

				try {
					await queryFulfilled;
				} catch {
					patchResults.forEach((patchResult) => {
						patchResult.undo();
					});
				}
			},
			invalidatesTags: ['Playlist']
		}),
		uploadPlaylistCover: build.mutation<Images, { playlistId: string; file: File }>({
			query: ({ playlistId, file }) => {
				const formData = new FormData();
				formData.append('file', file);
				return {
					url: `playlists/${playlistId}/images/main`,
					method: 'post',
					body: formData
				};
			},
			invalidatesTags: ['Playlist']
		}),
		deletePlaylistCover: build.mutation<void, { playlistId: string }>({
			query: ({ playlistId }) => ({ url: `playlists/${playlistId}/images/main`, method: 'delete' }),
			invalidatesTags: ['Playlist']
		})
	})
});

export const { useFetchPlaylistsQuery, useCreatePlaylistMutation, useDeletePlaylistMutation, useUpdatePlaylistMutation, useUploadPlaylistCoverMutation, useDeletePlaylistCoverMutation } = playlistsApi;
