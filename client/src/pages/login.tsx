import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import Bubbles from "@/components/landing/Bubbles";

export default function Login() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || username.trim().length < 3) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), createNew: true }),
        credentials: "include",
      });

      if (response.ok) {
        await response.json();
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        // Redirect happens via the useEffect above once user state updates
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
        setIsLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="landing-bg min-h-screen flex items-center justify-center px-4">
      <Bubbles count={12} />

      <div className="relative z-10 w-full max-w-sm fade-in-up" style={{ animationDelay: "0.15s" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl landing-crab mb-3">🦀</div>
          <h1 className="font-fredoka text-white text-3xl">Crabby Crew</h1>
          <p className="text-white/60 text-sm mt-1">Ocean Learning Adventure</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <h2 className="font-fredoka text-white text-xl text-center mb-5">
            Welcome, Explorer!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-white/70 text-sm font-semibold mb-2">
                Choose Your Explorer Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors text-base"
                required
                minLength={3}
                maxLength={20}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-white/40 text-xs mt-2">
                This will be your explorer name in the ocean adventure!
              </p>
            </div>

            {error && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)" }}>
                <p className="text-red-300 text-center text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || username.trim().length < 3}
              className="cta-coral w-full font-fredoka py-3.5 rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Starting Adventure...
                </span>
              ) : (
                "Start Your Ocean Adventure 🌊"
              )}
            </button>
          </form>

          <p className="text-white/30 text-xs text-center mt-5">
            No password needed — just pick a name and start exploring!
          </p>
        </div>
      </div>
    </div>
  );
}
