# Crabby Crew - Local Development Setup

## Overview
This guide will help you run Crabby Crew locally using Cursor or any modern code editor.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Your own domain (if you want to deploy with custom domain)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-this
PORT=5000
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Project Structure
```
crabby-crew/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main app pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # In-memory data storage
│   └── db.ts            # Database configuration (for future use)
├── shared/              # Shared TypeScript types
└── attached_assets/     # Static assets
```

## Key Features
- **Simple Authentication**: Username-based login (no external dependencies)
- **XP System**: Learn species and complete quizzes to earn XP
- **Progress Tracking**: Individual user progress with levels and badges
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Immediate feedback on actions

## Database Options

### Current: In-Memory Storage
- Perfect for development and demos
- Data resets when server restarts
- No setup required

### Future: PostgreSQL (Ready to Configure)
The app is prepared for PostgreSQL with Drizzle ORM:

1. Install PostgreSQL locally or use a cloud provider
2. Update `DATABASE_URL` in your `.env` file
3. Run migrations: `npm run db:push`

## Deployment Options

### Option 1: Vercel (Recommended for Static/Serverless)
```bash
npm install -g vercel
vercel
```

### Option 2: Railway (Full-stack with Database)
1. Connect your GitHub repo to Railway
2. Add environment variables
3. Deploy automatically on push

### Option 3: Your Own Server with Custom Domain
1. Build the project: `npm run build`
2. Set up nginx or Apache to serve the files
3. Configure SSL with Let's Encrypt
4. Point your domain's DNS to your server

## Custom Domain Setup
Since you already own a domain:

1. **Deploy your app** to your chosen platform
2. **Add DNS records** in your domain registrar:
   - A record pointing to your server's IP
   - CNAME for www subdomain (optional)
3. **Configure SSL** (most platforms handle this automatically)

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema (if using PostgreSQL)
- `npm run db:studio` - Open database admin interface

## Customization
- **Styling**: Edit `client/src/index.css` for global styles
- **Ocean Theme**: Modify Tailwind config in `tailwind.config.ts`
- **Crab Species**: Add new species in `client/src/data/crabs.ts`
- **Quiz Questions**: Update questions in `client/src/data/quizzes.ts`

## Production Considerations
- Replace in-memory storage with a real database
- Add rate limiting for API endpoints
- Implement proper error logging
- Consider adding image optimization for crab photos
- Set up monitoring and analytics

## Troubleshooting
- **Port conflicts**: Change PORT in `.env` file
- **Dependencies**: Delete `node_modules` and run `npm install`
- **Session issues**: Clear browser cookies and restart server
- **Build errors**: Ensure TypeScript types are correct

## Support
The app uses modern web technologies:
- React 18 with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Express.js for the backend
- TanStack Query for state management