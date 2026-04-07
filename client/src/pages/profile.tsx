import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useGameProgress } from "@/hooks/use-game-progress";
import { Link } from "wouter";
import { User, Settings, LogOut, Save, Crown, UserPlus } from "lucide-react";

const availableAvatars = [
  "🦀", "🌊", "🐚", "🔬", "🏖️", "🐠", "🫧", "⭐", "🏆", "👑",
  "🌺", "🍀", "🌙", "☀️", "🎯", "🎮", "📚", "🎨", "🎵", "⚡"
];

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: progress } = useGameProgress();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🦀");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName((user as any).displayName || "");
      setSelectedAvatar((user as any).avatarEmoji || "🦀");
      setBio((user as any).bio || "");
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; createNew: boolean }) => {
      return await apiRequest("/api/auth/login", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Welcome!", description: "Successfully signed in to Crabby Crew!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowLogin(false);
    },
    onError: (error: any) => {
      toast({ title: "Sign In Failed", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName: string; avatarEmoji: string; bio?: string }) => {
      return await apiRequest("/api/profile", "PUT", data);
    },
    onSuccess: () => {
      toast({ title: "Profile Updated", description: "Your profile has been saved!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({ title: "Update Failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", "POST", {});
      toast({ title: "Signed Out", description: "See you next time!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch {}
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="h-64 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>
    );
  }

  // ── Unauthenticated ──
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <h1 className="section-title text-3xl mb-2">Join Crabby Crew!</h1>
        <p className="section-subtitle mb-8">Create a profile to save progress and compete with friends.</p>

        <div className="glass-card-lg p-8">
          <div className="text-6xl mb-3">🦀</div>
          <h3 className="font-fredoka text-white text-xl mb-4">Ready to dive deeper?</h3>

          {!showLogin ? (
            <>
              <p className="text-white/50 text-sm mb-6">Choose a username to get started — no email required!</p>
              <button onClick={() => setShowLogin(true)} className="cta-coral w-full font-fredoka py-3 rounded-xl flex items-center justify-center gap-2">
                <User className="h-5 w-5" /> Create Profile
              </button>
            </>
          ) : (
            <div className="space-y-4 text-left">
              <div>
                <label className="text-white/70 text-sm font-semibold block mb-1">Choose a Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:border-white/40 focus:outline-none"
                />
                <p className="text-white/30 text-xs mt-1">At least 3 characters</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (username.length >= 3) loginMutation.mutate({ username, createNew: false }); }}
                  disabled={loginMutation.isPending}
                  className="cta-glass flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <User className="h-4 w-4" /> Sign In
                </button>
                <button
                  onClick={() => { if (username.length >= 3) loginMutation.mutate({ username, createNew: true }); }}
                  disabled={loginMutation.isPending}
                  className="cta-coral flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <UserPlus className="h-4 w-4" /> Create New
                </button>
              </div>
              <button onClick={() => setShowLogin(false)} className="text-white/40 text-xs w-full text-center hover:text-white/60">Back</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Authenticated profile ──
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Settings className="h-6 w-6 text-[#7ec8c8]" />
          <h1 className="section-title text-3xl">My Profile</h1>
        </div>
        <p className="section-subtitle">Customize your ocean explorer identity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="glass-card-lg p-6 space-y-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-5 w-5 text-[#7ec8c8]" />
            <h2 className="font-fredoka text-white text-lg">Profile Settings</h2>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-white/70 text-sm font-semibold block mb-1">Display Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:border-white/40 focus:outline-none"
            />
            <p className="text-white/30 text-xs mt-1">How others see you on leaderboards</p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-white/70 text-sm font-semibold block mb-1">About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={160}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:border-white/40 focus:outline-none resize-none"
            />
            <p className="text-white/30 text-xs mt-1">A short bio (max 160 characters)</p>
          </div>

          {/* Avatar */}
          <div>
            <label className="text-white/70 text-sm font-semibold block mb-2">Choose Avatar</label>
            <div className="grid grid-cols-5 gap-2">
              {availableAvatars.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-2xl p-2.5 rounded-lg border transition-all hover:scale-110 ${
                    selectedAvatar === emoji
                      ? "border-[#ff6b4a] bg-[#ff6b4a]/10 scale-105"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Account Info */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
            <h4 className="text-white font-semibold">Account Info</h4>
            <div className="text-white/50"><span className="text-white/70">Username:</span> {(user as any)?.username}</div>
            <div className="text-white/50">
              <span className="text-white/70">Member since:</span>{" "}
              {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : "Unknown"}
            </div>
            <div className="text-white/50 flex items-center gap-1">
              <span className="text-white/70">Status:</span>
              <span className="w-2 h-2 bg-[#7ec8c8] rounded-full inline-block" /> Online
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => updateProfileMutation.mutate({ displayName, avatarEmoji: selectedAvatar, bio })}
              disabled={updateProfileMutation.isPending}
              className="cta-coral flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
            >
              <Save className="h-4 w-4" /> {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleLogout}
              className="cta-glass py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center gap-1.5 text-red-300 border-red-400/20 hover:bg-red-400/10"
            >
              <LogOut className="h-4 w-4" /> Out
            </button>
          </div>
        </div>

        {/* Stats & Badges */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-[#f5e6c8]" />
              <h3 className="font-fredoka text-white text-base">Explorer Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: progress?.totalXp || 0, label: "Total XP", color: "#7ec8c8" },
                { val: progress?.level || 1, label: "Level", color: "#ff6b4a" },
                { val: progress?.learnedSpecies?.length || 0, label: "Species", color: "#f5e6c8" },
                { val: progress?.currentStreak || 0, label: "Streak", color: "#7ec8c8" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-white/40 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-fredoka text-white text-base mb-3">Your Badges</h3>
            {progress?.badges && progress.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.badges.map((badgeId: string) => (
                  <span key={badgeId} className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a]">
                    {badgeId.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-center py-4 text-sm">No badges yet. Start learning to unlock achievements!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
