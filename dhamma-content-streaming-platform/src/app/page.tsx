import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Users,
  BookOpen,
  Search,
  Headphones,
  Video,
  FileText
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-32 lg:py-40 xl:py-56 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-30">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <title>Soft Buddhist-themed gradient background</title>
            <path
              fill="url(#grad)"
              fillOpacity="1"
              d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,154.7C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e0c3fc" />
                <stop offset="100%" stopColor="#8ec5fc" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-primary drop-shadow-lg">
                Discover Buddhist Wisdom
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-2xl text-muted-foreground dark:text-gray-300 font-medium">
                Stream thousands of Dhamma talks, videos, and ebooks from
                renowned teachers.
                <br />
                Find peace and wisdom through authentic Buddhist content.
              </p>
              <span className="block text-base text-accent font-semibold mt-2">
                Your journey to enlightenment starts here.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <Button
                asChild
                size="lg"
                className="rounded-xl shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-primary/80 focus:scale-95"
              >
                <Link href="/content">
                  <Play className="mr-2 h-5 w-5" />
                  Start Exploring
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl shadow-lg transition-transform duration-200 hover:scale-105 hover:border-primary focus:scale-95"
              >
                <Link href="/speakers">
                  <Users className="mr-2 h-5 w-5" />
                  Browse Teachers
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <Headphones className="h-10 w-10 text-primary" />
                <CardTitle>Audio Teachings</CardTitle>
                <CardDescription>
                  Listen to Dhamma talks and guided meditations from experienced
                  teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Myanmar</Badge>
                  <Badge variant="secondary">English</Badge>
                  <Badge variant="secondary">Pali</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-primary" />
                <CardTitle>Video Content</CardTitle>
                <CardDescription>
                  Watch video teachings, ceremonies, and educational content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">HD Quality</Badge>
                  <Badge variant="secondary">Subtitles</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary" />
                <CardTitle>Digital Books</CardTitle>
                <CardDescription>
                  Read Buddhist texts, commentaries, and modern interpretations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">PDF</Badge>
                  <Badge variant="secondary">Free Access</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Explore by Category
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Find content organized by traditional Buddhist topics and modern
                applications
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Link href="/categories/abhidhamma" className="group">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-primary" />
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Abhidhamma
                  </CardTitle>
                  <CardDescription>
                    Systematic philosophy and psychology of Buddhism
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/categories/meditation" className="group">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Meditation
                  </CardTitle>
                  <CardDescription>
                    Guided meditations and contemplative practices
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/categories/suttas" className="group">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Suttas
                  </CardTitle>
                  <CardDescription>
                    Original discourses of the Buddha
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Your Journey Today
              </h2>
              <p className="mx-auto max-w-[600px] opacity-90 md:text-xl">
                Join thousands of practitioners exploring the path to
                enlightenment
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Search Content
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
