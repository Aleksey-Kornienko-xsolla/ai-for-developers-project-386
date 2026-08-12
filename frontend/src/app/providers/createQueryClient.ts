import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

const config: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
};

export const createQueryClient = () => new QueryClient(config);