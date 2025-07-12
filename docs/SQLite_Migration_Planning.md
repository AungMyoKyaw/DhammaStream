# Planning: Generating Normalized SQLite Databases from dhamma_dataset.db

## Purpose

This document outlines the plan for creating new, normalized SQLite databases for the DhammaStream project, based on the Supabase schema described in `Supabase_Schema_Design.md`. The process will use the existing `dhamma_dataset.db` as the primary data source.

## 1. Supabase Schema Overview

The target schema (see `Supabase_Schema_Design.md`) includes:

- **speakers**: Speaker info (id, name, bio, photo_url, created_at)
- **dhamma_content**: Content metadata (id, title, speaker_id, content_type, file_url, etc.)
- **categories**: Content categories (id, name)
- **tags**: Tags (id, name)
- **dhamma_content_tags**: Many-to-many join table (content_id, tag_id)

Refer to `Supabase_Schema_Design.md` for detailed column definitions and constraints.

## 2. Source Database Analysis

### 2.1. Schema Review

- Use SQLite tools (e.g., `sqlite3`, DB Browser for SQLite) to inspect all tables and columns.
- Document the schema: table names, columns, types, constraints, indexes.

### 2.2. Data Profiling

- Count records in each table.
- Identify unique values, duplicates, and nulls in key columns (e.g., speaker names, content titles).
- Check for existing relationships (e.g., foreign keys, implicit links).

### 2.3. Mapping Assessment

- For each Supabase table, identify the source table/fields in `dhamma_dataset.db`.
- Note any fields that require transformation, splitting, or merging.
- Identify missing data and plan enrichment or default strategies.

## 3. Objectives & Scope

- Normalize data according to the Supabase schema.
- Ensure data integrity and establish all foreign key relationships.
- Support scalability and future extensibility.
- Document the ETL (Extract, Transform, Load) process for reproducibility.
- Provide detailed mapping and transformation documentation for future reference.

## 4. ETL Process Plan

### 4.1. Extract

- Dump all relevant data from `dhamma_dataset.db` using SQL queries or scripts.
- Export to CSV/JSON if needed for transformation.

### 4.2. Transform

- Clean and normalize text fields (trim, lowercase, remove duplicates).
- Generate mapping tables for speakers, categories, and tags.
- Handle missing or inconsistent data (e.g., assign default values, log issues).
- Ensure referential integrity (e.g., all `speaker_id` in content exist in `speakers`).

### 4.3. Load

- Create new SQLite DB(s) with the Supabase schema (DDL scripts).
- Insert data in dependency order: categories, speakers, tags, dhamma_content, dhamma_content_tags.
- Use transactions to ensure atomicity.

### 4.4. Validation

- Run integrity checks: foreign keys, uniqueness, not-null constraints.
- Spot-check random records for correctness.
- Compare record counts and key statistics with source DB.
- Log and resolve any errors or mismatches.

## 5. Migration Strategy

- Use Python (with `sqlite3`, `pandas`) or Node.js (with `better-sqlite3`, `knex`) for scripting.
- Version control all scripts and schema files.
- Use logging for traceability and debugging.
- Document all transformation rules and assumptions in a migration log.
- Plan for incremental runs and rollbacks in case of errors.

## 6. Next Steps

1. **Schema Discovery**: Document `dhamma_dataset.db` schema and sample data.
2. **Mapping Table Creation**: Build mapping tables for speakers, categories, and tags.
3. **Script Development**: Write ETL scripts for extraction, transformation, and loading.
4. **Test Migration**: Run migration on a copy of the source DB; validate results.
5. **Iterate**: Refine scripts and mappings based on validation findings.
6. **Final Migration**: Run on production data; archive logs and outputs.
7. **Documentation**: Update this plan and migration log with lessons learned.

## 7. Detailed Mapping Strategy

### 7.1. speakers

- Map unique speaker names from source to `speakers` table.
- Extract bios and photo URLs if available; otherwise, set as NULL.
- Assign new unique IDs.

### 7.2. dhamma_content

- Map each content item (audio, video, ebook, etc.) to a row.
- Link to `speakers` via speaker name/ID mapping.
- Set `content_type` based on file type or metadata.
- Ensure `file_url` is unique and valid.
- Map or estimate file size, duration, language, category, description, date recorded, source page, scraped date.

### 7.3. categories

- Extract unique categories from content metadata or assign a default if missing.

### 7.4. tags & dhamma_content_tags

- Parse tags from content metadata (comma-separated, JSON, etc.).
- Deduplicate and insert into `tags` table.
- Create join entries in `dhamma_content_tags` for each content-tag pair.

## 8. Validation & Verification

- Use SQL queries to check referential integrity and data completeness.
- Compare sample queries (e.g., number of talks per speaker) between old and new DBs.
- Solicit feedback from stakeholders on migrated data quality.

## 9. Risks & Mitigations

- **Data loss**: Always work on a copy of the source DB; keep backups.
- **Inconsistent data**: Log and review all transformation warnings/errors.
- **Script errors**: Use version control and code reviews for migration scripts.

---

---

_Last updated: July 12, 2025_
