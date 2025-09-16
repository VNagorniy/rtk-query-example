import { useInfiniteScroll } from '@/common/hooks';
import { useFetchTracksInfiniteQuery } from '../../api/tracksApi';
import { TracksList } from '../TrackList/TracksList';
import { LoadingTrigger } from '../LoadingTrigger/LoadingTrigger';

export const TracksPage = () => {
	const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useFetchTracksInfiniteQuery();

	const pages = data?.pages.flatMap((page) => page.data) || [];

	//Load more
	// const loadMoreHandler = () => {
	// 	if (hasNextPage && !isFetching) {
	// 		fetchNextPage();
	// 	}
	// };

	//Infinity scroll
	const { observerRef } = useInfiniteScroll({ fetchNextPage, hasNextPage, isFetching });

	return (
		<div>
			<h1>Tracks page</h1>
			<TracksList tracks={pages} />

			{hasNextPage && <LoadingTrigger isFetchingNextPage={isFetchingNextPage} observerRef={observerRef} />}

			{!hasNextPage && pages.length > 0 && <p>Nothing more to load</p>}
		</div>
	);
};
