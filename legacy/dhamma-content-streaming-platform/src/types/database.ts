export interface Database {
  public: {
    Tables: {
      speakers: {
        Row: {
          id: number;
          name: string;
          bio: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          bio?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          bio?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
      };
      dhamma_content: {
        Row: {
          id: number;
          title: string;
          speaker_id: number | null;
          content_type: "audio" | "video" | "ebook" | "other";
          file_url: string;
          file_size_estimate: number | null;
          duration_estimate: number | null;
          language: string | null;
          category_id: number | null;
          description: string | null;
          date_recorded: string | null;
          source_page: string | null;
          scraped_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          speaker_id?: number | null;
          content_type: "audio" | "video" | "ebook" | "other";
          file_url: string;
          file_size_estimate?: number | null;
          duration_estimate?: number | null;
          language?: string | null;
          category_id?: number | null;
          description?: string | null;
          date_recorded?: string | null;
          source_page?: string | null;
          scraped_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          speaker_id?: number | null;
          content_type?: "audio" | "video" | "ebook" | "other";
          file_url?: string;
          file_size_estimate?: number | null;
          duration_estimate?: number | null;
          language?: string | null;
          category_id?: number | null;
          description?: string | null;
          date_recorded?: string | null;
          source_page?: string | null;
          scraped_date?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type Speaker = Database["public"]["Tables"]["speakers"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type DhammaContent =
  Database["public"]["Tables"]["dhamma_content"]["Row"];

// Extended types with relationships
export type DhammaContentWithRelations = DhammaContent & {
  speaker?: Speaker;
  category?: Category;
};

export type SpeakerWithContent = Speaker & {
  dhamma_content?: DhammaContent[];
};

// Resume playback types
export interface ResumeData {
  contentId: number;
  position: number;
  lastPlayed: string;
}
