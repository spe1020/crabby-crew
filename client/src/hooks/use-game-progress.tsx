import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import type { GameProgress } from "@shared/schema";

export function useGameProgress() {
  const { user, isAuthenticated } = useAuth();
  const userId = (user as any)?.id;

  console.log("useGameProgress hook:", { 
    user, 
    isAuthenticated, 
    userId,
    userType: typeof user,
    userKeys: user ? Object.keys(user) : null
  });

  const queryEnabled = isAuthenticated && !!userId;
  console.log("Query enabled:", queryEnabled, "because:", { isAuthenticated, hasUserId: !!userId });

  const query = useQuery<GameProgress>({
    queryKey: ['/api/progress', userId || 'guest'],
    queryFn: async () => {
      console.log("Fetching progress for user:", userId);
      if (!userId) {
        console.log("No userId, returning null");
        return null;
      }
      const response = await fetch(`/api/progress/${userId}`, {
        credentials: 'include'
      });
      console.log("Progress response:", response.status, response.ok);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      console.log("Progress data:", data);
      return data;
    },
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  console.log("Query result:", {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isFetching: query.isFetching,
    status: query.status
  });

  return query;
}
