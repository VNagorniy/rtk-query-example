import { baseApi } from '@/app/api/baseApi';
import type { FetchTracksResponse } from './tracksApi.types';
import { withZodCatch } from '@/common/utils';
import { fetchTracksResponseSchema } from '../model/tracks.schemas';

export const tracksApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		fetchTracks: build.infiniteQuery<FetchTracksResponse, void, string | null>({
			infiniteQueryOptions: {
				initialPageParam: null,
				getNextPageParam: (lastPage) => {
					return lastPage.meta.nextCursor || null;
				}
			},
			query: ({ pageParam }) => {
				return {
					url: 'playlists/tracks',
					params: { cursor: pageParam, pageSize: 5, paginationType: 'cursor' }
				};
			},
			...withZodCatch(fetchTracksResponseSchema)
		})
	})
});
export const { useFetchTracksInfiniteQuery } = tracksApi;
