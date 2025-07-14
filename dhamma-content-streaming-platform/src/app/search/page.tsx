import { EnhancedSearch } from "@/components/search/enhanced-search";

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Search Dhamma Content
        </h1>
        <p className="text-muted-foreground">
          Find teachings, speakers, and topics that resonate with your practice
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <EnhancedSearch />
      </div>
    </div>
  );
}
