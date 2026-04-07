import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-7xl mb-4">🦀</div>
      <h1 className="font-fredoka text-white text-3xl mb-2">404 — Lost at Sea!</h1>
      <p className="text-white/50 mb-6">This page doesn't exist. Let's get you back on course.</p>
      <Link href="/">
        <button className="cta-coral font-fredoka px-8 py-3 rounded-full">Back to Home</button>
      </Link>
    </div>
  );
}
