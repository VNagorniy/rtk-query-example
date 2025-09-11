import type { RefObject } from 'react';

type Props = {
	observerRef: RefObject<HTMLDivElement | null>;
	isFetchingNextPage: boolean;
};

export const LoadingTrigger = ({ observerRef, isFetchingNextPage }: Props) => {
	// Этот элемент отслеживается IntersectionObserver
	return (
		<div ref={observerRef}>
			{/*`<div style={{ height: '20px' }} />` создает "невидимую зону" в 20px в конце списка,*/}
			{/*при достижении которой автоматически загружаются новые треки. Без размеров*/}
			{/*IntersectionObserver не будет работать корректно.*/}
			{isFetchingNextPage ? <div>Loading more tracks...</div> : <div style={{ height: '20px' }} />}
		</div>
	);
};
