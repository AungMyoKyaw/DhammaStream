import { getAllMedia, getStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

// Enable prerendering for static export
export const prerender = true;

export const load: PageServerLoad = async () => {
	// Load ALL media for client-side filtering (no pagination on static site)
	const { items: media, total } = getAllMedia({
		limit: 999999 // Get all records
	});

	const stats = getStats();

	return {
		media,
		total,
		stats
	};
};
