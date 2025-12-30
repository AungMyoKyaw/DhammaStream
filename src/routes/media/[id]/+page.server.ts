import { error } from '@sveltejs/kit';
import { getMediaById, getRelatedMedia, getTeacherById } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const prerender = false;

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
