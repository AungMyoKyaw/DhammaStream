import { getFeaturedTeachers, getRecentMedia, getStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const stats = getStats();
	const featuredTeachers = getFeaturedTeachers(8);
	const recentMedia = getRecentMedia(12);

	return {
		stats,
		featuredTeachers,
		recentMedia
	};
};
