# Cher's Closet - AI Wardrobe Management

A full-stack wardrobe management application with AI-powered outfit recommendations.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

- User authentication
- Wardrobe item management
- Outfit creation
- AI-powered recommendations (requires OpenAI API key)
- Fashion inspiration gallery
- Mobile responsive design

## Environment Setup

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000
HOST=127.0.0.1
SESSION_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Storage**: In-memory (data resets on restart)
- **AI**: OpenAI GPT integration
- **UI**: Radix UI components

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server