import { getAllTeachers, getStats } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const teachers = getAllTeachers();
	const stats = getStats();

	return {
		teachers,
		stats
	};
};
