import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";

export default function Login() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          createNew: true, // Allow creating new users
        }),
        credentials: "include", // Important for sessions
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        
        // Invalidate and refetch the auth query to update the UI
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        // Redirect to home page
        setLocation("/");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 to-ocean-100 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce-gentle">🦀</div>
          <h1 className="text-4xl font-fredoka text-ocean-600 mb-2">Crabby Crew</h1>
          <p className="text-ocean-500 text-lg">Ocean Learning Adventure</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-ocean-200">
          <h2 className="text-2xl font-bold text-center text-ocean-600 mb-6">
            Welcome, Ocean Explorer!
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-ocean-700 mb-2">
                Choose Your Explorer Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 border-2 border-ocean-200 rounded-2xl focus:border-ocean-400 focus:outline-none transition-colors text-lg"
                required
                minLength={3}
                maxLength={20}
                disabled={isLoading}
              />
              <p className="text-sm text-ocean-500 mt-2">
                This will be your explorer name in the ocean adventure!
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || username.trim().length < 3}
              className="w-full bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-bold py-4 px-6 rounded-2xl text-lg hover:from-ocean-600 hover:to-ocean-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Starting Adventure...
                </div>
              ) : (
                "Start Your Ocean Adventure! 🌊"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ocean-500">
              Don't worry about passwords - just pick a name and start exploring!
            </p>
          </div>
        </div>

        {/* Ocean-themed decorative elements */}
        <div className="absolute top-10 left-10 text-4xl animate-float opacity-60">🐠</div>
        <div className="absolute top-20 right-10 text-3xl animate-bubble opacity-50">🫧</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-float opacity-40" style={{animationDelay: '1s'}}>🌊</div>
        <div className="absolute bottom-10 right-20 text-4xl animate-bubble opacity-60" style={{animationDelay: '2s'}}>🦐</div>
      </div>
    </main>
  );
}
