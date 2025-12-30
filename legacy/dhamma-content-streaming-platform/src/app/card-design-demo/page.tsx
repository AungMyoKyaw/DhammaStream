"use client";

import Link from "next/link";
import ContentCardAlternatives from "@/components/ContentCardAlternatives";
import type { DhammaContentWithRelations } from "@/types/database";
import { Suspense } from "react";
import { Rocket } from "@/components/ui/icons";

// Sample content data for demonstration
const sampleContent: DhammaContentWithRelations[] = [
  {
    id: 1,
    title: "Introduction to Mindfulness Meditation",
    content_type: "audio",
    file_url: "/sample/audio1.mp3",
    duration_estimate: 45,
    language: "English",
    description:
      "A gentle introduction to mindfulness practice, suitable for beginners. Learn the fundamentals of awareness and presence.",
    speaker_id: 1,
    category_id: 1,
    file_size_estimate: null,
    date_recorded: "2024-01-15",
    source_page: null,
    scraped_date: null,
    created_at: "2024-01-15T00:00:00Z",
    speaker: {
      id: 1,
      name: "Venerable Ajahn Chah",
      bio: "Renowned Thai forest monk and meditation teacher",
      photo_url: null,
      created_at: "2024-01-01T00:00:00Z"
    }
  }
  // ... (other sampleContent items as in your original file) ...
];

export default function CardDesignDemo() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="flex items-center">
                <h1 className="text-3xl font-bold text-orange-600">
                  DhammaStream
                </h1>
              </Link>
              <div className="text-sm text-gray-600">
                Card Design Alternatives Demo
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Card UI Design Alternatives
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-3">
                  <p className="text-green-800 font-medium">
                    <strong>Update:</strong> The Compact Horizontal Design has
                    been implemented across the entire application!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Visit the browse pages, speaker pages, or content pages to
                    see the new design in action.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-4xl">
              This page demonstrates different card design patterns that work
              better for content without thumbnail images. Each approach has
              different strengths depending on your content and user needs.
            </p>
          </div>
          {/* Current Implementation */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Current Implementation (Image-based)
            </h3>
            <p className="text-gray-600 mb-6">
              The current design always allocates space for images, using
              generated placeholders when no real thumbnails are available.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleContent.map((content) => (
                <ContentCardAlternatives
                  key={`current-${content.id}`}
                  content={content}
                  variant="default"
                />
              ))}
            </div>
          </section>
          {/* Text-Focused Design */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Text-Focused Design (Recommended)
            </h3>
            <p className="text-gray-600 mb-6">
              Emphasizes content information over images. Uses content type
              icons and provides more space for descriptions and metadata. Best
              for content-heavy platforms.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleContent.map((content) => (
                <ContentCardAlternatives
                  key={`text-${content.id}`}
                  content={content}
                  variant="text-focused"
                />
              ))}
            </div>
          </section>
          {/* Compact Design */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Compact Horizontal Design ⭐ (Currently Implemented)
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Rocket
                    className="text-2xl text-orange-500"
                    aria-label="Rocket icon"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-orange-800 font-medium">
                    This design is now live across all content listing pages in
                    the application!
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Uses a horizontal layout with content type icons. Efficient use of
              space while maintaining visual appeal. Good for mobile and dense
              layouts.
            </p>
            <div className="grid gap-4">
              {sampleContent.map((content) => (
                <ContentCardAlternatives
                  key={`compact-${content.id}`}
                  content={content}
                  variant="compact"
                />
              ))}
            </div>
          </section>
          {/* List Style Design */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              List-Style Design
            </h3>
            <p className="text-gray-600 mb-6">
              Optimized for scanning large amounts of content quickly. Provides
              maximum information density while remaining readable.
            </p>
            <div className="grid gap-2">
              {sampleContent.map((content) => (
                <ContentCardAlternatives
                  key={`list-${content.id}`}
                  content={content}
                  variant="list-style"
                />
              ))}
            </div>
          </section>
          {/* Adaptive Design */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Adaptive Design (Future Enhancement)
            </h3>
            <p className="text-gray-600 mb-6">
              Automatically chooses the best layout based on available content.
              Would use image-based layout when thumbnails exist, and
              text-focused layout otherwise.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleContent.map((content) => (
                <ContentCardAlternatives
                  key={`adaptive-${content.id}`}
                  content={content}
                  variant="adaptive"
                />
              ))}
            </div>
          </section>
          {/* Implementation Notes */}
          <section className="bg-white rounded-lg p-8 shadow-md border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Implementation Status
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  ✅ Currently Implemented:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Better information hierarchy</li>
                  <li>• More efficient use of space</li>
                  <li>• Improved scannability</li>
                  <li>• Better accessibility</li>
                  <li>• Reduced cognitive load</li>
                  <li>• Eliminated placeholder image dependency</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                🔮 Future Enhancements:
              </h4>
              <p className="text-blue-800">
                When actual thumbnails become available, you can easily
                implement the adaptive design pattern that automatically chooses
                between image-based and text-focused layouts based on content
                availability.
              </p>
            </div>
          </section>
          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
