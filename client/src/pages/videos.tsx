import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Play, CheckCircle, Clock, Star, Award } from "lucide-react";

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

const videoLibrary: VideoContent[] = [
  {
    id: "crab-basics-intro",
    title: "Introduction to Crabs: Amazing Ocean Creatures",
    description: "Discover the fascinating world of crabs! Learn about their anatomy, behavior, and why they're such important ocean animals.",
    videoUrl: "https://www.youtube.com/embed/zpjklLt1qWk",
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
    videoUrl: "https://www.youtube.com/embed/85lFKu_IwCA",
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
    videoUrl: "https://www.youtube.com/embed/6oaEF7Kq_64",
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
    videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
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

  useEffect(() => {
    if (progress?.watchedVideos) {
      setWatchedVideos(new Set(progress.watchedVideos));
    }
  }, [progress]);

  const markVideoComplete = useMutation({
    mutationFn: async (videoId: string) => {
      return await apiRequest("/api/video-complete", "POST", { videoId });
    },
    onSuccess: (_data, videoId) => {
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
      toast({ title: "Error", description: "Failed to mark video as complete.", variant: "destructive" });
    },
  });

  const diffBadge = (d: string) => {
    if (d === 'beginner') return 'bg-[#7ec8c8]/20 text-[#7ec8c8]';
    if (d === 'intermediate') return 'bg-[#f5e6c8]/20 text-[#f5e6c8]';
    return 'bg-[#ff6b4a]/20 text-[#ff6b4a]';
  };

  // ── Unauthenticated ──
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="section-title text-3xl sm:text-4xl mb-3">📹 Educational Videos</h2>
        <p className="section-subtitle text-lg mb-10">Watch amazing crab videos and earn XP!</p>
        <div className="glass-card-lg p-12">
          <div className="text-7xl mb-4">🔒</div>
          <h3 className="font-fredoka text-white text-2xl mb-3">Sign In to Watch Videos</h3>
          <p className="text-white/60 mb-6">Create an account to access our video library and start earning XP!</p>
          <Link href="/login">
            <button className="cta-coral font-fredoka px-8 py-3 rounded-full text-base">🚀 Start Learning</button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Video player view ──
  if (selectedVideo) {
    const isWatched = watchedVideos.has(selectedVideo.id);
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Player */}
        <div className="relative mb-8">
          <iframe
            src={selectedVideo.videoUrl}
            title={selectedVideo.title}
            className="w-full aspect-video rounded-2xl shadow-2xl"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {isWatched && (
            <div className="absolute top-4 right-4 bg-[#7ec8c8] text-[#062a3e] px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
              <CheckCircle className="h-4 w-4" /> Completed
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h1>
                <p className="text-white/60">{selectedVideo.description}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="text-xl font-bold text-[#ff6b4a]">{selectedVideo.xpReward} XP</div>
                <div className="text-white/40 text-xs">Reward</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diffBadge(selectedVideo.difficulty)}`}>
                {selectedVideo.difficulty}
              </span>
              {selectedVideo.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">#{tag}</span>
              ))}
            </div>

            {!isWatched ? (
              <button
                onClick={() => markVideoComplete.mutate(selectedVideo.id)}
                disabled={markVideoComplete.isPending}
                className="cta-coral w-full font-fredoka py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <CheckCircle className="h-5 w-5" />
                {markVideoComplete.isPending ? "Marking..." : `Mark Complete & Earn ${selectedVideo.xpReward} XP`}
              </button>
            ) : (
              <div className="text-center py-4 rounded-xl" style={{ background: "rgba(126,200,200,0.1)", border: "1px solid rgba(126,200,200,0.2)" }}>
                <CheckCircle className="h-7 w-7 text-[#7ec8c8] mx-auto mb-1" />
                <p className="text-[#7ec8c8] font-semibold text-sm">Completed — you earned {selectedVideo.xpReward} XP</p>
              </div>
            )}
          </div>

          {/* Sidebar stats */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-white/70 mb-2"><Clock className="h-4 w-4" /> Duration</div>
              <div className="text-2xl font-bold text-white">{selectedVideo.duration}</div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-white/70 mb-2"><Star className="h-4 w-4" /> Progress</div>
              <div className="text-2xl font-bold text-white mb-1">{watchedVideos.size} / {videoLibrary.length}</div>
              <div className="progress-track h-2">
                <div className="progress-fill h-2" style={{ width: `${(watchedVideos.size / videoLibrary.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => setSelectedVideo(null)} className="cta-glass font-semibold px-8 py-3 rounded-full">
            ← Back to Video Library
          </button>
        </div>
      </div>
    );
  }

  // ── Library view ──
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="section-title text-3xl sm:text-4xl mb-3">📹 Video Library</h2>
        <p className="section-subtitle text-lg">Watch amazing crab videos and earn XP!</p>
      </div>

      {/* Overview stats */}
      <div className="glass-card-lg p-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-white">{videoLibrary.length}</div><div className="text-white/50 text-xs">Total Videos</div></div>
          <div><div className="text-2xl font-bold text-white">{watchedVideos.size}</div><div className="text-white/50 text-xs">Watched</div></div>
          <div>
            <div className="text-2xl font-bold text-white">
              {videoLibrary.reduce((t, v) => watchedVideos.has(v.id) ? t + v.xpReward : t, 0)}
            </div>
            <div className="text-white/50 text-xs">XP Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{Math.round((watchedVideos.size / videoLibrary.length) * 100)}%</div>
            <div className="text-white/50 text-xs">Complete</div>
          </div>
        </div>
      </div>

      {/* Video cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {videoLibrary.map((video) => {
          const isWatched = watchedVideos.has(video.id);
          return (
            <div
              key={video.id}
              className={`glass-card p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${isWatched ? 'ring-1 ring-[#7ec8c8]/30' : ''}`}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative mb-3">
                <div className="text-5xl text-center">{video.thumbnail}</div>
                {isWatched && (
                  <div className="absolute top-1 right-1 bg-[#7ec8c8] text-[#062a3e] p-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-0.5 rounded">{video.duration}</div>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
              <p className="text-white/40 text-xs mb-3 line-clamp-2">{video.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffBadge(video.difficulty)}`}>{video.difficulty}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#ff6b4a] text-xs font-semibold">
                  <Award className="h-3.5 w-3.5" /> {video.xpReward} XP
                </div>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <Play className="h-3.5 w-3.5" /> Watch
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link href="/">
          <button className="cta-glass font-semibold px-8 py-3 rounded-full">🏠 Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
