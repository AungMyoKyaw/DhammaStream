import { error } from '@sveltejs/kit';
import { getMediaById, getRelatedMedia, getTeacherById, getAllMediaIds } from '$lib/server/db';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return getAllMediaIds().map((id) => ({ id: id.toString() }));
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
