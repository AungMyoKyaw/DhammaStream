// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDMNDYIcGMe0lkrpUI1uORq0rH9ZIk-e8c",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "dhammastream-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dhammastream-app",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "dhammastream-app.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1021419256809",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1021419256809:web:4f92ce36fa104cddaae978",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-40GP59YT44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Note: Emulator connection disabled for production use
// Uncomment the following lines for local development with Firebase emulators:
/*
if (import.meta.env.DEV && typeof window !== 'undefined') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.log('Connected to Firebase emulators')
  } catch (error) {
    console.log('Firebase emulators connection skipped:', error)
  }
}
*/

export default app;
