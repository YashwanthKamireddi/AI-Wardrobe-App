/**
 * Application Logger
 * 
 * This module provides a consistent logging interface throughout the application.
 * It supports different log levels and formatting based on the environment.
 */

import { environment } from '../config/app-config';

// Log levels with their numeric priority
export enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  NONE = 5
}

// Set the minimum log level based on environment
const minimumLogLevel = environment.isProduction 
  ? LogLevel.INFO // In production, don't log debug messages
  : LogLevel.DEBUG; // In development, log everything

// Get a timestamp string for log messages
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Formats a log message with consistent structure
 */
function formatLogMessage(level: string, message: string, context?: Record<string, any>): string {
  const timestamp = getTimestamp();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

/**
 * Creates a logger instance with an optional module name prefix
 */
export function createLogger(moduleName?: string) {
  const prefix = moduleName ? `[${moduleName}] ` : '';
  
  return {
    debug(message: string, context?: Record<string, any>) {
      if (minimumLogLevel <= LogLevel.DEBUG) {
        console.debug(formatLogMessage('DEBUG', prefix + message, context));
      }
    },
    
    info(message: string, context?: Record<string, any>) {
      if (minimumLogLevel <= LogLevel.INFO) {
        console.info(formatLogMessage('INFO', prefix + message, context));
      }
    },
    
    warn(message: string, context?: Record<string, any>) {
      if (minimumLogLevel <= LogLevel.WARN) {
        console.warn(formatLogMessage('WARN', prefix + message, context));
      }
    },
    
    error(message: string, error?: Error, context?: Record<string, any>) {
      if (minimumLogLevel <= LogLevel.ERROR) {
        const combinedContext = error 
          ? { ...context, errorName: error.name, stack: error.stack }
          : context;
        console.error(formatLogMessage('ERROR', prefix + message, combinedContext));
      }
    }
  };
}

// Create default application logger
export const logger = createLogger('app');

export default {
  createLogger,
  logger,
  LogLevel
};