import Link from "next/link";
import { ContentTypeIcons, FeatureIcons } from "@/components/ui/icons";
import { Navigation } from "@/components/Navigation";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Discover the Path to{" "}
            <span className="text-orange-600 dark:text-orange-400">
              Inner Peace
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Access authentic Buddhist teachings, guided meditations, and
            spiritual wisdom from renowned teachers around the world. Begin your
            journey towards mindfulness and enlightenment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/speakers"
              className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Explore Teachers
            </Link>
            <Link
              href="/browse/video"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-orange-50 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-gray-700 transition-colors font-semibold text-lg border border-orange-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Watch Videos
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Buddhist Content
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Choose from our collection of teachings, meditations, and
              spiritual resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Teachers & Speakers */}
            <Link href="/speakers" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <FeatureIcons.meditation className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Teachers & Speakers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Discover wisdom from renowned Buddhist teachers, meditation
                    masters, and spiritual guides.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline">
                    Meet Teachers →
                  </span>
                </div>
              </div>
            </Link>

            {/* Video Teachings */}
            <Link href="/browse/video" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <ContentTypeIcons.video className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Video Teachings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Watch inspiring dharma talks, guided meditations, and
                    Buddhist teachings from renowned teachers.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline">
                    Explore Videos →
                  </span>
                </div>
              </div>
            </Link>

            {/* Audio Content */}
            <Link href="/browse/audio" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <ContentTypeIcons.audio className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Audio Content
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Listen to podcasts, guided meditations, and spiritual
                    discussions on the path to enlightenment.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline">
                    Browse Audio →
                  </span>
                </div>
              </div>
            </Link>

            {/* Digital Books */}
            <Link href="/browse/ebook" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border border-orange-100 dark:border-gray-700 h-full">
                <div className="text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                    <ContentTypeIcons.ebook className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Digital Books
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Read Buddhist texts, meditation guides, and spiritual
                    literature to deepen your practice.
                  </p>
                  <span className="text-orange-600 dark:text-orange-400 font-medium group-hover:underline">
                    Read Books →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose DhammaStream?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Experience the best in Buddhist content with features designed for
              your spiritual journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                <FeatureIcons.play className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Resume Playback
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Never lose your place. Our smart resume feature remembers where
                you left off in any video or audio content.
              </p>
            </div>

            <div className="text-center">
              <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                <ContentTypeIcons.other className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Authentic Teachings
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Access genuine Buddhist content from verified teachers and
                traditional sources worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="text-orange-600 dark:text-orange-400 mb-4 flex justify-center">
                <FeatureIcons.globe className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Responsive Design
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Enjoy seamless access to teachings on any device - desktop,
                tablet, or mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold text-orange-400 mb-4">
              DhammaStream
            </h4>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Bringing authentic Buddhist teachings to seekers worldwide. May
              all beings find peace, wisdom, and liberation from suffering.
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/speakers"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Teachers
              </Link>
              <Link
                href="/browse/video"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Videos
              </Link>
              <Link
                href="/browse/audio"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Audio
              </Link>
              <Link
                href="/browse/ebook"
                className="text-gray-300 hover:text-orange-400 transition-colors"
              >
                Books
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-gray-400 text-sm">
              <p className="flex items-center justify-center space-x-2">
                <span>🙏</span>
                <span>
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
