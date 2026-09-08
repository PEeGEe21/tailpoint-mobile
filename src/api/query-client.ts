import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
export async function clearOrganizationQueries(organizationId: string | null) {
  if (!organizationId) return;
  const predicate = ({ queryKey }: { queryKey: readonly unknown[] }) =>
    queryKey.includes(organizationId);
  await queryClient.cancelQueries({ predicate });
  queryClient.removeQueries({ predicate });
}
