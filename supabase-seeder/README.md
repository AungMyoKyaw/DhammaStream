# Supabase Seeder Script

This script migrates data from the `dhamma_dataset.db` SQLite database to Supabase.

## Prerequisites

- Node.js (>= 16) and npm
- Supabase project with:
  - `speakers` table (`id SERIAL PRIMARY KEY`, `name TEXT UNIQUE`)
  - `dhamma_content` table matching the schema in `docs/Database_Documentation.md` (with `speaker_id` foreign key to `speakers.id`)
- Environment variables configured in a `.env` file (see `.env.example`)

## Setup

1. Install dependencies:

   ```bash
   cd supabase-seeder
   npm install
   ```

2. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase URL, service role key, and SQLite DB path
   ```

## Running the Script

Use the following command:

```bash
npm run start
```

The script will:

1. Extract and upsert unique speakers to the `speakers` table
2. Retrieve back speaker IDs
3. Batch-read `dhamma_content` rows in chunks (default batch size 1000)
4. Transform and insert content rows into Supabase
5. Log progress, skipped records, and errors

## Configuration

- `BATCH_SIZE`: Number of rows per batch (default 1000)
- `RETRY_ATTEMPTS`: Number of retries on insert failure (default 3)

## Logging & Error Handling

- Invalid `content_type` rows are skipped and logged
- Batch insert failures are retried with exponential backoff
- Summary of processed, inserted, skipped, and errored counts is printed at the end

## Troubleshooting

- Ensure your Supabase key has service-role privileges to insert data
- Confirm your Supabase tables match the expected schema
- Check network connectivity and retry if necessary

## License

MIT
