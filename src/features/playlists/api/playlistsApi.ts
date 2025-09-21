import { baseApi } from '@/app/api/baseApi';
import { imagesSchema } from '@/common/schemas';
import type { Images } from '@/common/types';
import { withZodCatch } from '@/common/utils';
import { playlistCreateResponseSchema, playlistsResponseSchema } from '../model/playlists.schemas';
import type { CreatePlaylistArgs, FetchPlaylistsArgs, PlaylistCreatedEvent, PlaylistUpdatedEvent, UpdatePlaylistArgs } from './playlistsApi.types';
import { SOCKET_EVENTS } from '@/common/constants';
import { subscribeToEvent } from '@/common/socket';

export const playlistsApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		// `query` по умолчанию создает запрос `get` и указание метода необязательно
		//типизация 1й аргумент - что возвращает запрос, 2й аргумент - тип аргумента
		fetchPlaylists: build.query({
			query: (params: FetchPlaylistsArgs) => ({ url: `playlists`, params }),
			...withZodCatch(playlistsResponseSchema),
			keepUnusedDataFor: 0, // 👈 очистка сразу после размонтирования
			async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
				// Ждем разрешения начального запроса перед продолжением
				await cacheDataLoaded;

				const unsubscribes = [
					subscribeToEvent<PlaylistCreatedEvent>(SOCKET_EVENTS.PLAYLIST_CREATED, (msg) => {
						const newPlaylist = msg.payload.data;
						updateCachedData((state) => {
							state.data.pop();
							state.data.unshift(newPlaylist);
							state.meta.totalCount = state.meta.totalCount + 1;
							state.meta.pagesCount = Math.ceil(state.meta.totalCount / state.meta.pageSize);
						});
					}),
					subscribeToEvent<PlaylistUpdatedEvent>(SOCKET_EVENTS.PLAYLIST_UPDATED, (msg) => {
						const newPlaylist = msg.payload.data;
						updateCachedData((state) => {
							const index = state.data.findIndex((playlist) => playlist.id === newPlaylist.id);
							if (index !== -1) {
								state.data[index] = { ...state.data[index], ...newPlaylist };
							}
						});
					})
				];

				// CacheEntryRemoved разрешится, когда подписка на кеш больше не активна
				await cacheEntryRemoved;
				unsubscribes.forEach((unsubscribe) => unsubscribe());
			},
			providesTags: ['Playlist']
		}),
		createPlaylist: build.mutation({
			query: (body: CreatePlaylistArgs) => ({ method: 'post', url: 'playlists', body }),
			...withZodCatch(playlistCreateResponseSchema),
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
			...withZodCatch(imagesSchema),
			invalidatesTags: ['Playlist']
		}),
		deletePlaylistCover: build.mutation<void, { playlistId: string }>({
			query: ({ playlistId }) => ({ url: `playlists/${playlistId}/images/main`, method: 'delete' }),
			invalidatesTags: ['Playlist']
		})
	})
});

export const { useFetchPlaylistsQuery, useCreatePlaylistMutation, useDeletePlaylistMutation, useUpdatePlaylistMutation, useUploadPlaylistCoverMutation, useDeletePlaylistCoverMutation } = playlistsApi;
