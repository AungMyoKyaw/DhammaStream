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

### 6. featured_entities

Generic table for tracking featured speakers, content, or other entities.

| Column      | Type      | Constraints   | Description                                  |
| ----------- | --------- | ------------- | -------------------------------------------- |
| id          | SERIAL    | PRIMARY KEY   | Unique feature record ID                     |
| entity_type | TEXT      | NOT NULL      | Type of entity ('speaker', 'content', etc.)  |
| entity_id   | INTEGER   | NOT NULL      | ID of the entity (references relevant table) |
| featured_at | TIMESTAMP | DEFAULT now() | When the entity was featured                 |
| expires_at  | TIMESTAMP |               | When the feature expires (optional)          |
| context     | TEXT      |               | Context or reason for featuring (optional)   |

**Notes:**

- `entity_type` should be constrained to known types (e.g., 'speaker', 'content') via application logic or a CHECK constraint.
- `entity_id` refers to the primary key of the relevant table, depending on `entity_type`.
- Foreign key constraints cannot be enforced at the DB level for polymorphic associations; integrity must be managed in application logic.

## Indexes

- Indexes should be created on foreign keys and frequently queried columns (e.g., content_type, language, speaker_id, category_id).
- For `featured_entities`, consider an index on (`entity_type`, `entity_id`) for efficient lookups.

## Example ER Diagram

```
speakers (1) ────< dhamma_content >──── (M) categories
                        |
                        >──── (M:N) dhamma_content_tags <──── (M) tags

featured_entities
    |-- entity_type = 'speaker' --> speakers
    |-- entity_type = 'content' --> dhamma_content
```

## Notes

- This schema is designed for Supabase/PostgreSQL and follows normalization best practices.
- You may add additional fields (e.g., for audit trails, user tracking) as needed.
- Use UUIDs instead of SERIAL for distributed systems if required.
- The `featured_entities` table provides a flexible, scalable way to feature any entity (speaker, content, etc.) in one place. This is useful for future extensibility and centralized management, but requires application-level enforcement of data integrity.

### Pros and Cons of the Generic Feature Table

**Pros:**

- Highly flexible and scalable for any entity type.
- Centralized management of all featured items.
- Can store additional metadata (e.g., when/why featured, expiration).

**Cons:**

- No strict foreign key constraints; integrity must be managed in application logic.
- Slightly more complex queries (must filter by `entity_type` and join to the correct table).

---

_Last updated: July 12, 2025_
