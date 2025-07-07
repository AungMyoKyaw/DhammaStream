# Supabase Seeder Script Requirements

## Functional Requirements

1. **Data Extraction**
   - The script must connect to the SQLite database (`dhamma_dataset.db`) and extract data from the `dhamma_content` table.
   - Ensure all columns, including metadata (e.g., `tags`, `description`, `date_recorded`), are retrieved.

2. **Data Transformation**
   - Convert SQLite data types to Supabase-compatible data types (e.g., `INTEGER` to `int8`, `TEXT` to `text`, `DATETIME` to `timestamp`).
   - Handle default values (e.g., `language` defaults to `Myanmar`) and constraints (e.g., `content_type` validation).
   - Parse and format `tags` (if stored as a delimited string) into an array format for Supabase.

3. **Data Insertion**
   - Insert data into the corresponding Supabase table while maintaining relationships and constraints.
   - Ensure unique constraints (e.g., `file_url`) are respected to avoid duplication.
   - Populate timestamps (`created_at`) if not already present.

4. **Validation**
   - Validate data integrity before insertion (e.g., check `content_type` values, ensure `file_url` is not null).
   - Log and skip invalid records while continuing the seeding process.

5. **Error Handling**
   - Handle database connection errors for both SQLite and Supabase.
   - Retry failed insertions up to a configurable number of attempts.

6. **Database Normalization**
   - Create a separate `speaker` table to store unique speaker information.
   - Update the `dhamma_content` table to reference the `speaker` table using a foreign key.
   - Ensure the script handles the migration of speaker data and maintains relationships between tables.

---

## Non-Functional Requirements

1. **Performance**
   - Optimize batch insertion to Supabase to reduce execution time.
   - Use indexes (e.g., `idx_content_type`, `idx_speaker`) in SQLite for efficient data retrieval.

2. **Scalability**
   - Design the script to handle large datasets by processing data in chunks.
   - Ensure compatibility with future schema changes by using configuration files or environment variables.

3. **Security**
   - Use environment variables to securely store Supabase credentials (e.g., API key, database URL).
   - Sanitize inputs to prevent SQL injection or other vulnerabilities.

4. **Reliability**
   - Implement logging for all operations, including successful insertions, skipped records, and errors.
   - Provide a summary report at the end of the script execution (e.g., total records processed, errors encountered).

5. **Execution**
   - Ensure the script can be executed on macOS and other common operating systems.
   - Provide clear error messages and exit codes for troubleshooting.

---

## Assumptions and Constraints

1. **Assumptions**
   - The Supabase database schema is compatible with the SQLite schema (e.g., column names, data types).
   - Network connectivity is stable during the seeding process.
   - The SQLite database contains valid and clean data.

2. **Constraints**
   - The script must not modify the original SQLite database.
   - Data volume should not exceed the limits of the Supabase free tier (if applicable).
   - The script should complete within a reasonable time frame for datasets up to 1 million records.

---

## Deliverables

1. A TypeScript script using `npx tsx` for seeding data.
2. Configuration file for environment variables (e.g., `.env`).
3. Documentation:
   - Instructions for running the script.
   - Error handling and troubleshooting guide.
   - Summary of assumptions and constraints.
