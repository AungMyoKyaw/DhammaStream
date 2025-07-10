Programmatically Creating a Table and Populating Data in Supabase Using Node.js
This guide explains how to programmatically create a table and populate data in a Supabase database using Node.js. It uses the pg library to execute SQL queries for table creation and the supabase-js client for data insertion, with logic to handle cases where the table or data already exists. Supabase is built on PostgreSQL, and this guide ensures all operations are performed programmatically, avoiding the Supabase dashboard.
Prerequisites

A Supabase account and project set up at supabase.com.
Node.js installed on your system.
Basic knowledge of JavaScript, Node.js, and SQL.
Your Supabase project’s URL, API key, and database connection string (available in the Supabase dashboard under Settings > API and Settings > Database).

Step 1: Setting Up Your Node.js Project

Initialize a Node.js Project:Create a new directory and initialize a Node.js project:
mkdir supabase-node-demo
cd supabase-node-demo
npm init -y


Install Dependencies:Install the Supabase JavaScript client and the PostgreSQL client (pg):
npm install @supabase/supabase-js pg


Create a .env File:Store your Supabase credentials securely in a .env file:
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_KEY=your-anon-key
DATABASE_URL=postgres://postgres:[YOUR_PASSWORD]@db.your-project-url.supabase.co:5432/postgres

Replace your-project-url, your-anon-key, and [YOUR_PASSWORD] with the values from your Supabase project’s Settings > API and Settings > Database (use the PostgreSQL URI format for DATABASE_URL).

Install dotenv:To load environment variables, install dotenv:
npm install dotenv



Step 2: Programmatically Creating a Table
Since supabase-js does not support direct table creation, we use the pg library to execute an SQL query. The query includes IF NOT EXISTS to prevent errors if the table already exists.

Create a file named create-table.js:
require('dotenv').config();
const { Pool } = require('pg');

// Configure PostgreSQL client
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function createTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS products (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                price NUMERIC NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(query);
        console.log('Table "products" created successfully or already exists.');
    } catch (error) {
        console.error('Error creating table:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

createTable();


Run the script:
node create-table.js

This script connects to your Supabase database and creates a products table with columns for ID, name, description, price, and creation timestamp. The IF NOT EXISTS clause ensures no error occurs if the table already exists. The name column is marked UNIQUE to prevent duplicate product names, which will be used to check for existing data during insertion.


Note: Ensure the database user (typically postgres) has CREATE permissions. Supabase’s default postgres role has these permissions.
Step 3: Populating Data with supabase-js
To populate the products table, use supabase-js to insert data while checking for existing records to avoid duplicates. This example checks if a product with the same name already exists before inserting.

Create a file named insert-data.js:
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function insertData() {
    const productsToInsert = [
        { name: 'Laptop', description: 'High-performance laptop', price: 999.99 },
        { name: 'Smartphone', description: 'Latest model smartphone', price: 699.99 },
        { name: 'Headphones', description: 'Noise-cancelling headphones', price: 149.99 }
    ];

    try {
        // Check for existing products by name
        const { data: existingProducts, error: fetchError } = await supabase
            .from('products')
            .select('name')
            .in('name', productsToInsert.map(p => p.name));

        if (fetchError) {
            throw fetchError;
        }

        // Filter out products that already exist
        const existingNames = existingProducts.map(p => p.name);
        const newProducts = productsToInsert.filter(p => !existingNames.includes(p.name));

        if (newProducts.length === 0) {
            console.log('All products already exist. No new data inserted.');
            return;
        }

        // Insert new products
        const { data, error } = await supabase
            .from('products')
            .insert(newProducts)
            .select();

        if (error) {
            throw error;
        }

        console.log('Data inserted successfully:', data);
    } catch (error) {
        console.error('Error inserting data:', error.message);
        throw error;
    }
}

insertData();


Run the script:
node insert-data.js

This script:

Defines an array of products to insert.
Queries the products table to check for existing products by name.
Filters out products that already exist to avoid duplicates (leveraging the UNIQUE constraint on the name column).
Inserts only new products and logs the inserted records.
Handles errors, such as RLS restrictions or constraint violations.



Step 4: Configuring Row Level Security (RLS) Programmatically
Supabase enables RLS by default on new tables, which may restrict access unless policies are defined. To allow public read and insert operations programmatically, use the pg library to create RLS policies.

Create a file named configure-rls.js:
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function configureRLS() {
    try {
        const queries = [
            // Enable RLS on the products table
            `ALTER TABLE products ENABLE ROW LEVEL SECURITY;`,
            // Drop existing policies to avoid conflicts
            `DROP POLICY IF EXISTS "Allow public select" ON products;`,
            `DROP POLICY IF EXISTS "Allow public insert" ON products;`,
            // Create policy for public read access
            `CREATE POLICY "Allow public select" ON products FOR SELECT USING (true);`,
            // Create policy for public insert access
            `CREATE POLICY "Allow public insert" ON products FOR INSERT WITH CHECK (true);`
        ];

        for (const query of queries) {
            await pool.query(query);
            console.log('Executed:', query);
        }

        console.log('RLS policies configured successfully.');
    } catch (error) {
        console.error('Error configuring RLS:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

configureRLS();


Run the script:
node configure-rls.js

This script:

Enables RLS on the products table (if not already enabled).
Drops existing policies to avoid conflicts.
Creates policies to allow public SELECT and INSERT operations.
Uses IF EXISTS to handle cases where policies don’t exist.



Note: In production, create more restrictive RLS policies based on user authentication (e.g., auth.uid()). The above policies are for testing purposes.
Step 5: Verifying Data
To verify the inserted data, query the products table using supabase-js:

Create a file named fetch-data.js:
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fetchData() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            throw error;
        }

        if (data.length === 0) {
            console.log('No data found in the products table.');
            return;
        }

        console.log('Fetched data:', data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
}

fetchData();


Run the script:
node fetch-data.js

This script retrieves and logs all rows in the products table, with error handling for cases like RLS restrictions or an empty table.


Step 6: Running the Full Workflow
To set up and populate the table, run the scripts in sequence:
node create-table.js
node configure-rls.js
node insert-data.js
node fetch-data.js

This ensures the table is created, RLS is configured, data is inserted (skipping duplicates), and the results are verified.
Best Practices

Use Environment Variables: Store sensitive information like API keys and database URLs in a .env file.
Handle Duplicates: Check for existing data before inserting to respect constraints like UNIQUE.
Secure RLS in Production: Use authentication-based policies (e.g., USING (auth.uid() = user_id)) instead of public access.
Error Handling: Include try-catch blocks to manage errors like network issues, permission errors, or constraint violations.
Use Transactions: For complex operations involving multiple tables, use PostgreSQL transactions via pg to ensure atomicity.
Validate Input: Sanitize and validate data before insertion to prevent errors or security issues.
TypeScript Option: For larger projects, consider TypeScript with supabase-js for type safety.

Troubleshooting

Permission Denied Errors: Ensure RLS policies allow SELECT and INSERT operations or verify the anon key’s permissions.
Connection Issues: Check that SUPABASE_URL, SUPABASE_KEY, and DATABASE_URL are correct in the .env file.
Table Creation Fails: Verify the database user has CREATE permissions and the SQL query is valid.
Duplicate Key Errors: The UNIQUE constraint on name prevents duplicates; the script checks for existing names to avoid this.
No Data Inserted: Ensure the table exists and RLS policies allow inserts. Run fetch-data.js to verify.

Additional Resources

Supabase JavaScript API Reference
PostgreSQL Node.js Client (pg)
Supabase CLI for Migrations
Supabase RLS Documentation
