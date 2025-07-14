import { BookmarkManager } from "@/components/content/bookmark-manager";

export default function BookmarksPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <BookmarkManager />
    </div>
  );
}

export const metadata = {
  title: "My Bookmarks - DhammaStream",
  description:
    "Manage your saved Dhamma content, create collections, and organize your learning journey."
};
