import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import type { GameProgress } from "@shared/schema";

export function useGameProgress() {
  const { user, isAuthenticated } = useAuth();
  const userId = (user as any)?.id;

  return useQuery<GameProgress>({
    queryKey: ['/api/progress', userId || 'guest'],
    enabled: isAuthenticated && !!userId,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });
}
