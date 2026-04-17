/**
 * Unified API Request Helper
 * Single source of truth for all API calls
 *
 * Features:
 * - Type-safe requests
 * - Automatic JSON handling
 * - Credential inclusion
 * - Error handling
 */

export interface ApiRequestConfig<TBody = unknown> {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: TBody;
    headers?: Record<string, string>;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public statusText: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Make an API request with automatic JSON handling
 */
export async function apiRequest<TResponse = unknown, TBody = unknown>(
    config: ApiRequestConfig<TBody>
): Promise<TResponse> {
    const options: RequestInit = {
        method: config.method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...config.headers,
        },
    };

    if (config.body !== undefined) {
        options.body = JSON.stringify(config.body);
    }

    const response = await fetch(config.path, options);

    if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new ApiError(
            errorText || `Request failed: ${response.statusText}`,
            response.status,
            response.statusText
        );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return {} as TResponse;
    }

    return response.json();
}

/**
 * Shorthand helpers for common HTTP methods
 */
export const api = {
    get: <T = unknown>(path: string) =>
        apiRequest<T>({ path, method: 'GET' }),

    post: <T = unknown, B = unknown>(path: string, body?: B) =>
        apiRequest<T, B>({ path, method: 'POST', body }),

    put: <T = unknown, B = unknown>(path: string, body?: B) =>
        apiRequest<T, B>({ path, method: 'PUT', body }),

    patch: <T = unknown, B = unknown>(path: string, body?: B) =>
        apiRequest<T, B>({ path, method: 'PATCH', body }),

    delete: <T = unknown>(path: string) =>
        apiRequest<T>({ path, method: 'DELETE' }),
};

export default apiRequest;
