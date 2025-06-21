# Firebase Project Setup and Initialization Plan

This document outlines the steps to create a Firebase project, initialize it locally, and populate it with initial data for the DhammaStream application.

---

## 1. Create Firebase Project in Console

1. Navigate to https://console.firebase.google.com/ and sign in.
2. Click **Add project**.
3. Enter project name: **DhammaStream**.
4. (Optional) Enable Google Analytics and select the Analytics account.
5. Review settings and click **Create project**.
6. Once ready, click **Continue** to open the project dashboard.

## 2. Install and Configure Firebase CLI

1. Open a terminal in the repository root:
   ```bash
   npm install -g firebase-tools
   ```
2. Authenticate:
   ```bash
   firebase login
   ```
3. Initialize Firebase in the local project directory:
   ```bash
   firebase init
   ```
   - Select features: **Firestore**, **Hosting** (if needed), **Functions** (optional), **Emulators** (recommended).
   - Choose the existing project: **DhammaStream**.
   - Configure default Firestore rules and indexes files.
   - Specify a public directory for hosting (e.g., `public`).
   - Set up single-page app configuration if using it.

## 3. Enable and Configure Database

1. In Firebase Console, go to **Firestore Database**.
2. Click **Create database**, choose production or test mode.
3. Select a location (region).
4. Set rules to allow read/write during development (adjust before production).

## 4. Define Data Model and Collections

Outline collections and document structure, for example:

- **users**:
  - `uid`, `displayName`, `email`, `createdAt`
- **sermons**:
  - `id`, `title`, `speaker`, `date`, `audioUrl`
- **authors**:
  - `authorId`, `name`, `bio`

## 5. Add Initial Data

### Option A: Manual via Console

- Open collection in console and add documents by hand.

### Option B: Automated Seed Script (TypeScript)

1. Install dependencies:
   ```bash
   npm install firebase-admin sqlite sqlite3
   npm install --save-dev typescript ts-node @types/node @types/sqlite @types/sqlite3
   ```
2. Initialize TypeScript configuration:
   ```bash
   npx tsc --init
   ```
3. Create a `scripts/seedFirestore.ts` file to import data from `data/dhamma_dataset.db` into Firestore using the Firebase Admin SDK.
4. Run the seed script:
   ```bash
   npx ts-node scripts/seedFirestore.ts
   ```

## 6. Verify Data and Security Rules

1. In console, inspect collections and documents.
2. Test read/write operations locally using Emulators:
   ```bash
   firebase emulators:start
   ```
3. Adjust Firestore rules in `firestore.rules` as needed.

## 7. Deploy

1. Deploy Firestore rules, hosting and functions:
   ```bash
   firebase deploy
   ```
2. Confirm deployment in Firebase Console.

---

_Prepared on June 21, 2025_
