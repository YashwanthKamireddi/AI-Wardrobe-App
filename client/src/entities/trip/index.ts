/**
 * Trip Entity
 *
 * FSD Entity layer - domain model for Trip.
 * Contains model types, hooks, and UI components.
 */

// Re-export types from shared schema
export type { Trip, InsertTrip } from '@shared/schema';

// Note: Trip hooks would be imported here when available
// export { useTrips, useTrip, useCreateTrip, useUpdateTrip, useDeleteTrip } from '@/hooks/use-trips';

// Climate options for trip planning
export const TRIP_CLIMATES = [
    { value: 'tropical', label: 'Tropical' },
    { value: 'desert', label: 'Desert' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'temperate', label: 'Temperate' },
    { value: 'continental', label: 'Continental' },
    { value: 'arctic', label: 'Arctic/Cold' },
    { value: 'mixed', label: 'Mixed' },
] as const;

// Common travel activities
export const TRIP_ACTIVITIES = [
    'Sightseeing',
    'Beach',
    'Hiking',
    'Business Meetings',
    'Fine Dining',
    'Nightlife',
    'Shopping',
    'Adventure Sports',
    'Cultural Events',
    'Relaxation',
    'Photography',
    'Wedding/Event',
] as const;
