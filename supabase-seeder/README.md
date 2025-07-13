# Supabase Seeder Toolkit

This directory contains scripts and utilities to migrate and seed data from a local SQLite database (`dhamma_dataset.db`) to a Supabase PostgreSQL instance, following best practices for reproducible environments and local development.

## Overview

This toolkit provides:

- **Schema migration**: Convert and normalize your SQLite schema to match Supabase/Postgres requirements.
- **Data seeding**: Populate your Supabase instance with real or sample data for development, testing, or production.

## Prerequisites

- Node.js (>= 16) and npm
- A Supabase project with the following tables (see [`docs/Database_Documentation.md`](../docs/Database_Documentation.md)):
  - `speakers`, `categories`, `tags`, `dhamma_content`, `dhamma_content_tags`, `featured_entities`
- Environment variables configured in a `.env` file (see `.env.example`)

## Setup

1. **Install dependencies:**

   ```bash
   cd supabase-seeder
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase URL, service role key, and SQLite DB path
   ```

## Scripts

### 1. Migrate SQLite to Supabase Schema

**File:** `src/migrate-to-supabase-schema.ts`

Creates a new SQLite database (`dhamma_supabase.db`) with a schema matching Supabase/Postgres, and migrates data from the original `dhamma_dataset.db`. Also generates mapping files for speakers, categories, and tags.

**Usage:**

```bash
npm run migrate:supabase-schema
```

### 2. Create Tables in Supabase

**File:** `src/create-tables.ts`

Creates all required tables in your Supabase/Postgres instance using the credentials in your `.env` file.

**Usage:**

```bash
npm run create-tables
```

### 3. Seed Data to Supabase

**File:** `src/seed-supabase.ts`

Seeds categories, speakers, tags, and dhamma content from the SQLite database and mapping files into your Supabase instance. Handles batching, retries, and logs progress.

**Usage:**

```bash
npm run seed-supabase
```

## Configuration

Set the following environment variables in your `.env` file:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Service role key (required for inserts)
- `SQLITE_DB_PATH`: Path to your SQLite database (e.g., `../data/dhamma_dataset.db`)
- `DATABASE_URL`: (for table creation) Postgres connection string
- `BATCH_SIZE`: (optional) Number of rows per batch (default: 100)
- `RETRY_ATTEMPTS`: (optional) Number of retries on insert failure (default: 3)

## Best Practices

- **Separate schema and data:** Schema creation and data seeding are handled by different scripts.
- **Use environment variables:** Never hardcode secrets or connection strings.
- **Batch inserts:** Improves performance and reliability for large datasets.
- **Retry logic:** Handles transient failures gracefully.
- **Log and skip invalid data:** Ensures the process is robust and debuggable.
- **Refer to [Supabase seeding docs](https://supabase.com/docs/guides/local-development/seeding-your-database) for more info.**

## Troubleshooting

- Ensure your Supabase key has service-role privileges to insert data.
- Confirm your Supabase tables match the expected schema (see `src/create-tables.ts` and `docs/Database_Documentation.md`).
- Check network connectivity and retry if necessary.
- Review logs for skipped or errored records.
- For schema issues, re-run the migration and table creation scripts.

## Contributing & Testing

1. Fork and clone this repository.
2. Make your changes in a feature branch.
3. Test locally by running the migration, table creation, and seeding scripts in order.
4. Ensure your changes are covered by logs and error handling.
5. Submit a pull request with a clear description of your changes.

## References

- [Supabase Seeding Best Practices](https://supabase.com/docs/guides/local-development/seeding-your-database)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [`docs/Database_Documentation.md`](../docs/Database_Documentation.md)

## License

MIT
