import * as admin from "firebase-admin";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Load service account key JSON and initialize app
const serviceAccount = require(
  path.resolve(__dirname, "../serviceAccountKey.json")
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  firestore: {
    ignoreUndefinedProperties: true
  }
});

interface ContentDocument {
  id: string;
  title: string;
  speaker: string;
  contentType: "ebook" | "sermon" | "video";
  fileUrl: string;
  fileSizeEstimate?: number;
  durationEstimate?: number;
  language: string;
  category: string;
  tags: string;
  description?: string;
  dateRecorded?: admin.firestore.Timestamp;
  sourcePage?: string;
  scrapedDate?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}

interface SpeakerData {
  id: string;
  name: string;
  bio?: string;
  profileImageUrl?: string;
  contentTypes: string[];
  contentRefs: {
    ebooks: string[];
    sermons: string[];
    videos: string[];
  };
  contentCounts: {
    ebooks: number;
    sermons: number;
    videos: number;
    total: number;
  };
  featured: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

async function migrateSpeakers() {
  const firestore = admin.firestore();
  const BATCH_SIZE = 400; // Firestore batch limit (max 500)
  const DELAY_MS = 1000; // Delay between batches to avoid rate limits

  console.log("🚀 Starting speaker migration...");

  // Open the SQLite database
  const db = await open({
    filename: path.resolve(__dirname, "../data/dhamma_dataset.db"),
    driver: sqlite3.Database
  });

  // Collect content from the database
  const speakerMap = new Map<
    string,
    {
      name: string;
      contentRefs: { ebooks: string[]; sermons: string[]; videos: string[] };
      contentTypes: Set<string>;
    }
  >();

  console.log("📚 Analyzing content from the database...");

  const rows = await db.all("SELECT * FROM dhamma_content");

  for (const row of rows) {
    const data = row as ContentDocument;

    if (!data.speaker) {
      console.log(`   ⚠️  Document ${data.id} has no speaker field`);
      continue;
    }

    const speakerName = data.speaker.trim();
    let speakerId = speakerName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // If the speakerId is empty after sanitization (e.g., due to non-Latin characters),
    // generate a UUID to ensure a valid Firestore document ID.
    if (!speakerId) {
      speakerId = admin.firestore().collection("speakers").doc().id;
      console.log(
        `   ⚠️  Speaker name "${speakerName}" resulted in an empty ID. Using UUID: ${speakerId}`
      );
    }

    if (!speakerMap.has(speakerId)) {
      speakerMap.set(speakerId, {
        name: speakerName,
        contentRefs: { ebooks: [], sermons: [], videos: [] },
        contentTypes: new Set()
      });
    }

    const speaker = speakerMap.get(speakerId);
    if (!speaker) {
      console.log(`   ⚠️  Speaker ${speakerId} not found in map`);
      continue;
    }
    if (data.contentType) {
      speaker.contentTypes.add(data.contentType);
    }

    // Map content types to collection names
    if (data.contentType === "ebook") {
      speaker.contentRefs.ebooks.push(data.id);
    } else if (data.contentType === "sermon") {
      speaker.contentRefs.sermons.push(data.id);
    } else if (data.contentType === "video") {
      speaker.contentRefs.videos.push(data.id);
    }
  }

  console.log(`✅ Found ${speakerMap.size} unique speakers`);

  // Create speaker documents
  console.log("📝 Creating speaker documents...");

  let batch = firestore.batch();
  let batchCount = 0;

  for (const [speakerId, speakerInfo] of speakerMap) {
    const speakerData: SpeakerData = {
      id: speakerId,
      name: speakerInfo.name,
      bio: generateSpeakerBio(speakerInfo.name), // Generate a basic bio
      profileImageUrl: null, // Can be populated later, explicitly set to null to avoid undefined issues
      contentTypes: Array.from(speakerInfo.contentTypes),
      contentRefs: speakerInfo.contentRefs,
      contentCounts: {
        ebooks: speakerInfo.contentRefs.ebooks.length,
        sermons: speakerInfo.contentRefs.sermons.length,
        videos: speakerInfo.contentRefs.videos.length,
        total:
          speakerInfo.contentRefs.ebooks.length +
          speakerInfo.contentRefs.sermons.length +
          speakerInfo.contentRefs.videos.length
      },
      featured: false, // Can be manually set later for featured speakers
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    if (!speakerId) {
      console.log(
        `   ⚠️  Speaker name "${speakerInfo.name}" resulted in an empty ID`
      );
      continue;
    }

    const speakerRef = firestore.collection("speakers").doc(speakerId);
    batch.set(speakerRef, speakerData, { merge: true });
    batchCount++;

    // Commit batch if we reach the limit
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`   ✅ Committed batch of ${batchCount} speakers`);
      batch = firestore.batch();
      batchCount = 0;
      await delay(DELAY_MS);
    }
  }

  // Commit any remaining documents
  if (batchCount > 0) {
    await batch.commit();
    console.log(`   ✅ Committed final batch of ${batchCount} speakers`);
  }

  console.log("🎉 Speaker migration completed successfully!");
  console.log(`📊 Created ${speakerMap.size} speaker documents`);

  // Print summary statistics
  console.log("\n📈 Summary Statistics:");
  let totalEbooks = 0,
    totalSermons = 0,
    totalVideos = 0;
  for (const speakerInfo of speakerMap.values()) {
    totalEbooks += speakerInfo.contentRefs.ebooks.length;
    totalSermons += speakerInfo.contentRefs.sermons.length;
    totalVideos += speakerInfo.contentRefs.videos.length;
  }
  console.log(`   📚 Total E-books: ${totalEbooks}`);
  console.log(`   🎙️  Total Sermons: ${totalSermons}`);
  console.log(`   🎬 Total Videos: ${totalVideos}`);
  console.log(`   👥 Total Speakers: ${speakerMap.size}`);
}

function generateSpeakerBio(speakerName: string): string {
  // Generate a basic bio - this can be enhanced later with actual biographical data
  const commonTitles = ["Venerable", "Ajahn", "Bhante", "His Holiness", "Lama"];
  const hasTitle = commonTitles.some((title) => speakerName.includes(title));

  if (hasTitle) {
    return `${speakerName} is a respected Buddhist teacher and spiritual guide, sharing wisdom through dharma teachings, meditation guidance, and spiritual discourses.`;
  } else {
    return `${speakerName} is a dharma teacher and spiritual practitioner, offering insights into Buddhist philosophy, meditation, and mindful living.`;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Error handling
process.on("unhandledRejection", (error: unknown) => {
  console.error("❌ Unhandled Rejection:", error);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Run migration
migrateSpeakers().catch((error: unknown) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
