# Database Documentation for `dhamma_dataset.db`

## Overview

The SQLite database `dhamma_dataset.db` is designed to store and manage information about Dhamma content, such as audio, video, ebooks, or other types of resources. Below is a detailed description of its structure.

---

## Table: `dhamma_content`

This table contains metadata and details about various Dhamma resources.

### Columns

| Column Name          | Data Type | Constraints                                                 | Description                                   |
| -------------------- | --------- | ----------------------------------------------------------- | --------------------------------------------- |
| `id`                 | INTEGER   | PRIMARY KEY                                                 | Unique identifier for each record.            |
| `title`              | TEXT      | NOT NULL                                                    | Title of the content.                         |
| `speaker`            | TEXT      |                                                             | Name of the speaker or author.                |
| `content_type`       | TEXT      | CHECK(content_type IN ('audio', 'video', 'ebook', 'other')) | Type of content.                              |
| `file_url`           | TEXT      | NOT NULL, UNIQUE                                            | URL of the file.                              |
| `file_size_estimate` | INTEGER   |                                                             | Estimated size of the file in bytes.          |
| `duration_estimate`  | INTEGER   |                                                             | Estimated duration of the content in seconds. |
| `language`           | TEXT      | DEFAULT 'Myanmar'                                           | Language of the content.                      |
| `category`           | TEXT      |                                                             | Category of the content.                      |
| `tags`               | TEXT      |                                                             | Tags associated with the content.             |
| `description`        | TEXT      |                                                             | Description of the content.                   |
| `date_recorded`      | DATE      |                                                             | Date when the content was recorded.           |
| `source_page`        | TEXT      |                                                             | Source webpage of the content.                |
| `scraped_date`       | DATETIME  |                                                             | Date when the content was scraped.            |
| `created_at`         | DATETIME  | DEFAULT CURRENT_TIMESTAMP                                   | Timestamp when the record was created.        |

### Indexes

| Index Name         | Column Name    | Description                         |
| ------------------ | -------------- | ----------------------------------- |
| `idx_content_type` | `content_type` | Index on the `content_type` column. |
| `idx_speaker`      | `speaker`      | Index on the `speaker` column.      |
| `idx_category`     | `category`     | Index on the `category` column.     |
| `idx_language`     | `language`     | Index on the `language` column.     |
| `idx_source_page`  | `source_page`  | Index on the `source_page` column.  |

---

## Notes

- The `content_type` column ensures data integrity by restricting values to a predefined set (`audio`, `video`, `ebook`, `other`).
- The `language` column defaults to `Myanmar` if no value is provided.
- The `created_at` column automatically records the timestamp when a new record is inserted.

This documentation provides a comprehensive overview of the database structure and its purpose.
