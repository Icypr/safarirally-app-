import { LevelConfig } from './gameData';

export interface RaceConfig extends LevelConfig {
  title: string;
  weather: 'Clear' | 'Dusty' | 'Mist' | 'Light Rain' | 'Heavy Storm';
  aiAggression: number;
  trackNarrowness: number;
  mudDepth: number;
}

export interface CampaignTier {
  id: string;
  name: string;
  difficulty: 'Novice' | 'Amateur' | 'Pro' | 'Elite' | 'Legendary';
  region: string;
  description: string;
  races: RaceConfig[];
}

const generateRaces = (tierIdx: number, tierName: string, difficulty: CampaignTier['difficulty']): RaceConfig[] => {
  const weatherOptions: RaceConfig['weather'][] = ['Clear', 'Dusty', 'Mist', 'Light Rain', 'Heavy Storm'];
  const races: RaceConfig[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const raceIdx = (tierIdx * 10) + i;
    const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    
    races.push({
      id: `race-${raceIdx}`,
      name: `${tierName} - Stage ${i}`,
      title: `${tierName} Rally: Stage ${i}`,
      difficulty: difficulty === 'Novice' ? 'Easy' : difficulty === 'Amateur' || difficulty === 'Pro' ? 'Medium' : 'Hard',
      reward: 100 * raceIdx,
      biomeId: 'rift-valley',
      targetTime: Math.max(30, 120 - raceIdx * 0.5),
      rivalCount: Math.min(10, 2 + Math.floor(raceIdx / 15)),
      rivalSpeed: 15 + (raceIdx * 0.5),
      hazardCount: 5 + Math.floor(raceIdx / 5),
      weather,
      aiAggression: 0.1 + (raceIdx / 150) * 0.8,
      trackNarrowness: 0.2 + (raceIdx / 150) * 0.7,
      mudDepth: 0.1 + (raceIdx / 150) * 0.9,
    });
  }
  return races;
};

export const campaignTiers: CampaignTier[] = [
  {
    id: 'tier-1',
    name: 'Suswa Plains',
    difficulty: 'Novice',
    region: 'Kedong Valley Floor',
    description: 'High dust, wide open tracks. Perfect for beginners.',
    races: generateRaces(0, 'Suswa Plains', 'Novice'),
  },
  {
    id: 'tier-2',
    name: 'Kedong Dustbowl',
    difficulty: 'Novice',
    region: 'Kedong Valley Floor',
    description: 'Blinding dust clouds and long straights.',
    races: generateRaces(1, 'Kedong Dustbowl', 'Novice'),
  },
  {
    id: 'tier-3',
    name: 'Hell\'s Gate Entry',
    difficulty: 'Novice',
    region: 'Kedong Valley Floor',
    description: 'Volcanic soil and wide trails.',
    races: generateRaces(2, 'Hell\'s Gate Entry', 'Novice'),
  },
  {
    id: 'tier-4',
    name: 'Naivasha Shores',
    difficulty: 'Amateur',
    region: 'Lake Naivasha Perimeters',
    description: 'Soft sand and wildlife crossings.',
    races: generateRaces(3, 'Naivasha Shores', 'Amateur'),
  },
  {
    id: 'tier-5',
    name: 'Acacia Run',
    difficulty: 'Amateur',
    region: 'Lake Naivasha Perimeters',
    description: 'Tight turns through acacia groves.',
    races: generateRaces(4, 'Acacia Run', 'Amateur'),
  },
  {
    id: 'tier-6',
    name: 'Flamingo Trail',
    difficulty: 'Amateur',
    region: 'Lake Naivasha Perimeters',
    description: 'Slippery lakeside mud and high speed.',
    races: generateRaces(5, 'Flamingo Trail', 'Amateur'),
  },
  {
    id: 'tier-7',
    name: 'Mai Mahiu Climb',
    difficulty: 'Pro',
    region: 'Mai Mahiu Escarpment',
    description: 'Sharp elevation changes and tight corners.',
    races: generateRaces(6, 'Mai Mahiu Climb', 'Pro'),
  },
  {
    id: 'tier-8',
    name: 'Escarpment Edge',
    difficulty: 'Pro',
    region: 'Mai Mahiu Escarpment',
    description: 'Dangerous drops and technical hairpins.',
    races: generateRaces(7, 'Escarpment Edge', 'Pro'),
  },
  {
    id: 'tier-9',
    name: 'Rift Overlook',
    difficulty: 'Pro',
    region: 'Mai Mahiu Escarpment',
    description: 'High speed ridge runs with extreme wind.',
    races: generateRaces(8, 'Rift Overlook', 'Pro'),
  },
  {
    id: 'tier-10',
    name: 'Iten High Altitude',
    difficulty: 'Elite',
    region: 'Iten / Cherangani Hills',
    description: 'High altitude engine power drop and mist.',
    races: generateRaces(9, 'Iten High Altitude', 'Elite'),
  },
  {
    id: 'tier-11',
    name: 'Cherangani Mist',
    difficulty: 'Elite',
    region: 'Iten / Cherangani Hills',
    description: 'Zero visibility and steep forest climbs.',
    races: generateRaces(10, 'Cherangani Mist', 'Elite'),
  },
  {
    id: 'tier-12',
    name: 'Marakwet Hairpins',
    difficulty: 'Elite',
    region: 'Iten / Cherangani Hills',
    description: 'Endless switchbacks at 3000m altitude.',
    races: generateRaces(11, 'Marakwet Hairpins', 'Elite'),
  },
  {
    id: 'tier-13',
    name: 'Kerio Valley Drop',
    difficulty: 'Legendary',
    region: '"The Mud Monster" (Total Rift)',
    description: 'Maximum "Black Cotton" soil and heavy storms.',
    races: generateRaces(12, 'Kerio Valley Drop', 'Legendary'),
  },
  {
    id: 'tier-14',
    name: 'Black Cotton Bog',
    difficulty: 'Legendary',
    region: '"The Mud Monster" (Total Rift)',
    description: 'Deepest mud in the world. Survival is the goal.',
    races: generateRaces(13, 'Black Cotton Bog', 'Legendary'),
  },
  {
    id: 'tier-15',
    name: 'Total Rift Chaos',
    difficulty: 'Legendary',
    region: '"The Mud Monster" (Total Rift)',
    description: 'The ultimate test. Extreme hairpins and flash floods.',
    races: generateRaces(14, 'Total Rift Chaos', 'Legendary'),
  },
];
