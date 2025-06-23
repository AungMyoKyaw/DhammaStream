import * as admin from "firebase-admin";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "node:path";
import fs from "node:fs/promises";

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

// Persist seeding state across days to respect free-tier writes
const stateFile = path.resolve(__dirname, "../state.json");
interface State {
  lastRunDate: string;
  lastProcessedIndex: number;
  dailyProcessedCount: number;
}

async function loadState(): Promise<State> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = await fs.readFile(stateFile, "utf8");
    const state: State = JSON.parse(raw);
    if (state.lastRunDate !== today) {
      state.lastRunDate = today;
      state.dailyProcessedCount = 0;
    }
    return state;
  } catch {
    return {
      lastRunDate: today,
      lastProcessedIndex: 0,
      dailyProcessedCount: 0
    };
  }
}
async function saveState(state: State) {
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

// Global error handlers
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

async function main() {
  const state = await loadState();
  const dailyLimit = 20000;

  const dbPath = path.resolve(__dirname, "../data/dhamma_dataset.db");
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  const firestore = admin.firestore();
  const rows: DbRow[] = await db.all("SELECT * FROM dhamma_content");

  const total = rows.length;
  console.log(
    `Resuming from index ${state.lastProcessedIndex} of ${total}; ${dailyLimit - state.dailyProcessedCount} writes remaining today.`
  );

  // Process records in parallel with concurrency limit
  const collectionMap: Record<string, string> = {
    audio: "sermons",
    video: "videos",
    ebook: "ebooks",
    other: "others"
  };
  const concurrentLimit = 10;
  let i = state.lastProcessedIndex;
  while (i < total) {
    const remaining = dailyLimit - state.dailyProcessedCount;
    if (remaining <= 0) {
      console.error(
        `Daily limit of ${dailyLimit} writes reached. Resume tomorrow from index ${state.lastProcessedIndex}.`
      );
      await saveState(state);
      process.exit(1);
    }
    // Determine how many to process in this batch
    const batchCount = Math.min(concurrentLimit, total - i, remaining);
    const tasks: Promise<void>[] = [];
    for (let c = 0; c < batchCount; c++, i++) {
      const row = rows[i];
      const collectionName = collectionMap[row.content_type] || "content";
      const docRef = firestore
        .collection(collectionName)
        .doc(row.id.toString());
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
      tasks.push(
        docRef
          .set(data, { merge: true })
          .then(() => console.log(`Seeded doc ${i + 1}/${total}`))
          .catch((err) => {
            console.error(`Error seeding doc ${i + 1}:`, err);
            throw err;
          })
      );
    }
    // Await parallel execution of this batch
    await Promise.all(tasks);
    // Update state and persist
    state.dailyProcessedCount += batchCount;
    state.lastProcessedIndex = i;
    await saveState(state);
  }

  console.log(`Successfully seeded all ${total} documents. Clearing state.`);
  await fs.unlink(stateFile).catch(() => {});
  await db.close();
}

main().catch((err) => {
  console.error("Error seeding Firestore:", err);
  process.exit(1);
});
