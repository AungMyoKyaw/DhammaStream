import * as admin from "firebase-admin";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "node:path";

// Load service account key JSON and initialize app
const serviceAccount = require(
  path.resolve(__dirname, "../serviceAccountKey.json")
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Path to SQLite DB file relative to project root
type DbRow = {
  id: number;
  title: string;
  speaker?: string;
  content_type: string;
  file_url: string;
  file_size_estimate?: number;
  duration_estimate?: number;
  language?: string;
  category?: string;
  tags?: string;
  description?: string;
  date_recorded?: string;
  source_page?: string;
  scraped_date?: string;
  created_at?: string;
};

async function main() {
  const dbPath = path.resolve(__dirname, "../data/dhamma_dataset.db");
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  const firestore = admin.firestore();
  const rows: DbRow[] = await db.all("SELECT * FROM dhamma_content");
  // Seed in chunks; lowered to 100 for free-tier rate limits
  const chunkSize = 100;
  const total = rows.length;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const batchNum = Math.floor(i / chunkSize) + 1;
    const start = i + 1;
    const end = Math.min(i + chunk.length, total);
    console.log(
      `Seeding chunk ${batchNum}/${Math.ceil(total / chunkSize)}: docs ${start}-${end} of ${total}`
    );
    // Use WriteBatch for atomic upsert per chunk
    const batch = firestore.batch();
    for (const row of chunk) {
      const docRef = firestore.collection("sermons").doc(row.id.toString());
      const data = {
        title: row.title,
        speaker: row.speaker || null,
        contentType: row.content_type,
        fileUrl: row.file_url,
        fileSizeEstimate: row.file_size_estimate || null,
        durationEstimate: row.duration_estimate || null,
        language: row.language || null,
        category: row.category || null,
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
        description: row.description || null,
        dateRecorded: row.date_recorded
          ? admin.firestore.Timestamp.fromDate(new Date(row.date_recorded))
          : null,
        sourcePage: row.source_page || null,
        scrapedDate: row.scraped_date
          ? admin.firestore.Timestamp.fromDate(new Date(row.scraped_date))
          : null,
        createdAt: row.created_at
          ? admin.firestore.Timestamp.fromDate(new Date(row.created_at))
          : admin.firestore.Timestamp.now()
      };
      // Upsert: create or update existing document
      batch.set(docRef, data, { merge: true });
    }
    // Commit batch with retry logic
    let commitAttempts = 0;
    while (true) {
      try {
        await batch.commit();
        console.log(
          `Chunk ${batchNum} seeded successfully (${end}/${total} docs processed).`
        );
        break;
      } catch (err) {
        commitAttempts++;
        console.error(
          `Error committing chunk ${batchNum}, attempt ${commitAttempts}:`,
          err
        );
        if (commitAttempts >= 3) {
          console.error(
            `Failed to commit chunk ${batchNum} after ${commitAttempts} attempts.`
          );
          throw err;
        }
        // Exponential backoff before retry
        const backoff = commitAttempts * 1000;
        console.log(`Retrying chunk ${batchNum} in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
    // Optional delay between chunks to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log(`Successfully seeded all ${total} documents.`);
  await db.close();
}

main().catch((err) => {
  console.error("Error seeding Firestore:", err);
  process.exit(1);
});
