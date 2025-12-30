/* eslint-disable sonarjs/cognitive-complexity */
"use client";

import { useState } from "react";
import { FeatureIcons } from "@/components/ui/icons";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  autoplay: boolean;
  playbackRate: number;
  volume: number;
  subtitles: boolean;
  notifications: {
    newContent: boolean;
    learningPathProgress: boolean;
    reminderBells: boolean;
  };
  privacy: {
    trackProgress: boolean;
    shareBookmarks: boolean;
    publicProfile: boolean;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
  stats: {
    totalListeningTime: number; // in minutes
    contentCompleted: number;
    favoritesSaved: number;
    streakDays: number;
  };
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  language: "en",
  autoplay: false,
  playbackRate: 1.0,
  volume: 0.8,
  subtitles: false,
  notifications: {
    newContent: true,
    learningPathProgress: true,
    reminderBells: false
  },
  privacy: {
    trackProgress: true,
    shareBookmarks: false,
    publicProfile: false
  }
};

interface UserProfileComponentProps {
  user?: UserProfile;
  onUpdateProfile?: (profile: Partial<UserProfile>) => void;
  onUpdatePreferences?: (preferences: UserPreferences) => void;
  className?: string;
}

export default function UserProfileComponent({
  user,
  onUpdateProfile,
  onUpdatePreferences,
  className = ""
}: UserProfileComponentProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "stats"
  >("profile");
  const [preferences, setPreferences] = useState<UserPreferences>(
    user?.preferences || defaultPreferences
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || "",
    bio: user?.bio || ""
  });

  // Mock user data if none provided
  const mockUser: UserProfile = {
    id: "user-1",
    name: "Meditation Practitioner",
    email: "user@example.com",
    joinDate: "2024-01-15",
    bio: "Dedicated to the path of mindfulness and compassion",
    preferences: defaultPreferences,
    stats: {
      totalListeningTime: 1250, // minutes
      contentCompleted: 47,
      favoritesSaved: 23,
      streakDays: 12
    }
  };

  const currentUser = user || mockUser;

  // Handle preference updates
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onUpdatePreferences?.(newPreferences);
  };

  // Handle nested preference updates
  const updateNestedPreference = <T extends keyof UserPreferences>(
    category: T,
    key: keyof UserPreferences[T],
    value: boolean
  ) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...(preferences[category] as object),
        [key]: value
      }
    };
    setPreferences(newPreferences);
    onUpdatePreferences?.(newPreferences);
  };

  // Handle profile editing
  const handleSaveProfile = () => {
    onUpdateProfile?.(editedProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      name: currentUser.name,
      bio: currentUser.bio || ""
    });
    setIsEditing(false);
  };

  // Format time for display
  const formatListeningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: FeatureIcons.Meditation },
    {
      id: "preferences" as const,
      label: "Preferences",
      icon: FeatureIcons.Filter
    },
    { id: "stats" as const, label: "Statistics", icon: FeatureIcons.Calendar }
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Profile sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            name: e.target.value
                          }))
                        }
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={editedProfile.bio}
                        onChange={(e) =>
                          setEditedProfile((prev) => ({
                            ...prev,
                            bio: e.target.value
                          }))
                        }
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Tell us about your meditation journey..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {currentUser.name}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {currentUser.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                      Member since{" "}
                      {new Date(currentUser.joinDate).toLocaleDateString()}
                    </p>
                    {currentUser.bio && (
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentUser.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            {/* Playback Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Playback Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="autoplay"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Autoplay next content
                  </label>
                  <button
                    id="autoplay"
                    type="button"
                    onClick={() =>
                      updatePreference("autoplay", !preferences.autoplay)
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.autoplay
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.autoplay
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="subtitles"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Show subtitles when available
                  </label>
                  <button
                    id="subtitles"
                    type="button"
                    onClick={() =>
                      updatePreference("subtitles", !preferences.subtitles)
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.subtitles
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.subtitles
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="playback-rate"
                    className="block text-sm text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Default playback speed: {preferences.playbackRate}x
                  </label>
                  <input
                    id="playback-rate"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={preferences.playbackRate}
                    onChange={(e) =>
                      updatePreference(
                        "playbackRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label
                    htmlFor="volume"
                    className="block text-sm text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Default volume: {Math.round(preferences.volume * 100)}%
                  </label>
                  <input
                    id="volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferences.volume}
                    onChange={(e) =>
                      updatePreference("volume", parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="new-content"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    New content notifications
                  </label>
                  <button
                    id="new-content"
                    type="button"
                    onClick={() =>
                      updateNestedPreference(
                        "notifications",
                        "newContent",
                        !preferences.notifications.newContent
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.notifications.newContent
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.notifications.newContent
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="learning-progress"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Learning path progress
                  </label>
                  <button
                    id="learning-progress"
                    type="button"
                    onClick={() =>
                      updateNestedPreference(
                        "notifications",
                        "learningPathProgress",
                        !preferences.notifications.learningPathProgress
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.notifications.learningPathProgress
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.notifications.learningPathProgress
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="reminder-bells"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Meditation reminder bells
                  </label>
                  <button
                    id="reminder-bells"
                    type="button"
                    onClick={() =>
                      updateNestedPreference(
                        "notifications",
                        "reminderBells",
                        !preferences.notifications.reminderBells
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.notifications.reminderBells
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.notifications.reminderBells
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Privacy & Data
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="track-progress"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Track listening progress
                  </label>
                  <button
                    id="track-progress"
                    type="button"
                    onClick={() =>
                      updateNestedPreference(
                        "privacy",
                        "trackProgress",
                        !preferences.privacy.trackProgress
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.privacy.trackProgress
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.privacy.trackProgress
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="share-bookmarks"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Share bookmarks publicly
                  </label>
                  <button
                    id="share-bookmarks"
                    type="button"
                    onClick={() =>
                      updateNestedPreference(
                        "privacy",
                        "shareBookmarks",
                        !preferences.privacy.shareBookmarks
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.privacy.shareBookmarks
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.privacy.shareBookmarks
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="public-profile"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Public profile visibility
                  </label>
                  <button
                    id="public-profile"
                    type="button"
                    onClick={() =>
                      updateNestedPreference(
                        "privacy",
                        "publicProfile",
                        !preferences.privacy.publicProfile
                      )
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      preferences.privacy.publicProfile
                        ? "bg-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        preferences.privacy.publicProfile
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Your Dhamma Journey
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatListeningTime(currentUser.stats.totalListeningTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total listening time
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {currentUser.stats.contentCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Content completed
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {currentUser.stats.favoritesSaved}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Favorites saved
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {currentUser.stats.streakDays}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Day streak
                </div>
              </div>
            </div>

            {/* Achievement badges or progress indicators could go here */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Recent Activity
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keep up the great work! You&apos;ve been consistently engaging
                with Dhamma content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
