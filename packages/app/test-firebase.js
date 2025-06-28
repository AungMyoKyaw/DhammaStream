// Quick Firebase Connection Test
// Run this in the browser console to test Firebase connection directly

import { db } from "./src/firebase.js";
import { collection, getDocs, query, limit } from "firebase/firestore";

async function testFirebaseConnection() {
  console.log("🔍 Testing Firebase connection...");
  console.log("Firebase config:", {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  });

  try {
    // Test each collection
    const collections = ["ebooks", "sermons", "videos"];
    const results = {};

    for (const collectionName of collections) {
      try {
        console.log(`🔍 Testing collection: ${collectionName}`);
        const q = query(collection(db, collectionName), limit(1));
        const snapshot = await getDocs(q);
        results[collectionName] = {
          accessible: true,
          documentCount: snapshot.size,
          hasDocuments: !snapshot.empty
        };
        console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        results[collectionName] = {
          accessible: false,
          error: error.message
        };
        console.error(`❌ ${collectionName}: ${error.message}`);
      }
    }

    console.log("📊 Final Results:", results);
    return results;
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
    return { error: error.message };
  }
}

// Auto-run the test
testFirebaseConnection();
