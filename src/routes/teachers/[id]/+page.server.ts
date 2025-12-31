import { error } from '@sveltejs/kit';
import { getTeacherById, getMediaByTeacherId, getAllTeacherIds } from '$lib/server/db';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return getAllTeacherIds().map((id) => ({ id: id.toString() }));
};

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id, 10);

	if (isNaN(id)) {
		error(404, 'Teacher not found');
	}

	const teacher = getTeacherById(id);

	if (!teacher) {
		error(404, 'Teacher not found');
	}

	const media = getMediaByTeacherId(id);

	// Group media by type
	const audioMedia = media.filter((m) => m.type === 'audio');
	const videoMedia = media.filter((m) => m.type === 'video');
	const ebookMedia = media.filter((m) => m.type === 'ebook');

	return {
		teacher,
		media,
		audioMedia,
		videoMedia,
		ebookMedia
	};
};
