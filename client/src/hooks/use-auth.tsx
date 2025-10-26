import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function clearAuth() {
  queryClient.setQueryData(["/api/user"], null);
  queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
  queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
  queryClient.invalidateQueries({ queryKey: ["/api/inspirations"] });
}

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  updateUserMutation: UseMutationResult<SelectUser, Error, Partial<InsertUser>>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", { username: credentials.username });
      const result = await apiRequest<SelectUser>({
        path: "/api/login",
        method: "POST",
        body: credentials
      });
      console.log("Login successful, user:", result);
      return result;
    },
    onSuccess: async (user: SelectUser) => {
      console.log("onSuccess called with user:", user);
      queryClient.setQueryData(["/api/user"], user);
      // Wait a brief moment to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 100));
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error details:", error);
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      toast({
        title: "Login failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log("Attempting registration with:", { username: credentials.username });
      const result = await apiRequest<SelectUser>({
        path: "/api/register",
        method: "POST",
        body: credentials
      });
      console.log("Registration successful, user:", result);
      return result;
    },
    onSuccess: async (user: SelectUser) => {
      console.log("onSuccess called with user:", user);
      queryClient.setQueryData(["/api/user"], user);
      // Wait a brief moment to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 100));
      toast({
        title: "Registration successful",
        description: `Welcome to Cher's Closet, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error details:", error);
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      toast({
        title: "Registration failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<InsertUser>) => {
      return await apiRequest<SelectUser>({
        path: "/api/user",
        method: "PATCH",
        body: userData
      });
    },
    onSuccess: (updatedUser: SelectUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest({
        path: "/api/logout",
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateUserMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}