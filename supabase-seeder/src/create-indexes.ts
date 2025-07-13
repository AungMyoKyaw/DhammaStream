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
    CREATE INDEX IF NOT EXISTS idx_dhamma_content_content_type ON dhamma_content(content_type);
    CREATE INDEX IF NOT EXISTS idx_dhamma_content_created_at ON dhamma_content(created_at);
    CREATE INDEX IF NOT EXISTS idx_dhamma_content_content_type_created_at ON dhamma_content(content_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_content_type_created_at ON dhamma_content (content_type, created_at DESC);
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
