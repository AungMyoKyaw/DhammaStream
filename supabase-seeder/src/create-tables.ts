import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("Error: Missing required environment variable DATABASE_URL.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Use with caution; set to true in production for security
  }
});

async function setupDatabase() {
  console.log("Starting table creation...");

  const queries = [
    {
      query: `CREATE TABLE IF NOT EXISTS speakers (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE DEFAULT 'Unknown Speaker',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      description: "Create speakers table"
    },
    {
      query: `CREATE TABLE IF NOT EXISTS dhamma_content (
        id INT PRIMARY KEY,
        title TEXT DEFAULT 'Untitled',
        speaker_id INT REFERENCES speakers(id) DEFAULT NULL,
        content_type TEXT DEFAULT 'other',
        file_url TEXT DEFAULT '',
        file_size_estimate INT DEFAULT 0,
        duration_estimate INT DEFAULT 0,
        language TEXT DEFAULT 'en',
        category TEXT DEFAULT 'Uncategorized',
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        description TEXT DEFAULT '',
        date_recorded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        source_page TEXT DEFAULT '',
        scraped_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      description: "Create dhamma_content table"
    }
  ];

  const client = await pool.connect();
  try {
    for (const { query, description } of queries) {
      try {
        await client.query(query);
        console.log(`Successfully executed: ${description}`);
      } catch (err) {
        console.error(`Error executing ${description}:`, err.message);
        throw err;
      }
    }
    console.log("All tables configured successfully.");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

setupDatabase();
