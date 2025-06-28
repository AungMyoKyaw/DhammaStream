import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";

export interface ConnectionStatus {
  isConnected: boolean;
  collections: {
    name: string;
    documentCount: number;
    accessible: boolean;
    error?: string;
  }[];
  totalDocuments: number;
}

export async function checkFirestoreConnection(): Promise<ConnectionStatus> {
  const collections = ["ebooks", "sermons", "videos"];
  const status: ConnectionStatus = {
    isConnected: false,
    collections: [],
    totalDocuments: 0
  };

  try {
    let totalDocs = 0;

    for (const collectionName of collections) {
      try {
        // Try to get actual count by fetching all (for small collections)
        const allQ = query(collection(db, collectionName));
        const allSnapshot = await getDocs(allQ);

        const documentCount = allSnapshot.size;
        totalDocs += documentCount;

        status.collections.push({
          name: collectionName,
          documentCount,
          accessible: true
        });
      } catch (error) {
        console.error(`Error accessing collection ${collectionName}:`, error);
        status.collections.push({
          name: collectionName,
          documentCount: 0,
          accessible: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    status.totalDocuments = totalDocs;
    status.isConnected = status.collections.some((col) => col.accessible);
  } catch (error) {
    console.error("Firestore connection check failed:", error);
  }

  return status;
}

// Quick test function for development
export async function testFirestoreConnection(): Promise<ConnectionStatus> {
  console.log("🔍 Testing Firestore connection...");

  try {
    const status = await checkFirestoreConnection();

    console.log("📊 Firestore Connection Status:", {
      connected: status.isConnected,
      totalDocuments: status.totalDocuments,
      collections: status.collections
    });

    if (status.isConnected) {
      console.log("✅ Firestore is accessible");
      if (status.totalDocuments === 0) {
        console.log("⚠️ No documents found in any collection");
      }
    } else {
      console.log("❌ Firestore is not accessible");
    }

    return status;
  } catch (error) {
    console.error("❌ Firestore connection test failed:", error);
    throw error;
  }
}
