# Cher's Closet: Intelligent Wardrobe Management Platform

An intelligent wardrobe management platform that transforms personal styling through AI-driven insights and interactive design. The application provides dynamic fashion recommendations, personalized style analysis, and engaging user experiences to help users discover and optimize their personal style.

## Key Technologies

- React frontend with Radix UI components
- Node.js backend with Drizzle ORM
- PostgreSQL database with Neon serverless
- OpenAI integration for recommendations
- Tailwind CSS for styling
- Responsive, mobile-first design
- Interactive style profiling system
- Accessibility-focused UI components

## Project Setup Instructions

### Setup with Replit

1. **Clone the Repository**: Fork this repository in Replit
2. **Install Dependencies**: Replit should automatically install dependencies
3. **Database Setup**: 
   - Replit provides a PostgreSQL database automatically
   - Run `npm run db:push` to set up the database schema

### Setup with VS Code

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   - Create a PostgreSQL database (locally or using a service like Neon)
   - Set up environment variables (see Environment Variables section)
   - Run `npm run db:push` to set up the database schema

4. **Configure Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://<username>:<password>@<hostname>:<port>/<database>
   PGPORT=<port>
   PGUSER=<username>
   PGPASSWORD=<password>
   PGDATABASE=<database>
   PGHOST=<hostname>
   SESSION_SECRET=<random-string-for-session-encryption>
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── client/                # Frontend code
│   ├── index.html         # HTML entry point
│   └── src/               # React components and logic
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Frontend utilities
│       ├── pages/         # Page components
│       └── App.tsx        # Main application component
├── server/                # Backend code
│   ├── app.ts             # Express app setup
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage implementation
│   └── index.ts           # Server entry point
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema and types
├── migrations/            # Database migrations
├── scripts/               # Utility scripts
├── drizzle.config.ts      # Drizzle ORM configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── vite.config.ts         # Vite configuration
```

## Key Features

1. **Wardrobe Management**:
   - Add, edit, and categorize clothing items
   - Upload images of your clothing
   - Organize by category, color, season, and more

2. **Outfit Creation**:
   - Create and save outfits from your wardrobe
   - Get AI-powered outfit recommendations
   - Schedule outfits for specific dates

3. **Style Analysis**:
   - Get insights into your style preferences
   - Track most-worn items and outfits
   - Identify gaps in your wardrobe

4. **Weather Integration**:
   - Get outfit recommendations based on weather
   - Set weather preferences for different conditions

5. **Mood-Based Styling**:
   - Select outfits based on your mood
   - Save mood preferences for quick recommendations

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run check`: Run TypeScript type checking
- `npm run db:push`: Push schema changes to the database

## Database Schema

The application uses a PostgreSQL database with the following tables:

- `sessions`: Session storage for authentication
- `users`: User accounts and profiles
- `wardrobe_items`: Individual clothing items
- `outfits`: Created outfit combinations
- `inspirations`: Fashion inspiration content
- `weather_preferences`: User preferences for different weather conditions
- `mood_preferences`: User preferences for different moods

## Transitioning Between Replit and VS Code

### Exporting from Replit to VS Code

1. **Clone Your Replit Repository**:
   - Get your Replit repository Git URL from the Version Control panel
   - Clone it locally using Git

2. **Set Up Environment Variables**:
   - Copy environment variables from Replit to your local .env file
   - For the database, you can either:
     - Use a local PostgreSQL installation
     - Continue using your Replit PostgreSQL (ensure your IP is allowed)
     - Set up a new cloud PostgreSQL instance (e.g., Neon, Supabase)

3. **Install Dependencies**:
   - Run `npm install` to install all dependencies locally

4. **Run the Application**:
   - Run `npm run dev` to start the development server

### Importing from VS Code to Replit

1. **Create a New Replit**:
   - Create a new Replit with the Node.js template

2. **Import Your Code**:
   - Import your code from GitHub/GitLab, or
   - Use the Replit CLI to push your code

3. **Set Up Environment Variables**:
   - Add your environment variables in the Replit Secrets tab

4. **Install Dependencies**:
   - Replit should automatically install dependencies

5. **Run the Application**:
   - Use the Run button or set up a custom run command

## Connecting to Replit Database from VS Code

If you want to use the Replit PostgreSQL database while developing in VS Code:

1. **Get Database Connection Details**:
   - These are available in the Replit environment as:
     - `DATABASE_URL`
     - `PGHOST`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`
     - `PGPORT`

2. **Set Up SSH Tunneling** (if required):
   - Replit databases might require SSH tunneling for external access
   - Use a tool like `ssh -L 5432:localhost:5432 username@replit-instance`

3. **Update Local Environment Variables**:
   - Add these connection details to your local .env file

4. **Test the Connection**:
   - Run a simple query to verify the connection works

## Note on Environment Differences

- **Port Configuration**: Replit uses port forwarding differently than local development
- **File System Access**: Some file paths might need adjustment between environments
- **Environment Variables**: Make sure all required variables are set in both environments
- **Network Access**: Replit has specific network rules that might differ from your local setup

## Troubleshooting

### Common Issues in Replit

1. **Database Connection Issues**:
   - Verify environment variables are correctly set
   - Check if the database service is running

2. **Port Access Issues**:
   - Make sure you're using the correct port forwarding in Replit
   - Use `0.0.0.0` instead of `localhost` for binding

3. **Memory Limitations**:
   - Replit has memory constraints that might affect large operations
   - Optimize your code for lower memory usage

### Common Issues in VS Code

1. **Environment Variables**:
   - Ensure .env file is properly configured
   - Restart the server after changing environment variables

2. **Node.js Version Differences**:
   - Use a similar Node.js version as Replit (check .replit file)
   - Consider using nvm to manage Node.js versions

3. **Database Connection**:
   - Make sure PostgreSQL is installed and running locally
   - Check connection parameters in the .env file

## Project Documentation

For more detailed information, please refer to the following documentation files:

- [VS Code Setup Guide](./docs/vs-code-setup.md) - Detailed instructions for setting up and working with VS Code
- [Database Synchronization Guide](./docs/database-sync.md) - How to keep databases in sync between environments
- [Workflow Optimization Guide](./docs/workflow-optimization.md) - Best practices for development workflow
- [Troubleshooting Guide](./docs/troubleshooting.md) - Solutions to common issues when transitioning from Replit to VS Code
- [Commands Cheatsheet](./docs/commands-cheatsheet.md) - Quick reference for common commands and tasks

### Environment Testing

To verify your development environment is correctly set up, run:

```bash
node scripts/test-env.js
```

This script will check:
- Required environment variables
- Database connectivity
- VS Code configuration
- Schema setup

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Replit Documentation](https://docs.replit.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)