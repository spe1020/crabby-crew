import { Link } from "wouter";
import CrabCard from "@/components/crab-card";
import crabsData from "@/data/crabs.json";

export default function Learn() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-fredoka text-ocean-600 mb-4">🦀 Meet the Crab Crew! 🦀</h2>
        <p className="text-xl text-gray-600">Discover amazing crab species from around the world</p>
      </div>

      {/* Crab Species Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {crabsData.map((crab) => (
          <CrabCard key={crab.id} crab={crab} />
        ))}
      </div>

      <div className="text-center">
        <Link href="/">
          <button className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors shadow-lg">
            🏠 Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}