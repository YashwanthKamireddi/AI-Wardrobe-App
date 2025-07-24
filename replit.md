# Cher's Closet - AI Wardrobe Management Platform

## Project Overview
An intelligent wardrobe management platform that leverages AI to transform personal styling through dynamic, interactive experiences. The application provides personalized fashion recommendations, style analysis, and innovative tools for users to discover, optimize, and reimagine their personal wardrobe.

## Technical Architecture
- **Frontend**: React with Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI (shadcn)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query
- **Authentication**: Express sessions with passport
- **AI Integration**: OpenAI API for recommendations
- **Styling**: Tailwind CSS with custom theme system

## Key Features
1. **Wardrobe Management**: Add, edit, categorize clothing items with image upload
2. **Outfit Creation**: Create and save outfits from wardrobe items
3. **AI Recommendations**: OpenAI-powered styling suggestions
4. **Style Analysis**: Insights into style preferences and wardrobe gaps
5. **Weather Integration**: Weather-based outfit recommendations
6. **Mood-Based Styling**: Select outfits based on mood preferences
7. **Inspiration Gallery**: Fashion inspiration content

## Database Schema
- `sessions`: User session management
- `users`: User accounts and profiles
- `wardrobe_items`: Individual clothing items with categorization
- `outfits`: Created outfit combinations
- `inspirations`: Fashion inspiration content
- `weather_preferences`: User weather styling preferences
- `mood_profiles`: User mood-based style preferences

## Development Setup
- Entry point: `server/index.ts`
- Start command: `npm run dev` (runs tsx server/index.ts)
- Build command: `npm run build`
- Database push: `npm run db:push`

## Current Status
- Project structure is established with full-stack architecture
- Database schema is defined in `shared/schema.ts`
- Authentication system is implemented
- Frontend routing is configured with protected routes
- Mobile-responsive design with bottom navigation

## Recent Changes
- Initial project setup with complete TypeScript configuration
- Database schema implementation for wardrobe management
- Authentication system with user registration/login
- React frontend with protected routes and mobile navigation
- Comprehensive documentation and development guidelines

## User Preferences
- None specified yet

## Next Steps
- Start the development server
- Verify database connectivity
- Test application functionality
- Address any runtime issues