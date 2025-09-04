import type { SubmitHandler, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import type { UpdatePlaylistArgs } from '../../api/playlistsApi.types';
import { useUpdatePlaylistMutation } from '../../api/playlistsApi';

type Props = {
	playlistId: string;
	register: UseFormRegister<UpdatePlaylistArgs>;
	handleSubmit: UseFormHandleSubmit<UpdatePlaylistArgs>;
	editPlaylist: (playlist: null) => void;
	setPlaylistId: (playlistId: null) => void;
};

export const EditPlaylistForm = ({ playlistId, handleSubmit, register, editPlaylist, setPlaylistId }: Props) => {
	const [updatePlaylist] = useUpdatePlaylistMutation();

	const onSubmit: SubmitHandler<UpdatePlaylistArgs> = (data) => {
		if (!playlistId) return;
		updatePlaylist({ playlistId, body: data }).then(() => {
			setPlaylistId(null);
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h2>Edit playlist</h2>
			<div>
				<input {...register('title')} placeholder={'title'} />
			</div>
			<div>
				<input {...register('description')} placeholder={'description'} />
			</div>
			<button type={'submit'}>save</button>
			<button type={'button'} onClick={() => editPlaylist(null)}>
				cancel
			</button>
		</form>
	);
};
