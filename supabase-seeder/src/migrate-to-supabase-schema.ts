// ETL script for migrating dhamma_dataset.db to normalized Supabase schema
// Usage: tsx migrate-to-supabase-schema.ts

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const SRC_DB = path.resolve(__dirname, "../../data/dhamma_dataset.db");
const DEST_DB = path.resolve(__dirname, "../../data/dhamma_supabase.db");

// 1. Create new DB with Supabase schema
function createSupabaseSchema(dbPath: string) {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE speakers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      bio TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE dhamma_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      speaker_id INTEGER,
      content_type TEXT CHECK(content_type IN ('audio', 'video', 'ebook', 'other')),
      file_url TEXT NOT NULL UNIQUE,
      file_size_estimate INTEGER,
      duration_estimate INTEGER,
      language TEXT DEFAULT 'Myanmar',
      category_id INTEGER,
      description TEXT,
      date_recorded DATE,
      source_page TEXT,
      scraped_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (speaker_id) REFERENCES speakers(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    CREATE TABLE dhamma_content_tags (
      content_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (content_id, tag_id),
      FOREIGN KEY (content_id) REFERENCES dhamma_content(id),
      FOREIGN KEY (tag_id) REFERENCES tags(id)
    );
  `);
  db.close();
}

// 2. Extract unique speakers, categories, tags from source DB
// 3. Insert into new DB, build mapping tables
// 4. Transform and load dhamma_content, dhamma_content_tags
// ...

if (require.main === module) {
  try {
    createSupabaseSchema(DEST_DB);
    console.log("Supabase schema created at", DEST_DB);

    // Open source and destination DBs
    const srcDb = new Database(SRC_DB, { readonly: true });
    const destDb = new Database(DEST_DB);

    destDb.exec("BEGIN TRANSACTION;");

    // Extract unique speakers
    type SpeakerRow = { speaker: string };
    const speakers: string[] = (
      srcDb
        .prepare(
          "SELECT DISTINCT speaker FROM dhamma_content WHERE speaker IS NOT NULL AND speaker != ''"
        )
        .all() as SpeakerRow[]
    )
      .map((r) => r.speaker.trim())
      .filter(Boolean);
    // Insert speakers, build mapping
    const speakerMap = new Map<string, number>();
    const insertSpeaker = destDb.prepare(
      "INSERT INTO speakers (name) VALUES (?)"
    );
    for (const name of speakers) {
      const info = insertSpeaker.run(name);
      speakerMap.set(name, info.lastInsertRowid as number);
    }

    // Extract unique categories
    type CategoryRow = { category: string };
    const categories: string[] = (
      srcDb
        .prepare(
          "SELECT DISTINCT category FROM dhamma_content WHERE category IS NOT NULL AND category != ''"
        )
        .all() as CategoryRow[]
    )
      .map((r) => r.category.trim())
      .filter(Boolean);
    // Insert categories, build mapping
    const categoryMap = new Map<string, number>();
    const insertCategory = destDb.prepare(
      "INSERT INTO categories (name) VALUES (?)"
    );
    for (const name of categories) {
      const info = insertCategory.run(name);
      categoryMap.set(name, info.lastInsertRowid as number);
    }

    // Extract and deduplicate tags
    type TagRow = { tags: string };
    const tagRows = srcDb
      .prepare(
        "SELECT tags FROM dhamma_content WHERE tags IS NOT NULL AND tags != ''"
      )
      .all() as TagRow[];
    const tagSet = new Set<string>();
    for (const row of tagRows) {
      if (!row.tags) continue;
      row.tags
        .split(/[,;\n]+/)
        .map((t: string) => t.trim())
        .filter(Boolean)
        .forEach((t: string) => tagSet.add(t));
    }
    const tags = Array.from(tagSet);
    // Insert tags, build mapping
    const tagMap = new Map<string, number>();
    const insertTag = destDb.prepare("INSERT INTO tags (name) VALUES (?)");
    for (const name of tags) {
      const info = insertTag.run(name);
      tagMap.set(name, info.lastInsertRowid as number);
    }

    // Save mapping tables for later use
    fs.writeFileSync(
      path.resolve(__dirname, "../../data/speaker_map.json"),
      JSON.stringify(Object.fromEntries(speakerMap), null, 2)
    );
    fs.writeFileSync(
      path.resolve(__dirname, "../../data/category_map.json"),
      JSON.stringify(Object.fromEntries(categoryMap), null, 2)
    );
    fs.writeFileSync(
      path.resolve(__dirname, "../../data/tag_map.json"),
      JSON.stringify(Object.fromEntries(tagMap), null, 2)
    );

    // --- Transform and load dhamma_content ---
    // Reload mapping tables for safety
    const speakerMap2 = new Map<string, number>(
      Object.entries(
        JSON.parse(
          fs.readFileSync(
            path.resolve(__dirname, "../../data/speaker_map.json"),
            "utf-8"
          )
        )
      )
    );
    const categoryMap2 = new Map<string, number>(
      Object.entries(
        JSON.parse(
          fs.readFileSync(
            path.resolve(__dirname, "../../data/category_map.json"),
            "utf-8"
          )
        )
      )
    );
    const tagMap2 = new Map<string, number>(
      Object.entries(
        JSON.parse(
          fs.readFileSync(
            path.resolve(__dirname, "../../data/tag_map.json"),
            "utf-8"
          )
        )
      )
    );

    // Prepare insert statements
    const insertContent = destDb.prepare(`INSERT INTO dhamma_content (
      title, speaker_id, content_type, file_url, file_size_estimate, duration_estimate, language, category_id, description, date_recorded, source_page, scraped_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertContentTag = destDb.prepare(
      "INSERT INTO dhamma_content_tags (content_id, tag_id) VALUES (?, ?)"
    );

    // Read all content rows from source
    type ContentRow = {
      title: string;
      speaker: string;
      content_type: string;
      file_url: string;
      file_size_estimate: number | null;
      duration_estimate: number | null;
      language: string;
      category: string;
      description: string;
      date_recorded: string;
      source_page: string;
      scraped_date: string;
      created_at: string;
      tags: string;
    };
    const contentRows = srcDb
      .prepare("SELECT * FROM dhamma_content")
      .all() as ContentRow[];
    for (const row of contentRows) {
      // Map speaker and category
      const speaker_id =
        row.speaker && speakerMap2.get(row.speaker.trim())
          ? Number(speakerMap2.get(row.speaker.trim()))
          : null;
      const category_id =
        row.category && categoryMap2.get(row.category.trim())
          ? Number(categoryMap2.get(row.category.trim()))
          : null;
      // Insert dhamma_content
      const info = insertContent.run(
        row.title,
        speaker_id,
        row.content_type,
        row.file_url,
        row.file_size_estimate,
        row.duration_estimate,
        row.language,
        category_id,
        row.description,
        row.date_recorded,
        row.source_page,
        row.scraped_date,
        row.created_at
      );
      const content_id = info.lastInsertRowid as number;
      // Insert dhamma_content_tags
      if (row.tags) {
        row.tags
          .split(/[,;\n]+/)
          .map((t: string) => t.trim())
          .filter(Boolean)
          .forEach((tag: string) => {
            const tag_id = tagMap2.get(tag);
            if (tag_id) insertContentTag.run(content_id, Number(tag_id));
          });
      }
    }

    destDb.exec("COMMIT;");
    srcDb.close();
    destDb.close();
    console.log(
      "Speakers, categories, tags, dhamma_content, and dhamma_content_tags migrated."
    );
  } catch (err) {
    console.error("Migration failed:", err);
  }
}
