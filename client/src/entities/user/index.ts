/**
 * User Entity
 *
 * FSD Entity layer - domain model for User.
 * Contains model types, hooks, and UI components.
 */

// Re-export types from shared schema
export type { User, InsertUser } from '@shared/schema';

// Re-export auth hook (primary user accessor)
export { useAuth, AuthProvider } from '@/hooks/use-auth';

// Re-export user avatar component (will be created)
// export { UserAvatar } from './ui/user-avatar';
