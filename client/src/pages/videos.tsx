import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Clock, Star, Video, Award } from "lucide-react";

interface VideoContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  xpReward: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

// TODO: Replace VIDEO_ID_HERE with actual YouTube video IDs
// To add a real video:
// 1. Find the YouTube video you want to embed
// 2. Copy the video ID from the URL (e.g., for https://www.youtube.com/watch?v=dQw4w9WgXcQ, the ID is "dQw4w9WgXcQ")
// 3. Replace VIDEO_ID_HERE with the actual ID
// 4. Update the title, description, and other metadata to match the actual video content
const videoLibrary: VideoContent[] = [
  {
    id: "crab-basics-intro",
    title: "Introduction to Crabs: Amazing Ocean Creatures",
    description: "Discover the fascinating world of crabs! Learn about their anatomy, behavior, and why they're such important ocean animals.",
    videoUrl: "https://www.youtube.com/embed/zpjklLt1qWk", // Real YouTube video ID
    thumbnail: "🦀",
    duration: "5:23",
    xpReward: 50,
    category: "Crab Basics",
    difficulty: "beginner",
    tags: ["anatomy", "behavior", "ocean life"]
  },
  {
    id: "crab-habitats",
    title: "Where Do Crabs Live? Exploring Their Homes",
    description: "From sandy beaches to deep ocean floors, explore the diverse habitats where crabs make their homes.",
    videoUrl: "https://www.youtube.com/embed/85lFKu_IwCA", // Real YouTube video ID
    thumbnail: "🏖️",
    duration: "4:15",
    xpReward: 40,
    category: "Habitats",
    difficulty: "beginner",
    tags: ["habitats", "ecosystems", "beaches"]
  },
  {
    id: "crab-anatomy-deep-dive",
    title: "Crab Anatomy: A Closer Look",
    description: "Take a detailed look at crab anatomy and understand how their bodies are perfectly adapted for ocean life.",
    videoUrl: "https://www.youtube.com/embed/6oaEF7Kq_64", // Real YouTube video ID
    thumbnail: "🔬",
    duration: "6:42",
    xpReward: 60,
    category: "Anatomy",
    difficulty: "intermediate",
    tags: ["anatomy", "adaptations", "science"]
  },
  {
    id: "crab-behavior",
    title: "Crab Behavior: How They Think and Act",
    description: "Learn about crab intelligence, social behavior, and how they communicate with each other.",
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw", // Real YouTube video ID
    thumbnail: "🧠",
    duration: "7:18",
    xpReward: 70,
    category: "Behavior",
    difficulty: "intermediate",
    tags: ["behavior", "intelligence", "communication"]
  }
];

export default function Videos() {
  const { isAuthenticated, user } = useAuth();
  const userId = (user as any)?.id;
  const { data: progress } = useGameProgress();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});

  // Load watched videos from progress
  useEffect(() => {
    if (progress?.watchedVideos) {
      setWatchedVideos(new Set(progress.watchedVideos));
    }
  }, [progress]);

  const markVideoComplete = useMutation({
    mutationFn: async (videoId: string) => {
      return await apiRequest("/api/video-complete", "POST", { videoId });
    },
    onSuccess: (data, videoId) => {
      const video = videoLibrary.find(v => v.id === videoId);
      if (video) {
        setWatchedVideos(prev => new Set(Array.from(prev).concat(videoId)));
        toast({
          title: "Video Completed! 🎉",
          description: `You earned ${video.xpReward} XP for watching "${video.title}"!`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/progress", userId] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark video as complete. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVideoComplete = (videoId: string) => {
    if (!watchedVideos.has(videoId)) {
      markVideoComplete.mutate(videoId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Crab Basics': 'bg-ocean-100 text-ocean-800',
      'Habitats': 'bg-sunny-100 text-sunny-800',
      'Anatomy': 'bg-coral-100 text-coral-800',
      'Behavior': 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-fredoka text-gray-600 mb-4">📹 Educational Videos 📹</h2>
          <p className="text-xl text-gray-500">Watch amazing crab videos and earn XP!</p>
        </div>

        <div className="bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-3xl p-12 text-center shadow-xl">
          <div className="text-8xl mb-6 animate-bounce-gentle">🔒</div>
          <h3 className="text-3xl font-bold text-gray-700 mb-4">Sign In to Watch Videos</h3>
          <p className="text-xl text-gray-600 mb-8">Create an account to access our video library and start earning XP!</p>
          
          <Link href="/login">
            <Button className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors shadow-lg">
              🚀 Start Learning
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Video Player */}
        <div className="mb-8">
          <div className="relative">
            <iframe
              src={selectedVideo.videoUrl}
              title={selectedVideo.title}
              className="w-full aspect-video rounded-2xl shadow-2xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {watchedVideos.has(selectedVideo.id) && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-ocean-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedVideo.title}</h1>
                  <p className="text-gray-600 text-lg">{selectedVideo.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ocean-600">{selectedVideo.xpReward} XP</div>
                  <div className="text-sm text-gray-500">Reward</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className={getDifficultyColor(selectedVideo.difficulty)}>
                  {selectedVideo.difficulty.charAt(0).toUpperCase() + selectedVideo.difficulty.slice(1)}
                </Badge>
                <Badge className={getCategoryColor(selectedVideo.category)}>
                  {selectedVideo.category}
                </Badge>
                {selectedVideo.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-gray-50">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {!watchedVideos.has(selectedVideo.id) ? (
                <Button 
                  onClick={() => handleVideoComplete(selectedVideo.id)}
                  disabled={markVideoComplete.isPending}
                  className="w-full bg-ocean-500 hover:bg-ocean-600 text-white py-3 text-lg font-bold"
                >
                  {markVideoComplete.isPending ? (
                    "Marking Complete..."
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Complete & Earn {selectedVideo.xpReward} XP
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center py-4 bg-green-50 rounded-2xl border-2 border-green-200">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">Video Completed!</p>
                  <p className="text-green-600">You earned {selectedVideo.xpReward} XP</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Stats */}
          <div className="space-y-4">
            <Card className="border-2 border-ocean-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-ocean-600" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ocean-600">{selectedVideo.duration}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-sunny-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-sunny-600" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sunny-600">
                    {watchedVideos.size} / {videoLibrary.length}
                  </div>
                  <div className="text-sm text-gray-500">Videos Watched</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-sunny-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(watchedVideos.size / videoLibrary.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => setSelectedVideo(null)}
            variant="outline"
            className="bg-white border-2 border-ocean-200 text-ocean-600 hover:bg-ocean-50 px-8 py-3 rounded-full text-lg font-semibold"
          >
            ← Back to Video Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-fredoka text-ocean-600 mb-4">📹 Educational Video Library 📹</h2>
        <p className="text-xl text-gray-600">Watch amazing crab videos and earn XP for your ocean knowledge!</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-ocean-400 to-ocean-600 rounded-3xl p-6 text-white shadow-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{videoLibrary.length}</div>
            <div className="text-ocean-100">Total Videos</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{watchedVideos.size}</div>
            <div className="text-ocean-100">Videos Watched</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {videoLibrary.reduce((total, video) => 
                watchedVideos.has(video.id) ? total + video.xpReward : total, 0
              )}
            </div>
            <div className="text-ocean-100">XP Earned</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {Math.round((watchedVideos.size / videoLibrary.length) * 100)}%
            </div>
            <div className="text-ocean-100">Completion</div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {videoLibrary.map((video) => {
          const isWatched = watchedVideos.has(video.id);
          return (
            <Card 
              key={video.id} 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                isWatched ? 'border-green-200 bg-green-50' : 'border-ocean-100 hover:border-ocean-300'
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              <CardHeader className="pb-3">
                <div className="relative">
                  <div className="text-6xl mb-3 text-center">{video.thumbnail}</div>
                  {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                <CardTitle className="text-lg text-center">{video.title}</CardTitle>
                <CardDescription className="text-center text-sm">
                  {video.description.substring(0, 80)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getDifficultyColor(video.difficulty)}>
                    {video.difficulty}
                  </Badge>
                  <Badge className={getCategoryColor(video.category)}>
                    {video.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-ocean-600 font-semibold">
                    <Award className="h-4 w-4" />
                    {video.xpReward} XP
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-ocean-200 text-ocean-600 hover:bg-ocean-50"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Watch
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Back to Home */}
      <div className="text-center">
        <Link href="/">
          <Button className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors shadow-lg">
            🏠 Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}