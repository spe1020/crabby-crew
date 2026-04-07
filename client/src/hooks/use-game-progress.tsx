import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import type { GameProgress } from "@shared/schema";

export function useGameProgress() {
  const { user, isAuthenticated } = useAuth();
  const userId = (user as any)?.id;

  const queryEnabled = isAuthenticated && !!userId;

  const query = useQuery<GameProgress>({
    queryKey: ['/api/progress', userId || 'guest'],
    queryFn: async () => {
      if (!userId) {
        return null;
      }
      const response = await fetch(`/api/progress/${userId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      return await response.json();
    },
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  return query;
}
