/**
 * Shared UI Components - Design System Index
 *
 * Feature-Sliced Design: These are domain-agnostic, reusable UI primitives.
 * Components here should NOT contain business logic.
 */

// Re-export all UI primitives from components/ui
export * from '@/components/ui/button';
export * from '@/components/ui/card';
export * from '@/components/ui/input';
export * from '@/components/ui/label';
export * from '@/components/ui/badge';
export * from '@/components/ui/skeleton';
export * from '@/components/ui/dialog';
export * from '@/components/ui/toast';
export * from '@/components/ui/toaster';

// Toast hook is in hooks folder
export { useToast } from '@/hooks/use-toast';
