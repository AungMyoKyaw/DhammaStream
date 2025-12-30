// Utility to seed tags from tag_map.json
async function seedTags() {
  const tagMapPath = path.resolve(__dirname, "../../data/tag_map.json");
  if (!fs.existsSync(tagMapPath)) {
    console.warn("tag_map.json not found, skipping tag seeding.");
    return;
  }
  const tagMapRaw = fs.readFileSync(tagMapPath, "utf-8");
  const tagMap = JSON.parse(tagMapRaw);
  const tags = Object.entries(tagMap).map(([name, id]) => ({
    id: Number(id),
    name
  }));
  if (tags.length === 0) {
    console.warn("tag_map.json is empty, skipping tag seeding.");
    return;
  }
  for (const tag of tags) {
    const { error } = await supabase.from("tags").upsert(
      [
        {
          id: tag.id,
          name: tag.name
        }
      ],
      { onConflict: "id" }
    );
    if (error) {
      console.error(
        `Failed to upsert tag id=${tag.id}, name=${tag.name}:`,
        error
      );
    }
  }
  console.log(`Seeded ${tags.length} tags.`);
}
// Utility to seed categories from category_map.json
async function seedCategories() {
  const categoryMapPath = path.resolve(
    __dirname,
    "../../data/category_map.json"
  );
  const categoryMapRaw = fs.readFileSync(categoryMapPath, "utf-8");
  const categoryMap = JSON.parse(categoryMapRaw);
  // Convert to array of { id, name }
  const categories = Object.entries(categoryMap).map(([name, id]) => ({
    id: Number(id),
    name
  }));
  // Upsert all categories
  for (const category of categories) {
    const { error } = await supabase.from("categories").upsert(
      [
        {
          id: category.id,
          name: category.name
        }
      ],
      { onConflict: "id" }
    );
    if (error) {
      console.error(
        `Failed to upsert category id=${category.id}, name=${category.name}:`,
        error
      );
    }
  }
  console.log(`Seeded ${categories.length} categories.`);
}
import dotenv from "dotenv";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";
import { setupDatabase } from "./create-tables";
import fs from "fs";
import path from "path";
// Utility to seed speakers from speaker_map.json
async function seedSpeakers() {
  const speakerMapPath = path.resolve(__dirname, "../../data/speaker_map.json");
  const speakerMapRaw = fs.readFileSync(speakerMapPath, "utf-8");
  const speakerMap = JSON.parse(speakerMapRaw);
  // Convert to array of { id, name }
  const speakers = Object.entries(speakerMap).map(([name, id]) => ({
    id: Number(id),
    name
  }));
  // Upsert all speakers
  for (const speaker of speakers) {
    const { error } = await supabase.from("speakers").upsert(
      [
        {
          id: speaker.id,
          name: speaker.name
        }
      ],
      { onConflict: "id" }
    );
    if (error) {
      console.error(
        `Failed to upsert speaker id=${speaker.id}, name=${speaker.name}:`,
        error
      );
    }
  }
  console.log(`Seeded ${speakers.length} speakers.`);
}

dotenv.config();

const {
  SUPABASE_URL,
  SUPABASE_KEY,
  SQLITE_DB_PATH,
  BATCH_SIZE = "100",
  RETRY_ATTEMPTS = "3"
} = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY || !SQLITE_DB_PATH) {
  console.error(
    "Error: Missing one or more required environment variables (SUPABASE_URL, SUPABASE_KEY, SQLITE_DB_PATH)"
  );
  process.exit(1);
}

const batchSize = parseInt(BATCH_SIZE, 10);
const retryAttempts = parseInt(RETRY_ATTEMPTS, 10);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const db = new Database(SQLITE_DB_PATH, { readonly: true });

// Utility sleep function
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type DhammaRow = {
  id: number;
  title: string;
  speaker_id: number | null;
  content_type: string;
  file_url: string;
  file_size_estimate: number | null;
  duration_estimate: number | null;
  language: string | null;
  category_id: number | null;
  description: string | null;
  date_recorded: string | null;
  source_page: string | null;
  scraped_date: string | null;
  created_at: string;
};

async function seedSupabase() {
  console.log("Ensuring tables exist...");
  await setupDatabase();
  console.log("Seeding categories...");
  await seedCategories();
  console.log("Seeding speakers...");
  await seedSpeakers();
  console.log("Seeding tags...");
  await seedTags();
  console.log("Starting seeder...");
  await seedContent();
  console.log("Seeding completed.");
  process.exit(0);
}

async function seedContent() {
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM dhamma_content");
  const total = countStmt.get().count as number;
  console.log(`Total content rows: ${total}`);

  const selectStmt = db.prepare(
    "SELECT * FROM dhamma_content LIMIT ? OFFSET ?"
  );

  let offset = 0;
  let processed = 0;
  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const validTypes = ["audio", "video", "ebook", "other"];
  const validLanguages = ["English", "Myanmar", "Pali"];

  while (offset < total) {
    const rows: DhammaRow[] = selectStmt.all(batchSize, offset);
    type ContentInsert = {
      id: number;
      title: string;
      speaker_id: number | null;
      content_type: string;
      file_url: string;
      file_size_estimate: number | null;
      duration_estimate: number | null;
      language: string;
      category_id: number | null;
      description: string | null;
      date_recorded: string | null;
      source_page: string | null;
      scraped_date: string | null;
      created_at: string;
    };
    const toInsert: ContentInsert[] = [];

    rows.forEach((row) => {
      // Validate content_type
      if (!validTypes.includes(row.content_type)) {
        console.warn(
          `Skipping id=${row.id} due to invalid content_type='${row.content_type}'`
        );
        skippedCount++;
        return;
      }

      // Validate language
      let language = row.language;
      if (!language || !validLanguages.includes(language)) {
        language = "Myanmar"; // Default to Myanmar
      }
      toInsert.push({
        id: row.id,
        title: row.title,
        speaker_id: row.speaker_id ?? null,
        content_type: row.content_type,
        file_url: row.file_url,
        file_size_estimate: row.file_size_estimate,
        duration_estimate: row.duration_estimate,
        language: language,
        category_id: row.category_id ?? null,
        description: row.description,
        date_recorded: row.date_recorded
          ? new Date(row.date_recorded).toISOString().slice(0, 10)
          : null, // DATE type expects YYYY-MM-DD
        source_page: row.source_page,
        scraped_date: row.scraped_date
          ? new Date(row.scraped_date).toISOString()
          : null,
        created_at: row.created_at
          ? new Date(row.created_at).toISOString()
          : new Date().toISOString()
      });
    });

    if (toInsert.length > 0) {
      let attempt = 0;
      while (attempt < retryAttempts) {
        attempt++;

        const { error } = await supabase
          .from("dhamma_content")
          .upsert(toInsert, { onConflict: "id" });

        if (!error) {
          insertedCount += toInsert.length; // Note: This counts all upserted rows
          break; // Exit retry loop on success
        }

        console.error(
          `Batch upsert failed at offset=${offset}, attempt=${attempt}/${retryAttempts}:`,
          error
        );

        if (attempt >= retryAttempts) {
          errorCount += toInsert.length;
        } else {
          await sleep(1000 * attempt);
        }
      }
    }

    processed += rows.length;
    offset += batchSize;
    console.log(
      `Progress: processed=${processed}/${total}, inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`
    );
    await sleep(1000);
  }

  console.log("--- Summary ---");
  console.log(`Total processed: ${processed}`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

seedSupabase().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
