import { Link } from "react-router-dom";
import { Play, BookOpen, Video, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { DevStatus } from "@/components/common/DevStatus";

interface ContentTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
  iconColor: string;
}

function ContentTypeCard({
  title,
  description,
  icon,
  href,
  bgColor,
  iconColor
}: ContentTypeCardProps) {
  return (
    <Link to={href} className="group">
      <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
        <div
          className={`w-16 h-16 ${bgColor} rounded-lg flex items-center justify-center mx-auto mb-6`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 text-center leading-relaxed">
          {description}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          Explore {title}
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const contentTypes = [
    {
      title: "Audio Teachings",
      description:
        "Listen to dharma talks, guided meditations, and spiritual teachings from renowned teachers around the world.",
      icon: <Headphones className="h-8 w-8" />,
      href: "/audios",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Video Teachings",
      description:
        "Watch dharma talks, meditation instructions, and visual teachings that bring wisdom to life.",
      icon: <Video className="h-8 w-8" />,
      href: "/videos",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "E-books",
      description:
        "Read profound dharma texts, spiritual literature, and timeless wisdom from Buddhist masters.",
      icon: <BookOpen className="h-8 w-8" />,
      href: "/pdfs",
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* Development Status */}
      <DevStatus />

      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Welcome to DhammaStream
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          Discover and stream thousands of dharma teachings, meditations, and
          wisdom content from renowned teachers around the world. Choose your
          preferred format to begin your spiritual journey.
        </p>
        <Link to="/browse">
          <Button size="lg" className="px-8 py-3">
            <Play className="h-5 w-5 mr-2" />
            Start Exploring
          </Button>
        </Link>
      </section>

      {/* Content Type Selection */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Learning Format
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the type of content you'd like to explore. Each format offers
            a unique way to engage with dharma teachings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contentTypes.map((type) => (
            <ContentTypeCard
              key={type.title}
              title={type.title}
              description={type.description}
              icon={type.icon}
              href={type.href}
              bgColor={type.bgColor}
              iconColor={type.iconColor}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card border border-border rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Three simple steps to access profound dharma teachings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Choose Format
            </h3>
            <p className="text-sm text-muted-foreground">
              Select whether you want to listen, watch, or read
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Pick a Teacher
            </h3>
            <p className="text-sm text-muted-foreground">
              Browse renowned teachers and spiritual masters
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Start Learning
            </h3>
            <p className="text-sm text-muted-foreground">
              Access their teachings and begin your journey
            </p>
          </div>
        </div>
      </section>

      {/* Browse All Content CTA */}
      <section className="text-center py-8">
        <div className="bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Want to Browse Everything?
          </h2>
          <p className="text-muted-foreground mb-6">
            Explore all content types at once with our advanced search and
            filtering options
          </p>
          <Link to="/browse">
            <Button variant="secondary" size="lg">
              Browse All Content
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
