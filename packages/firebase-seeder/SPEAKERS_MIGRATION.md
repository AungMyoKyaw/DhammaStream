# Speakers Collection Migration

This document describes the enhanced speakers collection feature for DhammaStream, which optimizes speaker data retrieval and improves user experience.

## Overview

The speakers collection migration introduces a dedicated `/speakers` collection in Firestore that contains rich metadata about dharma teachers and speakers. This replaces the previous approach of dynamically extracting speaker information from content collections.

## Benefits

- **Performance**: Direct speaker queries instead of scanning content collections
- **Rich Metadata**: Speaker bios, profile images, content statistics, and more
- **Better UX**: Enhanced speaker browsing with metadata and filtering
- **Scalability**: Foundation for speaker analytics, featured speakers, etc.
- **Backward Compatibility**: Maintains fallback to legacy speaker extraction

## Speaker Schema

```typescript
interface Speaker {
  id: string; // kebab-case version of name
  name: string; // Display name
  bio?: string; // Speaker biography
  profileImageUrl?: string; // Profile photo URL
  contentTypes: string[]; // ["ebook", "sermon", "video"]
  contentRefs: {
    ebooks: string[]; // Array of ebook document IDs
    sermons: string[]; // Array of sermon document IDs
    videos: string[]; // Array of video document IDs
  };
  contentCounts: {
    ebooks: number;
    sermons: number;
    videos: number;
    total: number;
  };
  featured?: boolean; // For featured speakers
  createdAt: Date;
  updatedAt: Date;
}
```

## Migration Process

### 1. Run the Migration Script

```bash
cd packages/firebase-seeder
npm run migrate:speakers
```

**Options:**

- `--force`: Overwrite existing speakers collection

The migration script will:

- Scan existing content collections (`ebooks`, `sermons`, `videos`)
- Extract unique speakers and their content references
- Generate speaker documents with metadata
- Populate the `/speakers` collection

### 2. Deploy Firestore Indexes

```bash
npm run deploy:indexes
```

This deploys the necessary composite indexes for efficient speaker queries.

### 3. Deploy Security Rules

```bash
npm run deploy:rules
```

This updates Firestore rules to allow public read access to the speakers collection.

## New Features

### Enhanced Speaker Service

The updated content service automatically detects and uses the speakers collection when available:

```typescript
import {
  getSpeakers,
  getSpeakerById,
  getContentBySpeaker
} from "@/services/content-enhanced";

// Get all speakers
const speakers = await getSpeakers();

// Get speakers filtered by content type
const videoSpeakers = await getSpeakers("video");

// Get speaker by ID with full metadata
const speaker = await getSpeakerById("ajahn-chah");

// Get content using optimized speaker references
const content = await getContentBySpeaker("Ajahn Chah", "sermon");
```

### Backward Compatibility

If the speakers collection is not available or empty, the service automatically falls back to the legacy method of extracting speakers from content collections.

### Performance Optimizations

- **Direct Queries**: Speaker lists are fetched directly from the speakers collection
- **Content References**: Speaker content is retrieved using stored document references
- **Caching**: Speaker data is cached in memory for 5 minutes
- **Efficient Filtering**: Speakers can be filtered by content type availability

## Indexes

The following Firestore indexes are automatically deployed:

1. **Basic Queries**:

   - `name` (ascending)
   - `createdAt` (descending)

2. **Featured Speakers**:

   - `featured` + `contentCounts.total` (descending)

3. **Content Type Filtering**:
   - `contentTypes` (array-contains) + `contentCounts.sermons` (descending)
   - `contentTypes` (array-contains) + `contentCounts.videos` (descending)
   - `contentTypes` (array-contains) + `contentCounts.ebooks` (descending)

## Security Rules

The speakers collection has public read access but only admin scripts can write:

```javascript
match /{collection}/{document} {
  allow read: if collection in ['sermons', 'videos', 'ebooks', 'speakers'];
  allow write: if false; // Only admin scripts can write
}
```

## Maintenance

### Updating Speaker Data

To add or update speaker information:

1. Manually edit documents in the Firestore console, or
2. Re-run the migration script with `--force` flag to regenerate all speakers

### Adding Speaker Bios and Photos

Speaker bios are automatically generated during migration but can be enhanced:

```javascript
// Update speaker bio in Firestore console
{
  "bio": "Detailed biography of the speaker...",
  "profileImageUrl": "https://example.com/speaker-photo.jpg",
  "featured": true
}
```

### Content Reference Maintenance

When content is added/removed, speaker references should be updated. This can be automated with Cloud Functions or handled manually.

## Monitoring

Monitor the migration and performance:

1. **Collection Size**: Check document count in Firestore console
2. **Query Performance**: Monitor query execution times
3. **Error Logs**: Check for fallback to legacy speaker extraction
4. **Cache Performance**: Monitor cache hit rates in application logs

## Troubleshooting

### Migration Issues

```bash
# Check if migration completed successfully
firebase firestore:databases:list

# Verify speakers collection exists
# Check Firestore console for /speakers collection
```

### Service Issues

The service logs will indicate if it's using the speakers collection or falling back:

```
✅ Loaded 45 speakers from collection          # Using speakers collection
🔄 Extracting speakers from content (fallback) # Using legacy method
```

### Performance Issues

If speaker queries are slow:

1. Verify all indexes are deployed
2. Check query complexity in Firestore console
3. Monitor cache effectiveness
4. Consider pagination for large speaker lists

## Future Enhancements

- **Speaker Analytics**: Track speaker popularity and engagement
- **Automated Updates**: Cloud Functions to maintain speaker references
- **Rich Profiles**: Extended metadata for speaker profiles
- **Search Integration**: Full-text search across speaker names and bios
- **Featured Content**: Highlight popular content per speaker
