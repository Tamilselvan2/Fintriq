import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: (failureCount, error: any) => {
        // Do not retry on 401/403 or if it already failed 3 times
        if (error?.response?.status === 401 || error?.response?.status === 403) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error: any) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        toast.error(message);
      },
    },
  },
});
