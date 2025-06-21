# Firebase Seeder

This script seeds Firestore with content from a local SQLite database (`dhamma_dataset.db`). It respects the Firebase Spark free-tier daily write limit (20,000 writes/day) by persisting state across runs.

## Prerequisites

- Node.js v16+ and npm
- Firebase service account JSON in `serviceAccountKey.json` (at project root)
- SQLite database at `data/dhamma_dataset.db`

## Installation

```bash
cd packages/firebase-seeder
npm install
```

## Configuration

- Ensure `serviceAccountKey.json` is valid and points to your Firebase project.
- The script will create/update `state.json` next to the data folder to track progress.

## Usage

Run the seeder:

```bash
cd packages/firebase-seeder
npm run seed
```

**Behavior:**

- Reads all rows from `data/dhamma_dataset.db`.
- Writes in chunks of 100 documents.
- Persists `lastProcessedIndex` and `dailyProcessedCount` in `state.json`.
- If the daily limit (20,000 writes) is reached, the script exits with an error message indicating where to resume.
- On the next run (within the same day), it resumes from the last index.
- If the date changes, the daily count resets and seeding continues.

## Error Handling

- Unhandled promise rejections and uncaught exceptions are logged and cause the script to exit.
- Commit batch failures are retried up to 3 times with exponential backoff.

## Resetting State

To start over from the beginning, delete `state.json`:

```bash
rm state.json
```

---

Toolkit provided by DhammaStream Team
