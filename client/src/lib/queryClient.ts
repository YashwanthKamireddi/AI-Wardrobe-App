import { QueryClient, QueryFunction, MutationCache, QueryCache } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to get response as text
    let text;
    try {
      text = await res.text();
      // Check if the response is HTML (which could contain DOCTYPE)
      if (text.toLowerCase().includes('<!doctype html>') || 
          text.toLowerCase().includes('<html') || 
          text.toLowerCase().includes('<body')) {
        // If it's HTML, return a more user-friendly error message
        throw new Error(`Server error (${res.status}): The server returned an HTML page instead of data`);
      }
    } catch (e) {
      // If we can't parse the response, use statusText as fallback
      text = res.statusText;
    }
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  options: {
    path: string;
    method: string;
    body?: unknown;
  },
  auth: { on401: UnauthorizedBehavior } = { on401: "throw" }
): Promise<T> {
  const res = await fetch(options.path, {
    method: options.method,
    headers: options.body ? { "Content-Type": "application/json" } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  if (auth.on401 === "returnNull" && res.status === 401) {
    return null as T;
  }

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

function handle401Error(error: Error) {
  // Only handle 401 errors, but don't redirect on mutation errors
  // This prevents premature redirects during login/registration
  if (error.message.includes("401")) {
    // Clear user data but don't show toast or redirect
    // The individual mutation onError handlers will show appropriate messages
    queryClient.setQueryData(["/api/user"], null);
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handle401Error(error as Error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handle401Error(error as Error);
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
