/**
 * Application Configuration
 * 
 * This module centralizes all application configuration settings.
 * It loads values from environment variables with sensible defaults.
 */

// Determine the runtime environment
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';
const isTest = nodeEnv === 'test';
const isReplit = process.env.REPL_ID != null && process.env.REPL_OWNER != null;

// Environment configuration
export const environment = {
  nodeEnv,
  isProduction,
  isDevelopment,
  isTest,
  isReplit
};

// Server configuration
export const server = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : '*'
};

// Database configuration
export const database = {
  url: process.env.DATABASE_URL || '',
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'postgres',
  maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10)
};

// Authentication configuration
export const auth = {
  sessionSecret: process.env.SESSION_SECRET || 'chers-closet-session-secret',
  cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE || String(24 * 60 * 60 * 1000), 10), // 24 hours
  saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
  jwtSecret: process.env.JWT_SECRET || 'chers-closet-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

// OpenAI configuration for AI features
export const openai = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
};

// Application-specific configuration
export const app = {
  name: 'Cher\'s Closet',
  version: process.env.npm_package_version || '1.0.0',
  defaultAdminUser: process.env.DEFAULT_ADMIN_USER || 'admin',
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com'
};

// Weather API configuration
export const weather = {
  apiKey: process.env.WEATHER_API_KEY || '',
  baseUrl: process.env.WEATHER_API_BASE_URL || 'https://api.weatherapi.com/v1',
  defaultLocation: process.env.DEFAULT_WEATHER_LOCATION || 'Los Angeles'
};

// Export configuration object
export default {
  environment,
  server,
  database,
  auth,
  openai,
  app,
  weather
};