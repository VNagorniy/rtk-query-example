import type { SocketEvents } from '@/common/constants';
import { getSocket } from './getSocket.ts';
import type { Socket } from 'socket.io-client';

type Callback<T> = (data: T) => void;

export const subscribeToEvent = <T>(event: SocketEvents, callback: Callback<T>) => {
	const socket: Socket = getSocket();
	socket.on(event, callback);

	return () => {
		socket.off(event, callback);
	};
};
