import dotenv from "dotenv";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";

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

// Map to hold speaker name to speaker_id
const speakerMap = new Map<string, number>();

// Utility sleep function
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type DhammaRow = {
  id: number;
  title: string;
  speaker: string | null;
  content_type: string;
  file_url: string;
  file_size_estimate: number | null;
  duration_estimate: number | null;
  language: string | null;
  category: string | null;
  tags: string | null;
  description: string | null;
  date_recorded: string | null;
  source_page: string | null;
  scraped_date: string | null;
  created_at: string;
};

async function main() {
  console.log("Starting seeder...");
  await seedSpeakers();
  await seedContent();
  console.log("Seeding completed.");
  process.exit(0);
}

function extractUniqueSpeakers(): Set<string> {
  const stmt = db.prepare(
    "SELECT DISTINCT speaker FROM dhamma_content WHERE speaker IS NOT NULL AND speaker != ''"
  );
  const rows: Array<{ speaker: string }> = stmt.all();
  const set = new Set<string>();
  rows.forEach((r) => set.add(r.speaker));
  return set;
}

async function seedSpeakers() {
  const names = Array.from(extractUniqueSpeakers());
  if (names.length === 0) {
    console.log("No speaker data to seed.");
    return;
  }
  console.log(`Seeding ${names.length} unique speakers...`);

  const records = [
    ...new Set(
      names.map((name) =>
        name
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim()
          .substring(0, 255)
      )
    )
  ]
    .filter((name) => name.trim() !== "")
    .map((name) => ({ name }));
  try {
    // Upsert to avoid duplicates
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      const { data: upsertedData, error: upsertError } = await supabase
        .from("speakers")
        .upsert(batch, { onConflict: "name" })
        .select();

      if (upsertError) {
        console.error("Upsert error:", JSON.stringify(upsertError, null, 2));
        throw upsertError;
      }

      if (upsertedData) {
        upsertedData.forEach((row: { id: number; name: string }) => {
          if (row.name) speakerMap.set(row.name, row.id);
        });
      }
    }

    console.log(`Seeded ${names.length} speakers.`);
  } catch (err) {
    console.error("Error seeding speakers:", err);
    process.exit(1);
  }
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
      category: string | null;
      tags: string[];
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
      // Transform tags to array
      const tagsArray = row.tags
        ? row.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      // Map speaker to speaker_id
      const speakerId: number | null = row.speaker
        ? (speakerMap.get(row.speaker) ?? null)
        : null;

      toInsert.push({
        id: row.id,
        title: row.title,
        speaker_id: speakerId,
        content_type: row.content_type,
        file_url: row.file_url,
        file_size_estimate: row.file_size_estimate,
        duration_estimate: row.duration_estimate,
        language: language,
        category: row.category,
        tags: tagsArray,
        description: row.description,
        date_recorded: row.date_recorded
          ? new Date(row.date_recorded).toISOString()
          : null,
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
        const { data, error } = await supabase
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

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
