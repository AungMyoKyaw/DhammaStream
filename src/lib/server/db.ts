import { Database } from 'bun:sqlite';
import path from 'path';

const dbPath = path.resolve('dhamma.db');
const db = new Database(dbPath, { readonly: true });

// Database configuration constants
const DB_CONFIG = {
	// 64MB cache for better performance
	CACHE_SIZE_KB: -64000,
	// 30GB memory-mapped I/O for faster reads
	MMAP_SIZE_BYTES: 30_000_000_000,
	// 30 days retention for resume playback data
	RESUME_DATA_RETENTION_DAYS: 30
} as const;

// Optimize database for concurrent reads and performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec(`PRAGMA cache_size = ${DB_CONFIG.CACHE_SIZE_KB};`);
db.exec('PRAGMA temp_store = MEMORY;');
db.exec(`PRAGMA mmap_size = ${DB_CONFIG.MMAP_SIZE_BYTES};`);

// Export configuration for use in other modules
export { DB_CONFIG };

// Types
export interface Teacher {
	id: number;
	name: string;
	name_myanmar: string | null;
	title: string | null;
	description: string | null;
	page_url: string | null;
	image_url: string | null;
	created_at: string;
	media_count?: number;
}

export interface Media {
	id: number;
	title: string;
	title_myanmar: string | null;
	type: 'audio' | 'video' | 'ebook';
	format: string | null;
	language: string;
	url: string;
	file_size: number | null;
	duration: string | null;
	description: string | null;
	date_recorded: string | null;
	location: string | null;
	teacher_id: number | null;
	category_id: number | null;
	source_page: string | null;
	created_at: string;
	teacher_name?: string;
	teacher_name_myanmar?: string | null;
}

export interface Category {
	id: number;
	name: string;
	type: string;
	language: string;
	source_url: string | null;
	created_at: string;
}

export interface Collection {
	id: number;
	name: string;
	description: string | null;
	teacher_id: number | null;
	type: string | null;
	created_at: string;
}

export interface Stats {
	totalTeachers: number;
	totalMedia: number;
	totalAudio: number;
	totalVideo: number;
	totalEbooks: number;
	totalMyanmarContent: number;
	totalEnglishContent: number;
}

// Get all teachers with media count - Optimized query
export function getAllTeachers(): Teacher[] {
	const stmt = db.prepare(`
		SELECT t.*, COUNT(m.id) as media_count 
		FROM teachers t 
		LEFT JOIN media m ON t.id = m.teacher_id 
		GROUP BY t.id 
		ORDER BY media_count DESC
	`);
	return stmt.all() as Teacher[];
}

// Get teacher by ID
export function getTeacherById(id: number): Teacher | undefined {
	const stmt = db.prepare(`
		SELECT t.*, COUNT(m.id) as media_count 
		FROM teachers t 
		LEFT JOIN media m ON t.id = m.teacher_id 
		WHERE t.id = ?
		GROUP BY t.id
	`);
	return stmt.get(id) as Teacher | undefined;
}

// Get all teacher IDs for pre-rendering
export function getAllTeacherIds(): number[] {
	const stmt = db.prepare('SELECT id FROM teachers');
	return (stmt.all() as { id: number }[]).map((row) => row.id);
}

// Get media by teacher ID
export function getMediaByTeacherId(teacherId: number): Media[] {
	const stmt = db.prepare(`
		SELECT m.*, t.name as teacher_name, t.name_myanmar as teacher_name_myanmar
		FROM media m
		LEFT JOIN teachers t ON m.teacher_id = t.id
		WHERE m.teacher_id = ?
		ORDER BY m.type, m.title
	`);
	return stmt.all(teacherId) as Media[];
}

// Get all media with pagination
export function getAllMedia(options: {
	limit?: number;
	offset?: number;
	type?: string;
	language?: string;
	search?: string;
}): { items: Media[]; total: number } {
	const { limit = 24, offset = 0, type, language, search } = options;

	let whereClause = '1=1';
	const params: (string | number)[] = [];

	if (type) {
		whereClause += ' AND m.type = ?';
		params.push(type);
	}
	if (language) {
		whereClause += ' AND m.language = ?';
		params.push(language);
	}
	if (search) {
		whereClause += ' AND (m.title LIKE ? OR m.title_myanmar LIKE ?)';
		params.push(`%${search}%`, `%${search}%`);
	}

	const countStmt = db.prepare(`SELECT COUNT(*) as count FROM media m WHERE ${whereClause}`);
	const { count: total } = countStmt.get(...params) as { count: number };

	const stmt = db.prepare(`
		SELECT m.*, t.name as teacher_name, t.name_myanmar as teacher_name_myanmar
		FROM media m
		LEFT JOIN teachers t ON m.teacher_id = t.id
		WHERE ${whereClause}
		ORDER BY m.created_at DESC
		LIMIT ? OFFSET ?
	`);

	const items = stmt.all(...params, limit, offset) as Media[];

	return { items, total };
}

// Get media by ID
export function getMediaById(id: number): Media | undefined {
	const stmt = db.prepare(`
		SELECT m.*, t.name as teacher_name, t.name_myanmar as teacher_name_myanmar
		FROM media m
		LEFT JOIN teachers t ON m.teacher_id = t.id
		WHERE m.id = ?
	`);
	return stmt.get(id) as Media | undefined;
}

// Get all media IDs for pre-rendering
export function getAllMediaIds(): number[] {
	const stmt = db.prepare('SELECT id FROM media');
	return (stmt.all() as { id: number }[]).map((row) => row.id);
}

// Get categories
export function getAllCategories(): Category[] {
	const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
	return stmt.all() as Category[];
}

// Get statistics - Optimized to use a single query
export function getStats(): Stats {
	const stmt = db.prepare(`
		SELECT 
			COUNT(DISTINCT t.id) as totalTeachers,
			COUNT(m.id) as totalMedia,
			SUM(CASE WHEN m.type = 'audio' THEN 1 ELSE 0 END) as totalAudio,
			SUM(CASE WHEN m.type = 'video' THEN 1 ELSE 0 END) as totalVideo,
			SUM(CASE WHEN m.type = 'ebook' THEN 1 ELSE 0 END) as totalEbooks,
			SUM(CASE WHEN m.language = 'myanmar' THEN 1 ELSE 0 END) as totalMyanmarContent,
			SUM(CASE WHEN m.language = 'english' THEN 1 ELSE 0 END) as totalEnglishContent
		FROM teachers t
		LEFT JOIN media m ON t.id = m.teacher_id
	`);

	const result = stmt.get() as {
		totalTeachers: number;
		totalMedia: number;
		totalAudio: number;
		totalVideo: number;
		totalEbooks: number;
		totalMyanmarContent: number;
		totalEnglishContent: number;
	};

	return result;
}

// Get featured teachers (top 6 by media count)
export function getFeaturedTeachers(limit = 6): Teacher[] {
	const stmt = db.prepare(`
		SELECT t.*, COUNT(m.id) as media_count 
		FROM teachers t 
		LEFT JOIN media m ON t.id = m.teacher_id 
		GROUP BY t.id 
		HAVING media_count > 0
		ORDER BY media_count DESC
		LIMIT ?
	`);
	return stmt.all(limit) as Teacher[];
}

// Get recent media
export function getRecentMedia(limit = 12): Media[] {
	const stmt = db.prepare(`
		SELECT m.*, t.name as teacher_name, t.name_myanmar as teacher_name_myanmar
		FROM media m
		LEFT JOIN teachers t ON m.teacher_id = t.id
		ORDER BY m.created_at DESC
		LIMIT ?
	`);
	return stmt.all(limit) as Media[];
}

// Get related media (same teacher or type)
export function getRelatedMedia(mediaId: number, limit = 6): Media[] {
	const media = getMediaById(mediaId);
	if (!media) return [];

	// Optimized: deterministic ordering instead of RANDOM() for faster builds
	const stmt = db.prepare(`
		SELECT m.*, t.name as teacher_name, t.name_myanmar as teacher_name_myanmar
		FROM media m
		LEFT JOIN teachers t ON m.teacher_id = t.id
		WHERE m.id != ? AND (m.teacher_id = ? OR m.type = ?)
		ORDER BY 
			CASE WHEN m.teacher_id = ? THEN 0 ELSE 1 END,
			ABS(m.id - ?)
		LIMIT ?
	`);
	return stmt.all(
		mediaId,
		media.teacher_id,
		media.type,
		media.teacher_id,
		mediaId,
		limit
	) as Media[];
}
