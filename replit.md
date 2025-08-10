# Crabby Crew - Educational Ocean Learning App

## Overview

Crabby Crew is an educational web application designed to teach users about different crab species through interactive learning experiences. The application gamifies marine biology education by allowing users to learn about various crab species, complete quizzes, earn XP and badges, maintain learning streaks, and track their progress through a level-based system.

The app uses a playful, child-friendly design with ocean-themed colors and engaging UI components to make learning about marine life fun and accessible.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and employs a component-based architecture. Key architectural decisions include:

- **React with Vite**: Chosen for fast development builds and modern ES modules support
- **TypeScript**: Provides type safety and better developer experience
- **Wouter for Routing**: Lightweight routing library instead of React Router for smaller bundle size
- **TanStack Query**: Handles server state management, caching, and API requests
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI + shadcn/ui**: Provides accessible, customizable UI components
- **Component Structure**: Organized into pages, reusable components, and UI primitives

### Backend Architecture
The backend follows a simple Express.js REST API pattern:

- **Express.js**: Web framework for handling HTTP requests and responses
- **TypeScript**: Ensures type safety across the entire stack
- **In-Memory Storage**: Uses a memory-based storage system for development/demo purposes
- **Modular Route Handling**: Separates API logic into dedicated route handlers
- **Middleware Integration**: Custom logging and error handling middleware

### Data Storage Solutions
The application uses a dual storage approach:

- **Development Storage**: In-memory storage using Map data structures for rapid prototyping
- **Production Ready**: Configured with Drizzle ORM and PostgreSQL schema for production deployment
- **Database Schema**: Includes users, game progress tracking, and quiz attempt history
- **Migration Support**: Uses Drizzle Kit for database migrations

### Authentication and Authorization
Currently implements a simplified user system:

- **Basic User Management**: User creation and retrieval by ID or username
- **Session Handling**: Prepared for session-based authentication with PostgreSQL session storage
- **Progress Tracking**: Per-user game progress and achievement tracking

### Game Logic and Progression System
Implements a comprehensive gamification system:

- **XP and Leveling**: 200 XP per level progression system
- **Streak Tracking**: Daily activity streaks with longest streak records
- **Badge System**: Achievement-based rewards for various milestones
- **Species Learning**: Progress tracking for learned crab species
- **Quiz System**: Interactive quizzes with scoring and XP rewards

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and modern patterns
- **Express.js**: Backend web server framework
- **TypeScript**: Type system for JavaScript
- **Vite**: Build tool and development server

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library
- **Google Fonts**: Quicksand and Fredoka One font families

### Data Management
- **TanStack Query**: Server state management
- **Drizzle ORM**: Type-safe SQL ORM
- **Neon Database**: PostgreSQL cloud provider
- **Zod**: Runtime type validation

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing tool
- **Autoprefixer**: CSS vendor prefix automation
- **tsx**: TypeScript execution for Node.js

### Replit Integration
- **Replit Vite Plugin**: Development environment integration
- **Runtime Error Modal**: Enhanced error reporting in development
- **Cartographer Plugin**: Code mapping and debugging support

## Recent Changes

### Authentication System Overhaul (January 2025)
- Replaced complex Replit OpenID Connect with simple username-based authentication
- Implemented session-based login with in-memory storage for development
- Users can create accounts with just a username (no email required)
- Fixed all XP saving issues by updating user ID handling throughout the app
- Learning progress and quiz XP now correctly save to authenticated user profiles

### Deployment Readiness
The application is ready for deployment with:
- Simplified authentication system that works without external dependencies
- All core features functional: learning, quests, XP progression, leaderboards
- Responsive design optimized for both desktop and mobile
- Session management for user state persistence

The application is designed to be easily deployable on Replit while maintaining the flexibility to deploy to other platforms with minimal configuration changes.