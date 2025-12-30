import { getAllMedia, getStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const type = url.searchParams.get('type') || undefined;
	const language = url.searchParams.get('language') || undefined;
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = 24;
	const offset = (page - 1) * limit;

	const { items: media, total } = getAllMedia({
		limit,
		offset,
		type,
		language
	});

	const stats = getStats();
	const totalPages = Math.ceil(total / limit);

	return {
		media,
		total,
		page,
		totalPages,
		stats,
		filters: {
			type,
			language
		}
	};
};
