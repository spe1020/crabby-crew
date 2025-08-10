# Video System Setup Guide

## Overview
The Crabby Crew app now includes a comprehensive video learning system where users can watch educational videos about crabs and earn XP for completing them.

## Features
- ✅ Embedded video player with YouTube integration
- ✅ XP rewards for video completion
- ✅ Progress tracking and completion status
- ✅ Difficulty levels and categories
- ✅ Beautiful, responsive UI
- ✅ Authentication required to access videos

## How to Add Real Videos

### 1. Find Your Video
- Go to YouTube and find an educational video about crabs or ocean life
- Copy the video URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)

### 2. Extract Video ID
- From the URL `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- The video ID is: `dQw4w9WgXcQ`

### 3. Update the Video Library
Edit `client/src/pages/videos.tsx` and replace the placeholder videos:

```typescript
const videoLibrary: VideoContent[] = [
  {
    id: "crab-basics-intro",
    title: "Your Actual Video Title",
    description: "Your actual video description",
    videoUrl: "https://www.youtube.com/embed/YOUR_ACTUAL_VIDEO_ID",
    thumbnail: "🦀",
    duration: "5:23",
    xpReward: 50,
    category: "Crab Basics",
    difficulty: "beginner",
    tags: ["anatomy", "behavior", "ocean life"]
  },
  // Add more videos...
];
```

### 4. Update Video Metadata
- **title**: The actual title of the video
- **description**: Brief description of what the video covers
- **duration**: Actual video length (e.g., "5:23")
- **xpReward**: XP points to award (suggested: 40-70 based on length)
- **category**: Choose from: "Crab Basics", "Habitats", "Anatomy", "Behavior"
- **difficulty**: Choose from: "beginner", "intermediate", "advanced"
- **tags**: Relevant keywords for the video content

## Database Setup

### Option 1: Automatic Migration (Recommended)
If you have a database running, the app will automatically create the `watchedVideos` field when needed.

### Option 2: Manual Migration
If you encounter database errors, run the migration script:

```bash
cd server
node migrate.js
```

## Video Categories

### Crab Basics
- Introduction videos
- General crab information
- Basic concepts

### Habitats
- Where crabs live
- Ecosystem information
- Environmental topics

### Anatomy
- Body structure
- Adaptations
- Scientific details

### Behavior
- Social behavior
- Intelligence
- Communication

## XP Rewards
- **Beginner videos**: 40-50 XP
- **Intermediate videos**: 50-60 XP
- **Advanced videos**: 60-70 XP

## Technical Details

### Frontend
- React component with embedded iframes
- Progress tracking with React Query
- Toast notifications for XP rewards
- Responsive design for mobile and desktop

### Backend
- New `/api/video-complete` endpoint
- XP tracking and leaderboard updates
- Session-based authentication
- Progress persistence

### Database
- New `watchedVideos` JSONB field in `game_progress` table
- Stores array of completed video IDs
- Integrates with existing XP and progress system

## Testing

1. Start the server: `npm run dev`
2. Start the client: `cd client && npm run dev`
3. Navigate to `/videos` page
4. Sign in with an account
5. Click on a video to watch
6. Mark as complete to earn XP

## Troubleshooting

### Video not playing
- Check that the video ID is correct
- Ensure the video is public on YouTube
- Verify the embed URL format

### XP not awarded
- Check browser console for errors
- Verify user is authenticated
- Check server logs for API errors

### Database errors
- Run the migration script
- Check that DATABASE_URL is set correctly
- Verify database permissions

## Future Enhancements

- Video progress tracking (partial completion)
- Video playlists and series
- User-generated video content
- Video analytics and recommendations
- Integration with other learning activities
