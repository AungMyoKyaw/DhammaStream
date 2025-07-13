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
      <section className="w-full py-12 md:py-20 lg:py-28 xl:py-36 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-20">
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
          <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-primary drop-shadow-sm">
                Discover Buddhist Wisdom
              </h1>
              <p className="mx-auto max-w-[700px] text-base sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                Stream thousands of Dhamma talks, videos, and ebooks from
                renowned teachers.
                <br className="hidden sm:block" />
                Find peace and wisdom through authentic Buddhist content.
              </p>
              <span className="block text-sm sm:text-base text-accent font-semibold mt-3">
                Your journey to enlightenment starts here.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:scale-95 w-full sm:w-auto"
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
                className="rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:scale-95 w-full sm:w-auto"
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
      <section className="w-full py-12 md:py-20 lg:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary mb-4">
              Explore Sacred Teachings
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access a comprehensive library of Buddhist content in multiple
              formats and languages
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Headphones className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Audio Teachings</CardTitle>
                <CardDescription className="text-base">
                  Listen to Dhamma talks and guided meditations from experienced
                  teachers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Myanmar
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    English
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Pali
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Video Content</CardTitle>
                <CardDescription className="text-base">
                  Watch video teachings, ceremonies, and educational content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    HD Quality
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Subtitles
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Digital Books</CardTitle>
                <CardDescription className="text-base">
                  Read Buddhist texts, commentaries, and modern interpretations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    PDF
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Free Access
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-12 md:py-20 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                Explore by Category
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                Find content organized by traditional Buddhist topics and modern
                applications
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-12">
            <Link href="/categories/abhidhamma" className="group">
              <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors text-xl">
                    Abhidhamma
                  </CardTitle>
                  <CardDescription className="text-base">
                    Systematic philosophy and psychology of Buddhism
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/categories/meditation" className="group">
              <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors text-xl">
                    Meditation
                  </CardTitle>
                  <CardDescription className="text-base">
                    Guided meditations and contemplative practices
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/categories/suttas" className="group">
              <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors text-xl">
                    Suttas
                  </CardTitle>
                  <CardDescription className="text-base">
                    Original discourses of the Buddha
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-20 lg:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-6 text-center max-w-3xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Start Your Journey Today
              </h2>
              <p className="mx-auto max-w-[600px] opacity-90 text-base sm:text-lg leading-relaxed">
                Join thousands of practitioners exploring the path to
                enlightenment through authentic Buddhist teachings
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Search Content
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-xl shadow-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-200 hover:scale-105"
              >
                <Link href="/content">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse All
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
