import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/services/firebase";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser?.email) {
          // Convert Firebase User to our User type
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...(firebaseUser.displayName && {
              displayName: firebaseUser.displayName
            }),
            ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
            preferences: {
              theme: "system",
              language: "en",
              autoplay: true,
              playbackSpeed: 1,
              volumeLevel: 1,
              showTranscriptions: true,
              enableNotifications: true,
              offlineDownloads: false,
              preferredContentTypes: ["audio"],
              favoriteCategories: [],
              preferredSpeakers: []
            },
            favoriteContentIds: [],
            createdAt: new Date(
              firebaseUser.metadata.creationTime ?? Date.now()
            ),
            lastActiveAt: new Date(),
            totalListeningTime: 0,
            achievementBadges: []
          };

          setAuthState({
            user,
            loading: false,
            error: null
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          });
        }
      },
      (error) => {
        setAuthState({
          user: null,
          loading: false,
          error: error.message
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    logout
  };
}
