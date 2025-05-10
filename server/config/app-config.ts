/**
 * Application Configuration
 * 
 * This file centralizes all application configuration parameters,
 * making it easier to manage environment-specific settings and
 * preventing magic values from being scattered throughout the codebase.
 */

// Environment detection
export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isReplit: process.env.REPL_ID !== undefined,
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Server configuration
export const server = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  baseUrl: process.env.BASE_URL || `http://localhost:${parseInt(process.env.PORT || '3000', 10)}`,
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
};

// Database configuration
export const database = {
  url: process.env.DATABASE_URL,
  maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  connectionTimeoutMs: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000', 10)
};

// Authentication configuration
export const auth = {
  sessionSecret: process.env.SESSION_SECRET || 'chers-closet-dev-secret', // Should be changed in production
  saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
  tokenExpiryHours: parseInt(process.env.TOKEN_EXPIRY_HOURS || '24', 10),
  cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE || '2592000000', 10) // 30 days in milliseconds
};

// External Services
export const services = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10)
  }
};

// Feature flags
export const features = {
  enableAiSuggestions: process.env.ENABLE_AI_SUGGESTIONS !== 'false',
  enableWeatherIntegration: process.env.ENABLE_WEATHER !== 'false',
  debugMode: process.env.DEBUG_MODE === 'true'
};

// Application paths
export const paths = {
  uploads: process.env.UPLOAD_PATH || './uploads',
  assets: process.env.ASSET_PATH || './assets',
  temp: process.env.TEMP_PATH || './temp'
};

// Default export for convenience
export default {
  environment,
  server,
  database,
  auth,
  services,
  features,
  paths
};