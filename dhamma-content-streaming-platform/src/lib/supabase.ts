import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries
export const queries = {
  // Get all speakers
  getSpeakers: () => {
    return supabase.from("speakers").select("*").order("name");
  },

  // Get speaker by ID with their content
  getSpeakerWithContent: (id: number) => {
    return supabase
      .from("speakers")
      .select(
        `
        *,
        dhamma_content (
          *,
          categories (*)
        )
      `
      )
      .eq("id", id)
      .single();
  },

  // Get all categories
  getCategories: () => {
    return supabase.from("categories").select("*").order("name");
  },

  // Get content by type
  getContentByType: (contentType: "audio" | "video" | "ebook" | "other") => {
    return supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speakers (*),
        categories (*)
      `
      )
      .eq("content_type", contentType)
      .order("created_at", { ascending: false });
  },

  // Get content by category
  getContentByCategory: (categoryId: number) => {
    return supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speakers (*),
        categories (*)
      `
      )
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });
  },

  // Get content by ID
  getContentById: (id: number) => {
    return supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speakers (*),
        categories (*)
      `
      )
      .eq("id", id)
      .single();
  },

  // Search content (title only, no description)
  searchContent: (query: string) => {
    return supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speakers (*),
        categories (*)
      `
      )
      .ilike("title", `%${query}%`)
      .order("created_at", { ascending: false });
  },

  // Paginated content by type with optional search
  getContentByTypeWithPagination: async (
    contentType: "audio" | "video" | "ebook" | "other",
    page: number = 1,
    pageSize: number = 12,
    searchQuery?: string
  ) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speakers (*),
        categories (*)
      `,
        { count: "exact" }
      )
      .eq("content_type", contentType);

    if (searchQuery?.trim()) {
      query = query.ilike("title", `%${searchQuery.trim()}%`);
    }

    return query.order("created_at", { ascending: false }).range(from, to);
  },

  // Search across all content types with pagination
  searchAllContentWithPagination: async (
    searchQuery: string,
    page: number = 1,
    pageSize: number = 12
  ) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    return supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speakers (*),
        categories (*)
      `,
        { count: "exact" }
      )
      .ilike("title", `%${searchQuery.trim()}%`)
      .order("created_at", { ascending: false })
      .range(from, to);
  },

  // Get recent content
  getRecentContent: (limit: number = 10) => {
    return supabase
      .from("dhamma_content")
      .select(
        `
        *,
        speakers (*),
        categories (*)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);
  }
};
