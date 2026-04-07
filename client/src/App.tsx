import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import BottomNavigation from "@/components/bottom-navigation";
import Home from "@/pages/home";
import Learn from "@/pages/learn";
import Quests from "@/pages/quests";
import Rewards from "@/pages/rewards";
import Videos from "@/pages/videos";
import Leaderboards from "@/pages/leaderboards";
import Profile from "@/pages/profile";
import Login from "@/pages/login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/learn" component={Learn} />
      <Route path="/quests" component={Quests} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/videos" component={Videos} />
      <Route path="/leaderboards" component={Leaderboards} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Hide app chrome on landing page and login page for unauthenticated users
  const isLandingOrLogin = location === "/" || location === "/login";
  const showAppChrome = isAuthenticated || !isLandingOrLogin;

  return (
    <TooltipProvider>
      <div className={showAppChrome ? "min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100 pb-20" : ""}>
        {showAppChrome && <Navigation />}
        <Router />
        {showAppChrome && <BottomNavigation />}
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
