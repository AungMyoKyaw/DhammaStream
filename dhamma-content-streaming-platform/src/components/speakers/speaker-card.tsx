import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Speaker } from "@/lib/types";

interface SpeakerCardProps {
  readonly speaker: Speaker;
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            {speaker.photo_url ? (
              <AvatarImage src={speaker.photo_url} alt={speaker.name} />
            ) : (
              <AvatarFallback className="bg-primary/10">
                {getInitials(speaker.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">
              <Link
                href={`/speakers/${speaker.id}`}
                className="hover:text-primary transition-colors"
              >
                {speaker.name}
              </Link>
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {speaker.bio && (
          <CardDescription className="line-clamp-3 mb-4">
            {speaker.bio}
          </CardDescription>
        )}

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/speakers/${speaker.id}`}>
            View Teachings
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
