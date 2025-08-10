import { Link, useLocation } from "wouter";
import { Home, BookOpen, Target, Award, Trophy, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/quests", label: "Quests", icon: Target },
  { href: "/rewards", label: "Rewards", icon: Award },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-ocean-200 shadow-lg z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center p-2 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? "text-ocean-600 bg-ocean-50" 
                    : "text-gray-500 hover:text-ocean-500 hover:bg-ocean-25"
                }`}>
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}