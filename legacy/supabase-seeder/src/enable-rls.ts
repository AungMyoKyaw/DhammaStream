import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// List of tables to apply RLS and public read policy
const TABLES = ["speakers", "categories", "tags", "dhamma_content"];

function getEnableRlsSql(table: string) {
  return `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`;
}

function getPublicReadPolicySql(table: string) {
  return `CREATE POLICY "Public read access" ON ${table}\n  FOR SELECT\n  TO anon, authenticated\n  USING (true);`;
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Set this in your .env file
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connected to database (using pool).");

    for (const table of TABLES) {
      // Enable RLS
      await pool.query(getEnableRlsSql(table));
      console.log(`RLS enabled for ${table}.`);

      // Create public read policy
      await pool.query(getPublicReadPolicySql(table));
      console.log(`Public read policy created for ${table}.`);
    }
    console.log("All done!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();
