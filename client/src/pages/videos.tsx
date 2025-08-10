import { Link } from "wouter";

export default function Videos() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-fredoka text-gray-600 mb-4">📹 Educational Videos 📹</h2>
        <p className="text-xl text-gray-500">Amazing crab videos coming soon!</p>
      </div>

      <div className="bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-3xl p-12 text-center shadow-xl">
        <div className="text-8xl mb-6 animate-bounce-gentle">🐠</div>
        <h3 className="text-3xl font-bold text-gray-700 mb-4">Videos Coming Soon!</h3>
        <p className="text-xl text-gray-600 mb-8">We're working on amazing educational videos about crabs and ocean life!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 rounded-2xl p-6">
            <div className="text-4xl mb-3">🎥</div>
            <h4 className="font-bold text-gray-700 mb-2">Crab Documentaries</h4>
            <p className="text-gray-600">Learn about crabs in their natural habitats</p>
          </div>
          <div className="bg-white/70 rounded-2xl p-6">
            <div className="text-4xl mb-3">🔬</div>
            <h4 className="font-bold text-gray-700 mb-2">Science Experiments</h4>
            <p className="text-gray-600">Fun experiments about marine biology</p>
          </div>
        </div>

        <Link href="/">
          <button className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors shadow-lg">
            🏠 Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}