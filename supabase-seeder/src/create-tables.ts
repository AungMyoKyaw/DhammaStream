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
        name TEXT NOT NULL UNIQUE,
        bio TEXT,
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      description: "Create speakers table"
    },
    {
      query: `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );`,
      description: "Create categories table"
    },
    {
      query: `CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );`,
      description: "Create tags table"
    },
    {
      query: `CREATE TABLE IF NOT EXISTS dhamma_content (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        speaker_id INT REFERENCES speakers(id),
        content_type TEXT CHECK(content_type IN ('audio', 'video', 'ebook', 'other')),
        file_url TEXT NOT NULL UNIQUE,
        file_size_estimate INT,
        duration_estimate INT,
        language TEXT DEFAULT 'Myanmar',
        category_id INT REFERENCES categories(id),
        description TEXT,
        date_recorded DATE,
        source_page TEXT,
        scraped_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`,
      description: "Create dhamma_content table"
    },
    {
      query: `CREATE TABLE IF NOT EXISTS dhamma_content_tags (
        content_id INT REFERENCES dhamma_content(id),
        tag_id INT REFERENCES tags(id),
        PRIMARY KEY (content_id, tag_id)
      );`,
      description: "Create dhamma_content_tags table"
    },
    {
      query: `CREATE TABLE IF NOT EXISTS featured_entities (
        id SERIAL PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id INT NOT NULL,
        featured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        context TEXT
      );`,
      description: "Create featured_entities table"
    },
    {
      query: `CREATE INDEX IF NOT EXISTS idx_featured_entities_entity_type_id ON featured_entities(entity_type, entity_id);`,
      description: "Create index on featured_entities (entity_type, entity_id)"
    }
  ];

  const client = await pool.connect();
  try {
    for (const { query, description } of queries) {
      try {
        await client.query(query);
        console.log(`Successfully executed: ${description}`);
      } catch (err) {
        console.error(
          `Error executing ${description}:`,
          (err as Error).message
        );
        throw err;
      }
    }
    console.log("All tables configured successfully.");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
