/**
 * Custom hook for managing weather and mood preferences
 * Provides CRUD operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import type { WeatherPreference, MoodPreference } from "@shared/schema";

// API functions
async function fetchWeatherPreferences(): Promise<WeatherPreference[]> {
    const response = await fetch("/api/weather-preferences", {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch weather preferences");
    return response.json();
}

async function fetchMoodPreferences(): Promise<MoodPreference[]> {
    const response = await fetch("/api/mood-preferences", {
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch mood preferences");
    return response.json();
}

async function createWeatherPreference(data: {
    weatherType: string;
    preferredCategories: string[];
}): Promise<WeatherPreference> {
    const response = await fetch("/api/weather-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create weather preference");
    return response.json();
}

async function updateWeatherPreference(
    id: number,
    data: { preferredCategories?: string[] }
): Promise<WeatherPreference> {
    const response = await fetch(`/api/weather-preferences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update weather preference");
    return response.json();
}

async function deleteWeatherPreference(id: number): Promise<void> {
    const response = await fetch(`/api/weather-preferences/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete weather preference");
}

async function createMoodPreference(data: {
    mood: string;
    preferredCategories?: string[];
    preferredColors?: string[];
}): Promise<MoodPreference> {
    const response = await fetch("/api/mood-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create mood preference");
    return response.json();
}

async function updateMoodPreference(
    id: number,
    data: { preferredCategories?: string[]; preferredColors?: string[] }
): Promise<MoodPreference> {
    const response = await fetch(`/api/mood-preferences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update mood preference");
    return response.json();
}

async function deleteMoodPreference(id: number): Promise<void> {
    const response = await fetch(`/api/mood-preferences/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete mood preference");
}

// Hooks
export function useWeatherPreferences() {
    return useQuery({
        queryKey: ["/api/weather-preferences"],
        queryFn: fetchWeatherPreferences,
    });
}

export function useMoodPreferences() {
    return useQuery({
        queryKey: ["/api/mood-preferences"],
        queryFn: fetchMoodPreferences,
    });
}

export function useCreateWeatherPreference() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: createWeatherPreference,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/weather-preferences"] });
            toast({
                title: "Preference saved",
                description: "Your weather preference has been saved.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to save weather preference.",
                variant: "destructive",
            });
        },
    });
}

export function useUpdateWeatherPreference() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: number; preferredCategories?: string[] }) =>
            updateWeatherPreference(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/weather-preferences"] });
            toast({
                title: "Preference updated",
                description: "Your weather preference has been updated.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update weather preference.",
                variant: "destructive",
            });
        },
    });
}

export function useDeleteWeatherPreference() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: deleteWeatherPreference,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/weather-preferences"] });
            toast({
                title: "Preference deleted",
                description: "Your weather preference has been removed.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete weather preference.",
                variant: "destructive",
            });
        },
    });
}

export function useCreateMoodPreference() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: createMoodPreference,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mood-preferences"] });
            toast({
                title: "Preference saved",
                description: "Your mood preference has been saved.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to save mood preference.",
                variant: "destructive",
            });
        },
    });
}

export function useUpdateMoodPreference() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({
            id,
            ...data
        }: {
            id: number;
            preferredCategories?: string[];
            preferredColors?: string[];
        }) => updateMoodPreference(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mood-preferences"] });
            toast({
                title: "Preference updated",
                description: "Your mood preference has been updated.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update mood preference.",
                variant: "destructive",
            });
        },
    });
}

export function useDeleteMoodPreference() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: deleteMoodPreference,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mood-preferences"] });
            toast({
                title: "Preference deleted",
                description: "Your mood preference has been removed.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete mood preference.",
                variant: "destructive",
            });
        },
    });
}
