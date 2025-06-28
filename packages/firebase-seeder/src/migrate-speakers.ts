import * as admin from "firebase-admin";
import path from "node:path";

// Load service account key JSON and initialize app
const serviceAccount = require(
  path.resolve(__dirname, "../serviceAccountKey.json")
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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

  console.log("🚀 Starting speaker migration...");

  // Check if speakers collection already exists and has data
  const existingSpeakersSnapshot = await firestore
    .collection("speakers")
    .limit(1)
    .get();
  if (!existingSpeakersSnapshot.empty) {
    console.log(
      "⚠️  Speakers collection already exists. Use --force to overwrite."
    );
    const shouldForce = process.argv.includes("--force");
    if (!shouldForce) {
      console.log(
        "💡 Run with --force flag to overwrite existing speakers collection."
      );
      return;
    }
    console.log("🔄 Force mode enabled. Clearing existing speakers...");
    const batch = firestore.batch();
    const allSpeakers = await firestore.collection("speakers").get();
    allSpeakers.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) =>
      batch.delete(doc.ref)
    );
    await batch.commit();
  }

  // Collect content from all collections
  const contentCollections = ["ebooks", "sermons", "videos"];
  const speakerMap = new Map<
    string,
    {
      name: string;
      contentRefs: { ebooks: string[]; sermons: string[]; videos: string[] };
      contentTypes: Set<string>;
    }
  >();

  console.log("📚 Analyzing content collections...");

  for (const collectionName of contentCollections) {
    console.log(`   Processing ${collectionName}...`);

    const contentSnapshot = await firestore.collection(collectionName).get();
    console.log(
      `   Found ${contentSnapshot.size} documents in ${collectionName}`
    );

    contentSnapshot.docs.forEach(
      (doc: admin.firestore.QueryDocumentSnapshot) => {
        const data = doc.data() as ContentDocument;

        if (!data.speaker) {
          console.log(`   ⚠️  Document ${doc.id} has no speaker field`);
          return;
        }

        const speakerName = data.speaker.trim();
        const speakerId = speakerName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

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
          return;
        }
        speaker.contentTypes.add(data.contentType);

        // Map content types to collection names
        if (data.contentType === "ebook") {
          speaker.contentRefs.ebooks.push(doc.id);
        } else if (data.contentType === "sermon") {
          speaker.contentRefs.sermons.push(doc.id);
        } else if (data.contentType === "video") {
          speaker.contentRefs.videos.push(doc.id);
        }
      }
    );
  }

  console.log(`✅ Found ${speakerMap.size} unique speakers`);

  // Create speaker documents
  console.log("📝 Creating speaker documents...");

  const batch = firestore.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500; // Firestore batch limit

  for (const [speakerId, speakerInfo] of speakerMap) {
    const speakerData: SpeakerData = {
      id: speakerId,
      name: speakerInfo.name,
      bio: generateSpeakerBio(speakerInfo.name), // Generate a basic bio
      profileImageUrl: undefined, // Can be populated later
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

    const speakerRef = firestore.collection("speakers").doc(speakerId);
    batch.set(speakerRef, speakerData);
    batchCount++;

    // Commit batch if we reach the limit
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`   ✅ Committed batch of ${batchCount} speakers`);
      batchCount = 0;
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
