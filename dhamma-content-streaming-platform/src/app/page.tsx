import { Suspense } from "react";
import Link from "next/link";
import { ContentTypeIcons, FeatureIcons } from "@/components/ui/icons";
// ...existing code...
// Removed LearningPaths import

import { Navigation } from "@/components/Navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>

      {/* Hero Section */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Discover the Path to{" "}
            <span className="text-orange-600 dark:text-orange-400">
              Inner Peace
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            Access authentic Buddhist teachings, guided meditations, and
            spiritual wisdom from renowned teachers around the world. Begin your
            journey towards mindfulness and enlightenment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/speakers"
              className="bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Explore Teachers
            </Link>
            <Link
              href="/browse/video"
              className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-orange-50 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-gray-700 transition-colors font-semibold text-base sm:text-lg border border-orange-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Watch Videos
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Buddhist Content
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
              Choose from our collection of teachings, meditations, and
              spiritual resources
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Teachers & Speakers */}
            <Link href="/speakers" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 md:p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <FeatureIcons.Meditation className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Teachers & Speakers
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
                    Discover wisdom from renowned Buddhist teachers, meditation
                    masters, and spiritual guides.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline text-sm md:text-base">
                    Meet Teachers →
                  </span>
                </div>
              </div>
            </Link>

            {/* Video Teachings */}
            <Link href="/browse/video" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 md:p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <ContentTypeIcons.Video className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Video Teachings
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
                    Watch inspiring dharma talks, guided meditations, and
                    Buddhist teachings from renowned teachers.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline text-sm md:text-base">
                    Explore Videos →
                  </span>
                </div>
              </div>
            </Link>

            {/* Audio Content */}
            <Link href="/browse/audio" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 md:p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <ContentTypeIcons.Audio className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Audio Content
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
                    Listen to podcasts, guided meditations, and spiritual
                    discussions on the path to enlightenment.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline text-sm md:text-base">
                    Browse Audio →
                  </span>
                </div>
              </div>
            </Link>

            {/* Digital Books */}
            <Link href="/browse/ebook" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 md:p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <ContentTypeIcons.Ebook className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Digital Books
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
                    Read Buddhist texts, meditation guides, and spiritual
                    literature to deepen your practice.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline text-sm md:text-base">
                    Read Books →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose DhammaStream?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
              Experience the best in Buddhist content with features designed for
              your spiritual journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                <FeatureIcons.Play className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Resume Playback
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                Never lose your place. Our smart resume feature remembers where
                you left off in any video or audio content.
              </p>
            </div>

            <div className="text-center">
              <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                <ContentTypeIcons.Other className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Authentic Teachings
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                Access genuine Buddhist content from verified teachers and
                traditional sources worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                <FeatureIcons.Globe className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Responsive Design
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                Enjoy seamless access to teachings on any device - desktop,
                tablet, or mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Info Section */}
      <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Data Source Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center border border-orange-100 dark:border-gray-700">
              <div className="mb-4 text-orange-600 dark:text-orange-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 md:h-10 md:w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>Data Source Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6l4 2"
                  />
                </svg>
              </div>
              <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Data Source
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4 text-sm md:text-base">
                This project is built using the catalog database available at{" "}
                <span className="font-semibold">Myanmar Dhamma Catalog</span>.
              </p>
              <a
                href="https://github.com/AungMyoKyaw/myanmar-dhamma-catalog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-orange-600 dark:text-orange-400 font-medium hover:underline transition-colors text-sm md:text-base"
              >
                Visit Myanmar Dhamma Catalog
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>External Link</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 7l-10 10M17 7h-6m6 0v6"
                  />
                </svg>
              </a>
            </div>
            {/* Open Source Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center border border-orange-100 dark:border-gray-700">
              <div className="mb-4 text-orange-600 dark:text-orange-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 md:h-10 md:w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>Open Source Icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 01-8 0"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Open Source Notice
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4 text-sm md:text-base">
                This is an open-source project. You can view the source code at
                the DhammaStream GitHub Repository.
              </p>
              <a
                href="https://github.com/AungMyoKyaw/DhammaStream"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-orange-600 dark:text-orange-400 font-medium hover:underline transition-colors text-sm md:text-base"
              >
                View on GitHub
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>External Link</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 7l-10 10M17 7h-6m6 0v6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-xl md:text-2xl font-bold text-orange-400 mb-2">
              DhammaStream
            </h4>
            <p className="text-gray-300 mb-4 max-w-2xl mx-auto text-sm md:text-base">
              Bringing authentic Buddhist teachings to seekers worldwide. May
              all beings find peace, wisdom, and liberation from suffering.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link
                href="/speakers"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm md:text-base"
              >
                Teachers
              </Link>
              <Link
                href="/browse/video"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm md:text-base"
              >
                Videos
              </Link>
              <Link
                href="/browse/audio"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm md:text-base"
              >
                Audio
              </Link>
              <Link
                href="/browse/ebook"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm md:text-base"
              >
                Books
              </Link>
            </div>
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-700 text-gray-400 text-xs md:text-sm">
              <p className="flex items-center justify-center space-x-2">
                <span>🙏</span>
                <span className="text-center">
                  May all beings be happy, peaceful, and free from suffering
                </span>
                <span>🙏</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
