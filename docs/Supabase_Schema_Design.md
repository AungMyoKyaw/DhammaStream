# Supabase Schema Documentation for DhammaStream

## Overview

This document describes the recommended Supabase (PostgreSQL) schema for the DhammaStream project, following best practices for normalization, data integrity, and scalability.

## Tables

### 1. speakers

Stores information about each speaker.

| Column     | Type      | Constraints      | Description               |
| ---------- | --------- | ---------------- | ------------------------- |
| id         | SERIAL    | PRIMARY KEY      | Unique speaker ID         |
| name       | TEXT      | NOT NULL, UNIQUE | Speaker's full name       |
| bio        | TEXT      |                  | Speaker biography         |
| photo_url  | TEXT      |                  | URL to speaker's photo    |
| created_at | TIMESTAMP | DEFAULT now()    | Record creation timestamp |

### 2. dhamma_content

Stores metadata for each Dhamma content item (audio, video, ebook, etc.).

| Column             | Type      | Constraints                                               | Description                    |
| ------------------ | --------- | --------------------------------------------------------- | ------------------------------ |
| id                 | SERIAL    | PRIMARY KEY                                               | Unique content ID              |
| title              | TEXT      | NOT NULL                                                  | Title of the content           |
| speaker_id         | INTEGER   | REFERENCES speakers(id)                                   | Linked speaker                 |
| content_type       | TEXT      | CHECK (content_type IN ('audio','video','ebook','other')) | Type of content                |
| file_url           | TEXT      | NOT NULL, UNIQUE                                          | URL to the file                |
| file_size_estimate | INTEGER   |                                                           | File size in bytes (optional)  |
| duration_estimate  | INTEGER   |                                                           | Duration in seconds (optional) |
| language           | TEXT      | DEFAULT 'Myanmar'                                         | Language of the content        |
| category_id        | INTEGER   | REFERENCES categories(id)                                 | Linked category                |
| description        | TEXT      |                                                           | Description of the content     |
| date_recorded      | DATE      |                                                           | Date recorded                  |
| source_page        | TEXT      |                                                           | Source web page                |
| scraped_date       | TIMESTAMP |                                                           | Date scraped                   |
| created_at         | TIMESTAMP | DEFAULT now()                                             | Record creation timestamp      |

### 3. categories

Stores content categories (optional, for normalization).

| Column | Type   | Constraints      | Description        |
| ------ | ------ | ---------------- | ------------------ |
| id     | SERIAL | PRIMARY KEY      | Unique category ID |
| name   | TEXT   | NOT NULL, UNIQUE | Category name      |

### 4. tags

Stores tags for content (optional, for normalization).

| Column | Type   | Constraints      | Description   |
| ------ | ------ | ---------------- | ------------- |
| id     | SERIAL | PRIMARY KEY      | Unique tag ID |
| name   | TEXT   | NOT NULL, UNIQUE | Tag name      |

### 5. dhamma_content_tags

Many-to-many relationship between dhamma_content and tags.

| Column      | Type                 | Constraints                   | Description    |
| ----------- | -------------------- | ----------------------------- | -------------- |
| content_id  | INTEGER              | REFERENCES dhamma_content(id) | Linked content |
| tag_id      | INTEGER              | REFERENCES tags(id)           | Linked tag     |
| PRIMARY KEY | (content_id, tag_id) | Composite primary key         |

## Indexes

- Indexes should be created on foreign keys and frequently queried columns (e.g., content_type, language, speaker_id, category_id).

## Example ER Diagram

```
speakers (1) ────< dhamma_content >──── (M) categories
                        |
                        >──── (M:N) dhamma_content_tags <──── (M) tags
```

## Notes

- This schema is designed for Supabase/PostgreSQL and follows normalization best practices.
- You may add additional fields (e.g., for audit trails, user tracking) as needed.
- Use UUIDs instead of SERIAL for distributed systems if required.

---

_Last updated: July 12, 2025_
