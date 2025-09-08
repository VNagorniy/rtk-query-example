import type { PlaylistData } from '../../api/playlistsApi.types';
import { PlaylistCover } from './PlaylistCover/PlaylistCover';
import { PlaylistDescription } from './PlaylistDescription/PlaylistDescription';

type Props = {
	playlist: PlaylistData;
	deletePlaylist: (playlistId: string) => void;
	editPlaylist: (playlist: PlaylistData) => void;
};

export const PlaylistItem = ({ playlist, editPlaylist, deletePlaylist }: Props) => {
	return (
		<div>
			<PlaylistCover playlistId={playlist.id} images={playlist.attributes.images} />
			<PlaylistDescription attributes={playlist.attributes} />
			<button onClick={() => deletePlaylist(playlist.id)}>delete</button>
			<button onClick={() => editPlaylist(playlist)}>update</button>
		</div>
	);
};
