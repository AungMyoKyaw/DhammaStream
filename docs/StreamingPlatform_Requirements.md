# Dhamma Content Streaming Platform - Requirements (2025)

## Tech Stack

- **Frontend:** Next.js (React framework for SSR, SSG, API routes)
- **UI Components:** Shadcn UI (modern, accessible React component library)
- **Backend:** Supabase/PostgreSQL

These choices ensure a modern, responsive, and extensible platform with a clean, accessible UI and rapid development capabilities. The stack is selected for scalability, maintainability, and rapid iteration.

## Overview

A web and mobile platform for streaming, browsing, and searching Dhamma content (audio, video, ebooks) with rich metadata, speaker profiles, and advanced filtering. The platform is designed for high availability, accessibility, and future extensibility.

---

## Functional Requirements

### Content Browsing & Streaming

- Users can browse all Dhamma content with intuitive navigation.
- Users can stream audio and video content directly in-browser and on mobile.
- Users can view and download ebooks in supported formats.

### Search & Advanced Filtering

- Users can search content by title, description, speaker, or any metadata field.
- Users can filter content by:
  - Speaker
  - Category
  - Tag
  - Content type (audio, video, ebook)
  - Language
  - Date recorded
  - Duration
- Search and filtering leverage rich, consistent, and up-to-date metadata.

### Speaker Directory

- Users can view a list of all speakers.
- Each speaker has a profile page with:
  - Name, bio, photo
  - List of all their content

### Categories & Tags

- Users can browse content by category or tag.
- Each category/tag has a page listing all related content.

### Content Details

- Each content item has a detail page with:
  - Title, description, speaker, category, tags, language, file size, duration, date recorded, source page, and file link.
  - Metadata is always up-to-date and accurate.

### Responsive UI

- Platform is accessible and fully responsive on desktop and mobile devices, powered by Next.js and Shadcn UI for a modern, accessible user experience.

### Extensibility

- System is designed to support future features (user accounts, recommendations, analytics) with minimal disruption, leveraging Next.js’s modular architecture and Shadcn UI’s composable components.

---

## Non-Functional Requirements

- Fast and scalable backend (Supabase/PostgreSQL).
- Secure file access and streaming with proper authentication and authorization.
- Clean, accessible, and user-friendly UI.
- Support for future extensibility (e.g., user accounts, featured content).
- Consistent and up-to-date metadata across all content.
- Automated workflow monitoring for content ingestion, processing, and metadata extraction.
- High availability and reliability for streaming and search.
- Compliance with copyright and content guidelines.
- Data privacy and security for user and content data.
- Efficient admin tools for managing content and metadata.

---

## Data Model Mapping

- `dhamma_content`: Main content items.
- `speakers`: Speaker profiles.
- `categories`: Content categories.
- `tags` & `dhamma_content_tags`: Tagging system.

---

## Out of Scope (for now)

- User accounts, bookmarks, or history.
- Featured entities or content.
- User-generated content or comments.

---

## Future Extensions

- Add user accounts and personalization.
- Add featured content/entities.
- Add analytics and content recommendations.

---

_Note: Requirements updated for clarity, alignment with 2025 best practices, and future extensibility (July 13, 2025)._

---

---

**Review Note (July 13, 2025):**
All requirements have been reviewed for completeness and consistency. The document is up-to-date, clear, and aligned with current best practices for streaming platforms, metadata, search, and workflow monitoring. Future updates should continue to follow industry standards and platform needs.

_Last updated: July 13, 2025_
