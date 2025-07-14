"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLiveRegion } from "@/components/ui/live-region";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Bookmark,
  Star,
  Folder,
  FolderPlus,
  Search,
  Calendar,
  Clock,
  Tag,
  StickyNote,
  Filter,
  ChevronDown,
  ChevronRight,
  Heart,
  Share2,
  Download,
  Play
} from "lucide-react";

interface BookmarkNote {
  id: string;
  content: string;
  timestamp: number;
  position?: number; // For time-based notes in audio/video
}

interface BookmarkCollection {
  id: string;
  name: string;
  description: string;
  color: string;
  isDefault?: boolean;
  contentIds: string[];
  createdAt: number;
}

interface ContentBookmark {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: string;
  speaker: string;
  duration?: number;
  position?: number; // Current playback position
  isFavorite: boolean;
  rating: number; // 1-5 stars
  collections: string[];
  notes: BookmarkNote[];
  tags: string[];
  dateAdded: number;
  lastAccessed?: number;
  accessCount: number;
}

const BOOKMARK_STORAGE_KEY = "dhamma-bookmarks";
const COLLECTIONS_STORAGE_KEY = "dhamma-bookmark-collections";

const DEFAULT_COLLECTIONS: BookmarkCollection[] = [
  {
    id: "favorites",
    name: "Favorites",
    description: "Your favorite content",
    color: "red",
    isDefault: true,
    contentIds: [],
    createdAt: Date.now()
  },
  {
    id: "to-listen",
    name: "To Listen",
    description: "Content to listen to later",
    color: "blue",
    isDefault: true,
    contentIds: [],
    createdAt: Date.now()
  },
  {
    id: "currently-studying",
    name: "Currently Studying",
    description: "Content you are actively studying",
    color: "green",
    isDefault: true,
    contentIds: [],
    createdAt: Date.now()
  }
];

export function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState<ContentBookmark[]>([]);
  const [collections, setCollections] =
    useState<BookmarkCollection[]>(DEFAULT_COLLECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "rating" | "access">(
    "date"
  );
  const [filterBy, setFilterBy] = useState<
    "all" | "favorites" | "rated" | "noted"
  >("all");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState("blue");
  const { announce } = useLiveRegion();

  // Load bookmarks and collections from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return; // Server-side check

    const savedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    const savedCollections = localStorage.getItem(COLLECTIONS_STORAGE_KEY);

    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    } else {
      localStorage.setItem(
        COLLECTIONS_STORAGE_KEY,
        JSON.stringify(DEFAULT_COLLECTIONS)
      );
    }
  }, []);

  // Save bookmarks to localStorage
  const saveBookmarks = useCallback((newBookmarks: ContentBookmark[]) => {
    setBookmarks(newBookmarks);
    if (typeof window !== "undefined") {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(newBookmarks));
    }
  }, []);

  // Save collections to localStorage
  const saveCollections = useCallback(
    (newCollections: BookmarkCollection[]) => {
      setCollections(newCollections);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          COLLECTIONS_STORAGE_KEY,
          JSON.stringify(newCollections)
        );
      }
    },
    []
  );

  // Create new collection
  const createCollection = useCallback(() => {
    if (!newCollectionName.trim()) return;

    const newCollection: BookmarkCollection = {
      id: `collection-${Date.now()}`,
      name: newCollectionName.trim(),
      description: newCollectionDescription.trim(),
      color: newCollectionColor,
      contentIds: [],
      createdAt: Date.now()
    };

    const updatedCollections = [...collections, newCollection];
    saveCollections(updatedCollections);

    setNewCollectionName("");
    setNewCollectionDescription("");
    setNewCollectionColor("blue");

    announce(`Collection "${newCollection.name}" created`);
  }, [
    newCollectionName,
    newCollectionDescription,
    newCollectionColor,
    collections,
    saveCollections,
    announce
  ]);

  // Add note to bookmark (currently not used in UI but available for future use)
  // const addNote = useCallback((bookmarkId: string, content: string, position?: number) => {
  //   const updatedBookmarks = bookmarks.map(bookmark => {
  //     if (bookmark.id === bookmarkId) {
  //       const newNote: BookmarkNote = {
  //         id: `note-${Date.now()}`,
  //         content: content.trim(),
  //         timestamp: Date.now(),
  //         position
  //       };
  //       return {
  //         ...bookmark,
  //         notes: [...bookmark.notes, newNote]
  //       };
  //     }
  //     return bookmark;
  //   });
  //
  //   saveBookmarks(updatedBookmarks);
  //   announce('Note added to bookmark');
  // }, [bookmarks, saveBookmarks, announce]);

  // Remove note from bookmark
  const removeNote = useCallback(
    (bookmarkId: string, noteId: string) => {
      const updatedBookmarks = bookmarks.map((bookmark) => {
        if (bookmark.id === bookmarkId) {
          return {
            ...bookmark,
            notes: bookmark.notes.filter((note) => note.id !== noteId)
          };
        }
        return bookmark;
      });

      saveBookmarks(updatedBookmarks);
      announce("Note removed from bookmark");
    },
    [bookmarks, saveBookmarks, announce]
  );

  // Update bookmark rating
  const updateRating = useCallback(
    (bookmarkId: string, rating: number) => {
      const updatedBookmarks = bookmarks.map((bookmark) => {
        if (bookmark.id === bookmarkId) {
          return { ...bookmark, rating };
        }
        return bookmark;
      });

      saveBookmarks(updatedBookmarks);
      announce(`Rating updated to ${rating} stars`);
    },
    [bookmarks, saveBookmarks, announce]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (bookmarkId: string) => {
      const updatedBookmarks = bookmarks.map((bookmark) => {
        if (bookmark.id === bookmarkId) {
          return { ...bookmark, isFavorite: !bookmark.isFavorite };
        }
        return bookmark;
      });

      saveBookmarks(updatedBookmarks);

      const bookmark = bookmarks.find((b) => b.id === bookmarkId);
      announce(
        bookmark?.isFavorite ? "Removed from favorites" : "Added to favorites"
      );
    },
    [bookmarks, saveBookmarks, announce]
  );

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bookmark) =>
          bookmark.contentTitle.toLowerCase().includes(query) ||
          bookmark.speaker.toLowerCase().includes(query) ||
          bookmark.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          bookmark.notes.some((note) =>
            note.content.toLowerCase().includes(query)
          )
      );
    }

    // Apply collection filter
    if (selectedCollection !== "all") {
      filtered = filtered.filter((bookmark) =>
        bookmark.collections.includes(selectedCollection)
      );
    }

    // Apply type filter
    switch (filterBy) {
      case "favorites":
        filtered = filtered.filter((bookmark) => bookmark.isFavorite);
        break;
      case "rated":
        filtered = filtered.filter((bookmark) => bookmark.rating > 0);
        break;
      case "noted":
        filtered = filtered.filter((bookmark) => bookmark.notes.length > 0);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.contentTitle.localeCompare(b.contentTitle);
        case "rating":
          return b.rating - a.rating;
        case "access":
          return (b.lastAccessed || 0) - (a.lastAccessed || 0);
        default: // date
          return b.dateAdded - a.dateAdded;
      }
    });

    return filtered;
  }, [bookmarks, searchQuery, selectedCollection, filterBy, sortBy]);

  // Render star rating
  const renderStarRating = useCallback(
    (rating: number, onRatingChange?: (rating: number) => void) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => onRatingChange?.(i)}
            className={`p-1 rounded ${
              i <= rating
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-gray-300 hover:text-yellow-400"
            } ${onRatingChange ? "cursor-pointer" : "cursor-default"}`}
            disabled={!onRatingChange}
            aria-label={`${i} star${i !== 1 ? "s" : ""}`}
          >
            <Star
              className="h-4 w-4"
              fill={i <= rating ? "currentColor" : "none"}
            />
          </button>
        );
      }
      return stars;
    },
    []
  );

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Bookmarks</h2>
          <p className="text-muted-foreground">
            Organize and manage your saved Dhamma content
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredAndSortedBookmarks.length} bookmark
          {filteredAndSortedBookmarks.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Tabs defaultValue="bookmarks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks, notes, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {isFiltersExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>

            <Collapsible open={isFiltersExpanded}>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="collection-filter">Collection</Label>
                    <Select
                      value={selectedCollection}
                      onValueChange={setSelectedCollection}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Collections</SelectItem>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full bg-${collection.color}-500`}
                              />
                              {collection.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select
                      value={sortBy}
                      onValueChange={(
                        value: "date" | "title" | "rating" | "access"
                      ) => setSortBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date Added</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="access">Last Accessed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filter-by">Filter By</Label>
                    <Select
                      value={filterBy}
                      onValueChange={(
                        value: "all" | "favorites" | "rated" | "noted"
                      ) => setFilterBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="favorites">
                          Favorites Only
                        </SelectItem>
                        <SelectItem value="rated">Rated Only</SelectItem>
                        <SelectItem value="noted">With Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-4">
            {filteredAndSortedBookmarks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No bookmarks found
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {searchQuery ||
                    selectedCollection !== "all" ||
                    filterBy !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Start bookmarking content to see it here. Look for the bookmark icon on content pages."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAndSortedBookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">
                          {bookmark.contentTitle}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{bookmark.speaker}</span>
                          <Badge variant="outline" className="text-xs">
                            {bookmark.contentType}
                          </Badge>
                          {bookmark.duration && (
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(bookmark.duration)}
                            </span>
                          )}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(bookmark.id)}
                          className={`p-2 rounded-full transition-colors ${
                            bookmark.isFavorite
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-400 hover:text-red-500"
                          }`}
                          aria-label={
                            bookmark.isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          {bookmark.isFavorite ? (
                            <Heart className="h-5 w-5" fill="currentColor" />
                          ) : (
                            <Heart className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Rating:
                      </span>
                      <div className="flex">
                        {renderStarRating(bookmark.rating, (rating) =>
                          updateRating(bookmark.id, rating)
                        )}
                      </div>
                    </div>

                    {/* Progress Bar (for audio/video) */}
                    {bookmark.position && bookmark.duration && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {Math.round(
                              (bookmark.position / bookmark.duration) * 100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(bookmark.position / bookmark.duration) * 100}%`
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDuration(bookmark.position)} /{" "}
                          {formatDuration(bookmark.duration)}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {bookmark.tags.map((tag) => (
                          <Badge
                            key={`${bookmark.id}-${tag}`}
                            variant="outline"
                            className="text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {bookmark.notes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <StickyNote className="h-4 w-4" />
                          Notes ({bookmark.notes.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {bookmark.notes.map((note) => (
                            <div
                              key={note.id}
                              className="p-3 bg-muted rounded-lg text-sm"
                            >
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(
                                    note.timestamp
                                  ).toLocaleDateString()}
                                  {note.position && (
                                    <>
                                      <Clock className="h-3 w-3 ml-2" />
                                      {formatDuration(note.position)}
                                    </>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeNote(bookmark.id, note.id)
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  ×
                                </Button>
                              </div>
                              <p>{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collections */}
                    {bookmark.collections.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <Folder className="h-4 w-4" />
                          Collections
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {bookmark.collections.map((collectionId) => {
                            const collection = collections.find(
                              (c) => c.id === collectionId
                            );
                            return collection ? (
                              <Badge
                                key={collectionId}
                                variant="secondary"
                                className="text-xs"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full bg-${collection.color}-500 mr-1`}
                                />
                                {collection.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Added{" "}
                          {new Date(bookmark.dateAdded).toLocaleDateString()}
                        </span>
                        {bookmark.lastAccessed && (
                          <span>
                            • Last accessed{" "}
                            {new Date(
                              bookmark.lastAccessed
                            ).toLocaleDateString()}
                          </span>
                        )}
                        <span>• {bookmark.accessCount} plays</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          {/* Create New Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Create New Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collection-name">Collection Name</Label>
                  <Input
                    id="collection-name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Enter collection name..."
                  />
                </div>
                <div>
                  <Label htmlFor="collection-color">Color</Label>
                  <Select
                    value={newCollectionColor}
                    onValueChange={setNewCollectionColor}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="indigo">Indigo</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="collection-description">
                  Description (Optional)
                </Label>
                <Input
                  id="collection-description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe this collection..."
                />
              </div>
              <Button
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
              >
                Create Collection
              </Button>
            </CardContent>
          </Card>

          {/* Collections List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="group hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${collection.color}-500`}
                    />
                    {collection.name}
                    {collection.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items:</span>
                      <Badge variant="secondary">
                        {collection.contentIds.length}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Hook to use bookmark functionality in other components
export function useBookmarks() {
  const { announce } = useLiveRegion();

  const addBookmark = useCallback(
    (
      content: {
        id: string;
        title: string;
        type: string;
        speaker?: string;
        author?: string;
        duration?: number;
        tags?: string[];
      },
      position?: number
    ) => {
      if (typeof window === "undefined") return false; // Server-side check

      const savedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      const bookmarks: ContentBookmark[] = savedBookmarks
        ? JSON.parse(savedBookmarks)
        : [];

      // Check if already bookmarked
      const existingBookmark = bookmarks.find(
        (b) => b.contentId === content.id
      );
      if (existingBookmark) {
        announce("Content is already bookmarked");
        return false;
      }

      const newBookmark: ContentBookmark = {
        id: `bookmark-${Date.now()}`,
        contentId: content.id,
        contentTitle: content.title,
        contentType: content.type,
        speaker: content.speaker || content.author || "Unknown",
        duration: content.duration,
        position,
        isFavorite: false,
        rating: 0,
        collections: ["to-listen"], // Default to "To Listen" collection
        notes: [],
        tags: content.tags || [],
        dateAdded: Date.now(),
        accessCount: 0
      };

      const updatedBookmarks = [...bookmarks, newBookmark];
      localStorage.setItem(
        BOOKMARK_STORAGE_KEY,
        JSON.stringify(updatedBookmarks)
      );

      announce("Content bookmarked successfully");
      return true;
    },
    [announce]
  );

  const removeBookmark = useCallback(
    (contentId: string) => {
      if (typeof window === "undefined") return false; // Server-side check

      const savedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      const bookmarks: ContentBookmark[] = savedBookmarks
        ? JSON.parse(savedBookmarks)
        : [];

      const updatedBookmarks = bookmarks.filter(
        (b) => b.contentId !== contentId
      );
      localStorage.setItem(
        BOOKMARK_STORAGE_KEY,
        JSON.stringify(updatedBookmarks)
      );

      announce("Bookmark removed");
      return true;
    },
    [announce]
  );

  const isBookmarked = useCallback((contentId: string) => {
    if (typeof window === "undefined") return false; // Server-side check

    const savedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    const bookmarks: ContentBookmark[] = savedBookmarks
      ? JSON.parse(savedBookmarks)
      : [];

    return bookmarks.some((b) => b.contentId === contentId);
  }, []);

  const updateProgress = useCallback((contentId: string, position: number) => {
    if (typeof window === "undefined") return; // Server-side check

    const savedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    const bookmarks: ContentBookmark[] = savedBookmarks
      ? JSON.parse(savedBookmarks)
      : [];

    const updatedBookmarks = bookmarks.map((bookmark) => {
      if (bookmark.contentId === contentId) {
        return {
          ...bookmark,
          position,
          lastAccessed: Date.now(),
          accessCount: bookmark.accessCount + 1
        };
      }
      return bookmark;
    });

    localStorage.setItem(
      BOOKMARK_STORAGE_KEY,
      JSON.stringify(updatedBookmarks)
    );
  }, []);

  return {
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateProgress
  };
}
