
import { QueryClient, QueryCache } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      onError: (error: any) => {
        toast.error(error?.message || 'Something went wrong');
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  }),
});

// Cache prefetching for better UX
export const prefetchQueries = () => {
  // Prefetch common data
  queryClient.prefetchQuery({
    queryKey: ['wardrobeItems'],
    queryFn: () => fetch('/api/wardrobe').then(res => res.json()),
  });
};
