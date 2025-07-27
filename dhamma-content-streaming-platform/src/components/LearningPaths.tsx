"use client";

import { useState } from "react";
import Link from "next/link";
import { FeatureIcons, ContentTypeIcons } from "@/components/ui/icons";
import type { DhammaContentWithRelations } from "@/types/database";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  tradition: string;
  contentCount: number;
  completedCount?: number;
  topics: string[];
  contents: DhammaContentWithRelations[];
}

interface LearningPathsProps {
  className?: string;
  currentPath?: string;
}

export default function LearningPaths({
  className = "",
  currentPath
}: LearningPathsProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTradition, setSelectedTradition] = useState<string>("all");

  // Mock learning paths data - in real implementation, this would come from an API
  const learningPaths: LearningPath[] = [
    {
      id: "mindfulness-basics",
      title: "Mindfulness Meditation Basics",
      description:
        "A complete introduction to mindfulness meditation practice, perfect for beginners starting their meditation journey.",
      difficulty: "beginner",
      duration: "4 weeks",
      tradition: "Vipassana",
      contentCount: 12,
      completedCount: 0,
      topics: [
        "Breathing meditation",
        "Body awareness",
        "Walking meditation",
        "Loving-kindness"
      ],
      contents: []
    },
    {
      id: "zen-foundations",
      title: "Zen Practice Foundations",
      description:
        "Explore the fundamentals of Zen meditation and philosophy through traditional teachings and guided practices.",
      difficulty: "intermediate",
      duration: "6 weeks",
      tradition: "Zen",
      contentCount: 18,
      completedCount: 3,
      topics: [
        "Zazen meditation",
        "Koan study",
        "Zen philosophy",
        "Daily practice"
      ],
      contents: []
    },
    {
      id: "advanced-vipassana",
      title: "Advanced Vipassana Retreat",
      description:
        "Deepen your insight meditation practice with advanced techniques and intensive retreat-style teachings.",
      difficulty: "advanced",
      duration: "8 weeks",
      tradition: "Theravada",
      contentCount: 24,
      completedCount: 0,
      topics: [
        "Advanced insight",
        "Jhana states",
        "Noble truths",
        "Retreat practice"
      ],
      contents: []
    },
    {
      id: "compassion-cultivation",
      title: "Cultivating Compassion",
      description:
        "Learn traditional Buddhist methods for developing compassion and loving-kindness toward all beings.",
      difficulty: "intermediate",
      duration: "5 weeks",
      tradition: "Tibetan",
      contentCount: 15,
      completedCount: 7,
      topics: [
        "Loving-kindness",
        "Tonglen practice",
        "Bodhicitta",
        "Self-compassion"
      ],
      contents: []
    },
    {
      id: "dharma-study",
      title: "Essential Dharma Teachings",
      description:
        "Study the core teachings of Buddhism through classical texts and contemporary explanations.",
      difficulty: "beginner",
      duration: "10 weeks",
      tradition: "Universal",
      contentCount: 30,
      completedCount: 5,
      topics: [
        "Four Noble Truths",
        "Eightfold Path",
        "Dependent origination",
        "Karma"
      ],
      contents: []
    },
    {
      id: "daily-practice",
      title: "Building a Daily Practice",
      description:
        "Practical guidance for establishing and maintaining a consistent meditation and mindfulness practice.",
      difficulty: "beginner",
      duration: "3 weeks",
      tradition: "Universal",
      contentCount: 9,
      completedCount: 2,
      topics: [
        "Morning routine",
        "Evening reflection",
        "Habit formation",
        "Overcoming obstacles"
      ],
      contents: []
    }
  ];

  const filteredPaths = learningPaths.filter((path) => {
    const difficultyMatch =
      selectedDifficulty === "all" || path.difficulty === selectedDifficulty;
    const traditionMatch =
      selectedTradition === "all" || path.tradition === selectedTradition;
    return difficultyMatch && traditionMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const traditions = [
    "all",
    "Vipassana",
    "Zen",
    "Theravada",
    "Tibetan",
    "Universal"
  ];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <FeatureIcons.Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Learning Paths
        </h3>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Difficulty:
          </span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Filter by difficulty level"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty === "all"
                  ? "All Levels"
                  : `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tradition:
          </span>
          <select
            value={selectedTradition}
            onChange={(e) => setSelectedTradition(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Filter by Buddhist tradition"
          >
            {traditions.map((tradition) => (
              <option key={tradition} value={tradition}>
                {tradition === "all" ? "All Traditions" : tradition}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => {
          const isCurrentPath = currentPath === path.id;
          const progressPercentage = path.completedCount
            ? getProgressPercentage(path.completedCount, path.contentCount)
            : 0;

          return (
            <div
              key={path.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                isCurrentPath
                  ? "border-orange-500 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800"
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {path.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {path.description}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <FeatureIcons.Clock className="w-4 h-4" />
                    <span>{path.duration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ContentTypeIcons.Other className="w-4 h-4" />
                    <span>{path.contentCount} lessons</span>
                  </span>
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}
                  >
                    {path.difficulty}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {path.tradition}
                  </span>
                </div>

                {/* Progress Bar */}
                {path.completedCount !== undefined &&
                  path.completedCount > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-600 dark:bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                {/* Topics */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topics covered:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {path.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                    {path.topics.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                        +{path.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/learning-path/${path.id}`}
                  className={`block w-full text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    isCurrentPath
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : path.completedCount && path.completedCount > 0
                        ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        : "bg-orange-600 hover:bg-orange-700 text-white"
                  }`}
                >
                  {isCurrentPath
                    ? "Current Path"
                    : path.completedCount && path.completedCount > 0
                      ? "Continue"
                      : "Start Path"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPaths.length === 0 && (
        <div className="text-center py-12">
          <FeatureIcons.Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No learning paths found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters to see more learning paths.
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Looking for something specific? Browse all content or search for
          topics.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/browse/video"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <ContentTypeIcons.Video className="w-4 h-4" />
            <span>Browse Videos</span>
          </Link>
          <Link
            href="/browse/audio"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <ContentTypeIcons.Audio className="w-4 h-4" />
            <span>Browse Audio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
