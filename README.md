# DhammaStream

DhammaStream is a web-based platform for streaming Dhamma talks and lectures. It features a Next.js frontend and uses Supabase for its database and backend services.

## Screenshots

![DhammaStream Homepage (Playwright, July 2025)](screenshots/dhamma-stream.png)

_Above: Full homepage screenshot captured with Playwright automation (July 2025)._

## Table of Contents

- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Database Seeding](#database-seeding)
  - [Running the Frontend](#running-the-frontend)
- [Scripts](#scripts)
- [Additional Documentation](#additional-documentation)

## Project Structure

The project is organized into the following main directories:

- **dhamma-content-streaming-platform**: Contains the Next.js frontend application.
- **supabase-seeder**: Includes scripts for seeding the Supabase database.
- **data**: Stores data files, such as `category_map.json`, `speaker_map.json`, and `tag_map.json`.

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Database Seeding**: Node.js, TypeScript, better-sqlite3, pg

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

- Node.js and npm (or yarn, pnpm, bun)
- Supabase account and project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/DhammaStream.git
   ```

2. Install the dependencies for the frontend:

   ```bash
   cd dhamma-content-streaming-platform
   npm install
   ```

3. Install the dependencies for the Supabase seeder:

   ```bash
   cd ../supabase-seeder
   npm install
   ```

### Configuration

1. Create a `.env` file in the `supabase-seeder` directory by copying the `.env.example` file.
2. Populate the `.env` file with your Supabase project URL and API key.

### Database Seeding

To seed the Supabase database, run the following commands from the `supabase-seeder` directory in the specified order:

1.  **`npm run migrate:supabase-schema`**: Migrates the SQLite database schema to a Supabase-compatible format.
2.  **`npm run create-tables`**: Creates the necessary tables in the Supabase database.
3.  **`npm run create-indexes`**: Creates indexes on the database tables for improved performance.
4.  **`npm run enable-rls`**: Enables Row-Level Security (RLS) on the Supabase tables.
5.  **`npm run seed-supabase`**: Seeds the database with the initial data.

### Running the Frontend

To run the frontend development server, execute the following command from the `dhamma-content-streaming-platform` directory:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

### `dhamma-content-streaming-platform`

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase.

### `supabase-seeder`

- `npm run migrate:supabase-schema`: Migrates the SQLite database schema.
- `npm run create-tables`: Creates the database tables.
- `npm run create-indexes`: Creates database indexes.
- `npm run enable-rls`: Enables Row-Level Security.
- `npm run seed-supabase`: Seeds the Supabase database.

## Additional Documentation

For more information on the project's dependencies and how to use them, refer to their respective documentation.
