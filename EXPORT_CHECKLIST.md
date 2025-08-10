# Crabby Crew - Export to Local Development Checklist

## Files to Copy/Export
✅ **All Source Code**
- `client/` folder (React frontend)
- `server/` folder (Express backend) 
- `shared/` folder (TypeScript types)
- `attached_assets/` folder (static assets)

✅ **Configuration Files**
- `package.json` (dependencies and scripts)
- `tsconfig.json` (TypeScript configuration)
- `vite.config.ts` (Vite build configuration)
- `tailwind.config.ts` (styling configuration)
- `postcss.config.js` (CSS processing)
- `drizzle.config.ts` (database configuration)
- `components.json` (UI components config)

✅ **Documentation**
- `replit.md` (project documentation)
- `SETUP_LOCAL.md` (local development guide)
- `.env.example` (environment variables template)

## Setup Steps for Local Development

### 1. Initialize New Project
```bash
mkdir crabby-crew-local
cd crabby-crew-local
```

### 2. Copy Files
Copy all the source files from this Replit to your local directory

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your settings
```

### 5. Start Development
```bash
npm run dev
```

## Key Differences from Replit

### Removed Replit-Specific Dependencies
The exported `package.json` excludes Replit-specific packages:
- `@replit/vite-plugin-cartographer` 
- `@replit/vite-plugin-runtime-error-modal`

### Environment Variables
- `SESSION_SECRET` - Set a secure random string
- `PORT` - Default is 5000, change if needed
- `DATABASE_URL` - Optional, for PostgreSQL setup

### Development Server
- Replit: Automatic port management
- Local: Manual port configuration (default: 5000)

## Deployment with Your Custom Domain

### Option 1: Static Hosting (Vercel/Netlify)
Good for: Simple deployment, automatic SSL
```bash
npm run build
# Deploy dist/ folder
```

### Option 2: Full-Stack Hosting (Railway/Render)
Good for: Database integration, real-time features
- Connect GitHub repository
- Set environment variables
- Auto-deploy on push

### Option 3: VPS/Dedicated Server
Good for: Full control, custom domain management
```bash
# On your server
git clone your-repo
npm install
npm run build
# Configure nginx/Apache
# Set up SSL with Let's Encrypt
```

## DNS Configuration for Custom Domain
Point your domain to your deployment:

**For static hosting:**
- A record: `@` → `your-hosting-ip`
- CNAME: `www` → `your-app.vercel.app`

**For VPS:**
- A record: `@` → `your-server-ip`
- A record: `www` → `your-server-ip`

## Post-Export Verification

### Test Core Features:
- [ ] User registration/login works
- [ ] Learning species awards XP
- [ ] Quiz completion saves progress  
- [ ] Profile customization functions
- [ ] Leaderboards display correctly
- [ ] Responsive design on mobile

### Performance Checks:
- [ ] Build completes without errors
- [ ] No console errors in browser
- [ ] Fast page load times
- [ ] Smooth animations and transitions

## Production Optimizations

### Security
- [ ] Change default SESSION_SECRET
- [ ] Add rate limiting middleware
- [ ] Implement CSRF protection
- [ ] Use HTTPS in production

### Performance  
- [ ] Enable gzip compression
- [ ] Add image optimization
- [ ] Implement caching headers
- [ ] Monitor bundle size

### Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure uptime monitoring
- [ ] Add performance metrics

## Success Criteria
✅ App runs locally without errors
✅ All features work as expected
✅ Ready for deployment to your custom domain
✅ Documentation is complete and helpful

Your Crabby Crew app is now ready to swim in open waters! 🦀🌊