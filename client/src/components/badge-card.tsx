interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    earned: boolean;
  };
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const colorMap = {
    'first-steps': 'border-sunny-200',
    'crab-expert': 'border-green-200',
    'streak-master': 'border-coral-200',
    'species-collector': 'border-ocean-200',
    'level-5': 'border-purple-200',
    'crab-master': 'border-gray-200',
  };

  const statusMap = {
    'first-steps': { bg: 'bg-sunny-100', text: 'text-sunny-700' },
    'crab-expert': { bg: 'bg-green-100', text: 'text-green-700' },
    'streak-master': { bg: 'bg-coral-100', text: 'text-coral-700' },
    'species-collector': { bg: 'bg-ocean-100', text: 'text-ocean-700' },
    'level-5': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'crab-master': { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  const borderColor = colorMap[badge.id as keyof typeof colorMap] || 'border-gray-200';
  const status = statusMap[badge.id as keyof typeof statusMap] || statusMap['crab-master'];

  return (
    <div className={`bg-white rounded-3xl shadow-xl p-6 text-center border-4 ${borderColor} transform hover:scale-105 transition-transform ${!badge.earned ? 'opacity-60 grayscale' : ''}`}>
      <div className={`text-6xl mb-4 ${!badge.earned ? 'grayscale' : ''}`}>{badge.emoji}</div>
      <h4 className={`text-xl font-bold mb-2 ${badge.earned ? 'text-gray-800' : 'text-gray-500'}`}>
        {badge.name}
      </h4>
      <p className={`mb-4 ${badge.earned ? 'text-gray-600' : 'text-gray-500'}`}>
        {badge.description}
      </p>
      <div className={`${badge.earned ? status.bg : 'bg-gray-200'} ${badge.earned ? status.text : 'text-gray-500'} px-3 py-1 rounded-full text-sm font-semibold`}>
        {badge.earned ? 'Earned!' : 'Locked'}
      </div>
    </div>
  );
}