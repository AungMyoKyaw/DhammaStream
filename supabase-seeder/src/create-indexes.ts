import "dotenv/config";
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment variables.");
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function createIndexes() {
  const sql = `
    -- Main composite index for filtering by content_type and ordering by created_at DESC
    CREATE INDEX IF NOT EXISTS idx_dhamma_content_content_type_created_at_desc ON dhamma_content(content_type, created_at DESC);

    -- Indexes for foreign keys to speed up joins and deletes
    CREATE INDEX IF NOT EXISTS idx_dhamma_content_category_id ON dhamma_content(category_id);
    CREATE INDEX IF NOT EXISTS idx_dhamma_content_speaker_id ON dhamma_content(speaker_id);

    -- Optional: BRIN index for large, append-only tables (uncomment if table is huge)
    -- CREATE INDEX IF NOT EXISTS idx_dhamma_content_created_at_brin ON dhamma_content USING BRIN (created_at);
  `;
  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Indexes created successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating indexes:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createIndexes();
