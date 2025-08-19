#!/usr/bin/env node

import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/dhamma_dataset.db');
const outputDir = join(__dirname, '../src/data');

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

const db = new Database(dbPath);

console.log('Exporting data from SQLite to JSON...');

// Export content with good distribution
const videoContent = db.prepare(`
  SELECT * FROM dhamma_content 
  WHERE content_type = 'video'
  ORDER BY created_at DESC
  LIMIT 300
`).all();

const audioContent = db.prepare(`
  SELECT * FROM dhamma_content 
  WHERE content_type = 'audio'
  ORDER BY created_at DESC
  LIMIT 600
`).all();

const ebookContent = db.prepare(`
  SELECT * FROM dhamma_content 
  WHERE content_type = 'ebook'
  ORDER BY created_at DESC
  LIMIT 100
`).all();

const allContent = [...videoContent, ...audioContent, ...ebookContent];

console.log(`Found ${allContent.length} content items`);

// Export speakers
const speakers = db.prepare(`
  SELECT DISTINCT speaker FROM dhamma_content 
  WHERE speaker IS NOT NULL AND speaker != ''
  ORDER BY speaker
`).all().map(row => row.speaker);

console.log(`Found ${speakers.length} unique speakers`);

// Export categories
const categories = db.prepare(`
  SELECT DISTINCT category FROM dhamma_content 
  WHERE category IS NOT NULL AND category != ''
  ORDER BY category
`).all().map(row => row.category);

console.log(`Found ${categories.length} unique categories`);

// Export content by type
const contentByType = {
  audio: allContent.filter(item => item.content_type === 'audio'),
  video: allContent.filter(item => item.content_type === 'video'),
  ebook: allContent.filter(item => item.content_type === 'ebook')
};

console.log(`Content distribution: ${contentByType.audio.length} audio, ${contentByType.video.length} video, ${contentByType.ebook.length} ebook`);

// Write JSON files
writeFileSync(join(outputDir, 'content.json'), JSON.stringify(allContent, null, 2));
writeFileSync(join(outputDir, 'speakers.json'), JSON.stringify(speakers, null, 2));
writeFileSync(join(outputDir, 'categories.json'), JSON.stringify(categories, null, 2));
writeFileSync(join(outputDir, 'content-by-type.json'), JSON.stringify(contentByType, null, 2));

// Create a summary file for quick reference
const summary = {
  totalContent: allContent.length,
  speakers: speakers.length,
  categories: categories.length,
  contentTypes: {
    audio: contentByType.audio.length,
    video: contentByType.video.length,
    ebook: contentByType.ebook.length
  },
  lastUpdated: new Date().toISOString()
};

writeFileSync(join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

console.log('Data export completed successfully!');
console.log(`Files created in: ${outputDir}`);

db.close();