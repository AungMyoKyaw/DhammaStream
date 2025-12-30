import { error } from '@sveltejs/kit';
import { getMediaById, getRelatedMedia, getAllMediaIds, getTeacherById } from '$lib/server/db';
import type { PageServerLoad, EntryGenerator } from './$types';

export const entries: EntryGenerator = async () => {
	const ids = getAllMediaIds();
	return ids.map((id) => ({ id: String(id) }));
};

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id, 10);

	if (isNaN(id)) {
		error(404, 'Media not found');
	}

	const media = getMediaById(id);

	if (!media) {
		error(404, 'Media not found');
	}

	const relatedMedia = getRelatedMedia(id, 6);
	const teacher = media.teacher_id ? getTeacherById(media.teacher_id) : null;

	return {
		media,
		relatedMedia,
		teacher
	};
};
