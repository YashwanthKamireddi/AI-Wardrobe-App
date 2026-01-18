/**
 * Auth Feature
 *
 * FSD Feature layer - authentication actions.
 * Login, register, logout functionality.
 */

// Re-export auth hook and context
export { useAuth, AuthProvider } from '@/hooks/use-auth';

// Export auth-related API functions
export { apiRequest as authApiRequest } from '@/lib/queryClient';

// Auth form types
export interface LoginFormData {
    username: string;
    password: string;
}

export interface RegisterFormData extends LoginFormData {
    name?: string;
    email?: string;
}

// Auth state types
export interface AuthState {
    user: import('@shared/schema').User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
