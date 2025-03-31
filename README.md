# Cher's Closet - AI-Powered Wardrobe Management

An innovative AI-powered wardrobe management application that transforms personal styling through intelligent technology and interactive design. The platform provides dynamic fashion inspiration with enhanced content discovery and personalized recommendations.

## Features

- **Smart Wardrobe Management**: Organize your clothing items with categories, tags, seasons, and colors
- **AI-Powered Outfit Recommendations**: Get personalized outfit suggestions based on your style, mood, and weather
- **Weather-Aware Styling**: Receive weather-appropriate outfit suggestions
- **Style Profile Analysis**: Gain insights into your fashion preferences
- **Fashion Inspiration**: Discover new trends and styles from curated content
- **Responsive Design**: Enjoy a seamless experience on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Radix UI components, Tailwind CSS, Framer Motion animations
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI for intelligent recommendations
- **Authentication**: Passport.js for secure user management

## Running in Replit

The application is already configured to run seamlessly in Replit:

1. Simply hit the "Run" button in Replit
2. The application will start automatically using `node start.js`
3. Access the application at the provided URL
4. Login with the test credentials:
   - Username: `fashionuser`
   - Password: `password123`

## Running Locally in VS Code

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- OpenAI API key

### Setup Steps

1. Clone the repository to your local machine
2. Open the project folder in VS Code
3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/yourdbname
   OPENAI_API_KEY=your_openai_api_key
   ```

5. Set up the PostgreSQL database:
   ```bash
   createdb yourdbname
   ```

6. Run database migrations:
   ```bash
   npm run db:push
   ```

7. Start the application:
   ```bash
   node start.js
   ```

8. Access the application at:
   - http://localhost:3000 or http://localhost:3001

### Alternative Start Methods

You can start the frontend and backend servers separately:

```bash
# Start backend only
npm run server:dev

# Start frontend only
npm run client:dev
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key for AI recommendations
- `SESSION_SECRET`: Secret for session management (generated automatically if not provided)
- `PORT`: Override the default port (3000)

## Database Schema

The application uses 7 tables:
- `users`: User accounts and profiles
- `wardrobe_items`: Individual clothing items with metadata
- `outfits`: Saved outfit combinations
- `inspirations`: Fashion inspiration content
- `weather_preferences`: User preferences for weather conditions
- `mood_preferences`: User preferences for different moods
- `session`: Session management

## API Endpoints

The application provides a comprehensive REST API for managing wardrobe items, outfits, user preferences, and AI recommendations. Key endpoints include:

- `/api/health`: System health check
- `/api/wardrobe`: Wardrobe item management
- `/api/outfits`: Outfit management
- `/api/weather`: Weather information
- `/api/ai-outfit-recommendations`: AI styling recommendations

## Testing

Use the following test credentials:
- Username: `fashionuser`
- Password: `password123`

## Deployment

The application is ready for deployment to various platforms:

- **Replit**: Already configured for deployment
- **Heroku/Render/Fly.io**: Use the Procfile with `web: node start.js`
- **Docker**: A Dockerfile is provided for containerized deployment

## Troubleshooting

- **Database Connection Issues**: Verify your PostgreSQL connection details and ensure the service is running
- **Port Conflicts**: The application will automatically try alternative ports if the default ones are in use
- **API Key Issues**: Ensure your OpenAI API key is valid and has appropriate permissions