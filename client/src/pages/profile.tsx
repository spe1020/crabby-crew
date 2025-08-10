import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Settings, LogOut, Save, Crown, UserPlus } from "lucide-react";
import { useGameProgress } from "@/hooks/use-game-progress";

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
  const [username, setUsername] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      setDisplayName((user as any).displayName || "");
      setSelectedAvatar((user as any).avatarEmoji || "🦀");
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; createNew: boolean }) => {
      return await apiRequest("/api/auth/login", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome!",
        description: "Successfully signed in to Crabby Crew!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowLogin(false);
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName: string; avatarEmoji: string }) => {
      return await apiRequest("/api/profile", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      displayName,
      avatarEmoji: selectedAvatar,
    });
  };

  const handleLogin = (createNew: boolean) => {
    if (!username || username.length < 3) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 3 characters long.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, createNew });
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", "POST", {});
      toast({
        title: "Signed Out",
        description: "Successfully signed out of Crabby Crew.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Join Crabby Crew!
            </h1>
            <p className="text-lg text-gray-600">
              Create a profile to save your progress, compete with friends, and customize your avatar.
            </p>
          </div>
          
          <Card className="max-w-md mx-auto shadow-lg border-2 border-blue-100">
            <CardContent className="p-8">
              <div className="text-6xl mb-4 text-center">🦀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Ready to dive deeper?
              </h3>
              
              {!showLogin ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6 text-center">
                    Choose a username to get started - no email required!
                  </p>
                  <Button 
                    onClick={() => setShowLogin(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Create Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-left">
                    <Label htmlFor="username">Choose a Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="border-2 border-gray-200"
                      maxLength={20}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      At least 3 characters, no spaces or special symbols
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleLogin(false)}
                      disabled={loginMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => handleLogin(true)}
                      disabled={loginMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => setShowLogin(false)}
                    variant="ghost"
                    className="w-full"
                    size="sm"
                  >
                    Back
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              My Profile
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Customize your ocean explorer identity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Customize how you appear to other ocean explorers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="border-2 border-gray-200"
                />
                <p className="text-sm text-gray-500">
                  This is how other users will see you on leaderboards
                </p>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-4">
                <Label>Choose Your Avatar</Label>
                <div className="grid grid-cols-5 gap-3">
                  {availableAvatars.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`text-3xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                        selectedAvatar === emoji
                          ? "border-blue-500 bg-blue-50 scale-105"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Pick an emoji that represents your ocean explorer personality
                </p>
              </div>

              {/* Account Info (Read-only) */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900">Account Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Username:</span> {(user as any)?.username}
                  </div>
                  <div>
                    <span className="font-medium">Member since:</span> {
                      (user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : "Unknown"
                    }
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className="ml-2 inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats & Achievements */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="shadow-lg border-2 border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Your Ocean Explorer Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {progress?.totalXp || 0}
                    </div>
                    <div className="text-sm text-blue-700">Total XP</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {progress?.level || 1}
                    </div>
                    <div className="text-sm text-green-700">Current Level</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {progress?.learnedSpecies?.length || 0}
                    </div>
                    <div className="text-sm text-purple-700">Species Learned</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {progress?.currentStreak || 0}
                    </div>
                    <div className="text-sm text-orange-700">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="shadow-lg border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="h-5 w-5 text-purple-600" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progress?.badges && progress.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {progress.badges.map((badgeId) => (
                      <Badge key={badgeId} variant="secondary" className="bg-purple-100 text-purple-800">
                        {badgeId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No badges earned yet. Start learning to unlock achievements!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}