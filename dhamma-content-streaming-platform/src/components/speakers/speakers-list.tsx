import { createClient } from "@/lib/supabase/server";
import { SpeakerCard } from "./speaker-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";
import type { Speaker } from "@/lib/types";

interface SpeakersListProps {
  readonly searchParams: {
    readonly [key: string]: string | string[] | undefined;
  };
}

export async function SpeakersList({ searchParams }: SpeakersListProps) {
  const supabase = await createClient();

  const search = searchParams.search as string;

  // Build query
  let query = supabase
    .from("speakers")
    .select("*")
    .order("name", { ascending: true });

  // Apply search filter
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: speakers, error } = await query;

  if (error) {
    console.error("Error fetching speakers:", error);
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Error loading speakers</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!speakers || speakers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No speakers found</h3>
        <p className="text-muted-foreground mb-4">
          {search
            ? "Try a different search term."
            : "No speakers available at the moment."}
        </p>
        {search && (
          <Button asChild variant="outline">
            <Link href="/speakers">View all speakers</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {speakers.length} teacher{speakers.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {speakers.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker as Speaker} />
        ))}
      </div>
    </div>
  );
}
