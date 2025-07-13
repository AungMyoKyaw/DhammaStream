export type Speaker = {
  id: number;
  name: string;
  bio?: string;
  photo_url?: string;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type DhammaContent = {
  id: number;
  title: string;
  speaker_id?: number;
  content_type: "audio" | "video" | "ebook" | "other";
  file_url: string;
  file_size_estimate?: number;
  duration_estimate?: number;
  language: string;
  category_id?: number;
  description?: string;
  date_recorded?: string;
  source_page?: string;
  scraped_date?: string;
  created_at: string;
  // Relations
  speaker?: Speaker;
  category?: Category;
  tags?: Tag[];
};

export type ContentFilters = {
  search?: string;
  speaker_id?: number;
  category_id?: number;
  content_type?: string;
  language?: string;
  tag_ids?: number[];
};

export type Database = {
  public: {
    Tables: {
      speakers: {
        Row: Speaker;
        Insert: Omit<Speaker, "id" | "created_at">;
        Update: Partial<Omit<Speaker, "id" | "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id">;
        Update: Partial<Omit<Category, "id">>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, "id">;
        Update: Partial<Omit<Tag, "id">>;
      };
      dhamma_content: {
        Row: DhammaContent;
        Insert: Omit<
          DhammaContent,
          "id" | "created_at" | "speaker" | "category" | "tags"
        >;
        Update: Partial<
          Omit<
            DhammaContent,
            "id" | "created_at" | "speaker" | "category" | "tags"
          >
        >;
      };
      dhamma_content_tags: {
        Row: {
          content_id: number;
          tag_id: number;
        };
        Insert: {
          content_id: number;
          tag_id: number;
        };
        Update: never;
      };
    };
  };
};
