// Simple migration script to add watchedVideos field
// Run this with: node server/migrate.js

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { gameProgress } from '../shared/schema.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Add watchedVideos column if it doesn't exist
    await client`
      ALTER TABLE game_progress 
      ADD COLUMN IF NOT EXISTS watched_videos JSONB DEFAULT '[]'::jsonb
    `;
    
    // Update existing records to have empty watchedVideos array
    await client`
      UPDATE game_progress 
      SET watched_videos = '[]'::jsonb 
      WHERE watched_videos IS NULL
    `;
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

migrate();
