/**
 * App Header Widget
 *
 * FSD Widget layer - application header with navigation.
 */

// Re-export header component
export { AppLayout } from '@/components/layout/app-layout';

// Navigation items type
export interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}
