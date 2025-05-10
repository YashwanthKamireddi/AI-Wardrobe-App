/**
 * Response Formatter Utility
 * 
 * Provides standardized response formatting for API endpoints.
 * This ensures consistent JSON structure across all API responses.
 */

import { Response } from 'express';

// Interface for paginated data responses
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Formats a successful response with the provided data
 * 
 * @param res - Express response object
 * @param data - Data to send in the response
 * @param statusCode - HTTP status code (default: 200)
 */
export function sendSuccess(
  res: Response,
  data: any,
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

/**
 * Formats an error response
 * 
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param details - Optional error details
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  details?: any
) {
  const response: any = {
    success: false,
    error: {
      message
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Formats a paginated response
 * 
 * @param res - Express response object
 * @param data - Array of data items
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const pages = Math.ceil(total / limit);
  
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
  
  return res.status(200).json({
    success: true,
    ...response
  });
}

/**
 * Sends a created response (201) with the new resource
 * 
 * @param res - Express response object
 * @param data - The created resource data
 * @param location - Optional location header URL
 */
export function sendCreated(
  res: Response,
  data: any,
  location?: string
) {
  if (location) {
    res.location(location);
  }
  
  return res.status(201).json({
    success: true,
    data
  });
}

/**
 * Sends a no content (204) response
 * 
 * @param res - Express response object
 */
export function sendNoContent(res: Response) {
  return res.status(204).end();
}

export default {
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent
};