import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Play, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 group mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <Play className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight text-primary">
                DhammaStream
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your gateway to authentic Buddhist wisdom. Stream thousands of
              Dhamma talks, videos, and ebooks from renowned teachers.
            </p>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Content</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/content"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Browse All Content
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/audio"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Audio Teachings
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/video"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Video Content
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/ebook"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Digital Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/categories/abhidhamma"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Abhidhamma
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/meditation"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Meditation
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/suttas"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Suttas
                </Link>
              </li>
              <li>
                <Link
                  href="/speakers"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Teachers
                </Link>
              </li>
            </ul>
          </div>

          {/* Search & Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/search"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Search Content
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  All Categories
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DhammaStream. Made with{" "}
            <Heart className="inline h-4 w-4 text-red-500 fill-current" /> for
            the Dharma community.
          </p>
          <p className="text-sm text-muted-foreground">
            May all beings be happy and free from suffering.
          </p>
        </div>
      </div>
    </footer>
  );
}
