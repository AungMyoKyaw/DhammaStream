import { Database } from 'bun:sqlite';
import path from 'path';

const dbPath = path.resolve('dhamma.db');
const db = new Database(dbPath, { readonly: true });

// Optimize database for concurrent reads and performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA cache_size = -64000;'); // 64MB cache
db.exec('PRAGMA temp_store = MEMORY;'); // Store temp tables in RAM
db.exec('PRAGMA mmap_size = 30000000000;'); // Enable memory-mapped I/O

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

// Get all teachers with media count
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

// Get statistics
export function getStats(): Stats {
	const teacherCount = db.prepare('SELECT COUNT(*) as count FROM teachers').get() as {
		count: number;
	};
	const mediaCount = db.prepare('SELECT COUNT(*) as count FROM media').get() as { count: number };
	const audioCount = db
		.prepare("SELECT COUNT(*) as count FROM media WHERE type = 'audio'")
		.get() as { count: number };
	const videoCount = db
		.prepare("SELECT COUNT(*) as count FROM media WHERE type = 'video'")
		.get() as { count: number };
	const ebookCount = db
		.prepare("SELECT COUNT(*) as count FROM media WHERE type = 'ebook'")
		.get() as { count: number };
	const myanmarCount = db
		.prepare("SELECT COUNT(*) as count FROM media WHERE language = 'myanmar'")
		.get() as { count: number };
	const englishCount = db
		.prepare("SELECT COUNT(*) as count FROM media WHERE language = 'english'")
		.get() as { count: number };

	return {
		totalTeachers: teacherCount.count,
		totalMedia: mediaCount.count,
		totalAudio: audioCount.count,
		totalVideo: videoCount.count,
		totalEbooks: ebookCount.count,
		totalMyanmarContent: myanmarCount.count,
		totalEnglishContent: englishCount.count
	};
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
