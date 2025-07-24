# Cher's Closet - AI Wardrobe Management Application

## Overview

Cher's Closet is a full-stack wardrobe management application that combines modern web technologies with AI-powered outfit recommendations. The application allows users to manage their clothing items, create outfits, and receive personalized style suggestions based on weather conditions, mood, and personal preferences. Built with a luxury fashion aesthetic, it provides an intuitive and elegant user experience for fashion enthusiasts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Styling**: Tailwind CSS with custom luxury fashion design system featuring amber/gold color palette
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for sophisticated UI animations and transitions
- **Component Library**: Radix UI components with custom styling via shadcn/ui
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Storage**: In-memory storage with session management (no persistent database currently)
- **Authentication**: Passport.js with local strategy and bcrypt for password hashing
- **API Design**: RESTful endpoints with proper error handling and middleware

### Design System
- **Typography**: Luxury font combinations (Cormorant Garamond, Playfair Display, Montserrat)
- **Color Palette**: Warm amber/gold tones with sophisticated neutral backgrounds
- **Components**: Custom animated components with luxury aesthetics
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation

## Key Components

### Data Models
- **Users**: Authentication and profile management
- **Wardrobe Items**: Clothing pieces with categories, seasons, colors, and metadata
- **Outfits**: Collections of wardrobe items for specific occasions
- **Inspirations**: Fashion inspiration content with images and styling tips
- **Preferences**: Weather and mood-based styling preferences

### Core Features
1. **User Authentication**: Login/registration with session management
2. **Wardrobe Management**: Add, edit, delete, and organize clothing items
3. **Outfit Creation**: Combine wardrobe items into complete outfits
4. **AI Recommendations**: OpenAI-powered outfit suggestions based on context
5. **Weather Integration**: Weather-aware clothing recommendations
6. **Mood-Based Styling**: Outfit suggestions based on user's current mood
7. **Fashion Inspiration**: Curated fashion content and style guides

### Authentication & Authorization
- **Session-based Authentication**: Express sessions with in-memory storage
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Protected Routes**: Frontend route protection with automatic redirects
- **User Roles**: Basic user role system with extensibility for admin features

## Data Flow

### Client-Server Communication
1. **API Requests**: Centralized API client with error handling and authentication
2. **State Management**: React Query handles caching, synchronization, and optimistic updates
3. **Error Handling**: Comprehensive error boundaries and user-friendly error messages
4. **Loading States**: Sophisticated loading UI with skeleton components

### Authentication Flow
1. User submits credentials to `/api/login`
2. Server validates credentials and creates session
3. Session cookie maintains authentication state
4. Protected routes verify authentication before rendering
5. Automatic logout and redirect on session expiration

### Data Persistence
Currently uses in-memory storage that resets on server restart. The application is designed with Drizzle ORM integration for easy database migration when needed.

## External Dependencies

### AI Integration
- **OpenAI API**: Provides outfit recommendations and style analysis
- **Configuration**: Requires `OPENAI_API_KEY` environment variable
- **Fallback**: Graceful degradation when AI features are unavailable

### Development Tools
- **ESBuild**: Production bundling for server-side code
- **TypeScript Compiler**: Type checking and compilation
- **Vite**: Development server with hot module replacement
- **Prettier/ESLint**: Code formatting and linting (configured in VS Code)

### UI/UX Libraries
- **Framer Motion**: Advanced animations and micro-interactions
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Modern icon library
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Mode
- Single command startup with `npm run dev`
- Vite development server with hot reload
- Express server with TypeScript execution via tsx
- In-memory storage for rapid development iteration

### Production Build
- Frontend build to `dist/public` directory
- Server bundle to `dist/index.js` with ESBuild
- Static file serving for production deployment
- Environment-based configuration management

### Environment Configuration
- **Development**: Local development with in-memory storage
- **Production**: Optimized builds with static asset serving
- **Replit**: Special handling for Replit deployment environment
- **Environment Variables**: Centralized configuration system

### Scalability Considerations
The application is architected for easy scaling:
- Database migration ready with Drizzle ORM schemas
- Modular service layer for external integrations
- Stateless server design (except for in-memory storage)
- Microservice-ready API structure

### Security Features
- Password hashing with bcrypt
- Session security with configurable options
- CORS protection with environment-based origins
- Input validation with Zod schemas
- Protected API endpoints with middleware