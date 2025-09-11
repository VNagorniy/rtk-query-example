import { baseApi } from '@/app/api/baseApi';
import type { FetchTracksResponse } from './tracksApi.types';

export const tracksApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		fetchTracks: build.infiniteQuery<FetchTracksResponse, void, string | undefined>({
			infiniteQueryOptions: {
				initialPageParam: undefined,
				getNextPageParam: (lastPage) => {
					return lastPage.meta.nextCursor || undefined;
				}
			},
			query: ({ pageParam }) => {
				return {
					url: 'playlists/tracks',
					params: { cursor: pageParam, pageSize: 5, paginationType: 'cursor' }
				};
			}
		})
	})
});
export const { useFetchTracksInfiniteQuery } = tracksApi;
