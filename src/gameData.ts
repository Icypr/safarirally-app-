export interface CarConfig {
  id: string;
  name: string;
  cost: number;
  color: string;
  mass: number;
  engineForce: number;
  durability: number; // 1-10
  suspensionTravel: number; // 1-10
  torque: number; // 1-10
  specialty: string;
  description: string;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  type: 'engine' | 'tires' | 'suspension';
  cost: number;
  bonus: number;
  description: string;
}

export const upgrades: UpgradeConfig[] = [
  { id: 'engine-1', name: 'Turbo Charger', type: 'engine', cost: 500, bonus: 500, description: 'Increases engine force for better acceleration.' },
  { id: 'engine-2', name: 'Super Charger', type: 'engine', cost: 1500, bonus: 1200, description: 'Maximum power for high-speed chases.' },
  { id: 'engine-3', name: 'Nitro Injection', type: 'engine', cost: 3000, bonus: 2500, description: 'Extreme power output for elite racers.' },
  { id: 'tires-1', name: 'All-Terrain Tires', type: 'tires', cost: 300, bonus: 0.1, description: 'Better grip on loose Rift Valley soil.' },
  { id: 'tires-2', name: 'Mud-Terrain Tires', type: 'tires', cost: 800, bonus: 0.25, description: 'Superior traction in swampy conditions.' },
  { id: 'suspension-1', name: 'Rally Shocks', type: 'suspension', cost: 400, bonus: 0.2, description: 'Absorbs heavy impacts from track hazards.' },
  { id: 'suspension-2', name: 'Heavy Duty Springs', type: 'suspension', cost: 1000, bonus: 0.45, description: 'Unbeatable stability on the roughest terrain.' },
];

export const colors = [
  { name: 'Safari Orange', value: '#D45D31' },
  { name: 'Rift Gold', value: '#FFB800' },
  { name: 'Savannah Black', value: '#2D241E' },
  { name: 'Dune Yellow', value: '#E6C200' },
  { name: 'Legend White', value: '#FFFFFF' },
  { name: 'Forest Green', value: '#2D5A27' },
  { name: 'Sky Blue', value: '#4A90E2' },
  { name: 'Clay Red', value: '#A52A2A' },
];

export const cars: CarConfig[] = [
  {
    id: 'vw-beetle',
    name: 'VW Beetle (Classic)',
    cost: 500,
    color: '#D45D31',
    mass: 1000,
    engineForce: 1500,
    durability: 4,
    suspensionTravel: 5,
    torque: 3,
    specialty: 'Light & rear-engine (great for sand).',
    description: 'A nimble classic that floats over sand dunes.'
  },
  {
    id: 'datsun-1600',
    name: 'Datsun 1600 SSS',
    cost: 1200,
    color: '#FFB800',
    mass: 1100,
    engineForce: 2200,
    durability: 6,
    suspensionTravel: 4,
    torque: 5,
    specialty: 'Historical legend; very reliable.',
    description: 'The workhorse of early Safari rallies.'
  },
  {
    id: 'peugeot-504',
    name: 'Peugeot 504',
    cost: 2500,
    color: '#FFFFFF',
    mass: 1300,
    engineForce: 2800,
    durability: 9,
    suspensionTravel: 10,
    torque: 6,
    specialty: "King of Africa; unbeatable suspension.",
    description: 'Rugged and reliable, built for the toughest terrain.'
  },
  {
    id: 'ford-escort',
    name: 'Ford Escort RS1800',
    cost: 5000,
    color: '#4A90E2',
    mass: 1050,
    engineForce: 3500,
    durability: 5,
    suspensionTravel: 6,
    torque: 7,
    specialty: 'High agility for technical hairpins.',
    description: 'A fast and agile machine for tight corners.'
  },
  {
    id: 'toyota-celica',
    name: 'Toyota Celica TCT',
    cost: 12000,
    color: '#A52A2A',
    mass: 1250,
    engineForce: 5000,
    durability: 7,
    suspensionTravel: 7,
    torque: 9,
    specialty: 'Group B beast; raw power.',
    description: 'A powerful legend from the golden era of Group B.'
  },
  {
    id: 'mitsubishi-evo',
    name: 'Mitsubishi Lancer Evo III',
    cost: 25000,
    color: '#FFFFFF',
    mass: 1350,
    engineForce: 4500,
    durability: 8,
    suspensionTravel: 8,
    torque: 8,
    specialty: '4WD stability for slippery mud.',
    description: 'Advanced 4WD system for maximum traction.'
  },
  {
    id: 'subaru-impreza',
    name: 'Subaru Impreza 555',
    cost: 40000,
    color: '#4A90E2',
    mass: 1300,
    engineForce: 4800,
    durability: 8,
    suspensionTravel: 9,
    torque: 8,
    specialty: 'Iconic Safari snorkel & heavy-duty bash plate.',
    description: 'The ultimate Safari icon with a snorkel intake.'
  },
  {
    id: 'skoda-fabia',
    name: 'Škoda Fabia RS Rally2',
    cost: 75000,
    color: '#2D5A27',
    mass: 1230,
    engineForce: 5500,
    durability: 7,
    suspensionTravel: 9,
    torque: 9,
    specialty: 'Modern precision & high-tech suspension.',
    description: 'Cutting-edge technology for precision racing.'
  },
  {
    id: 'toyota-hilux',
    name: 'Toyota Hilux T1+',
    cost: 150000,
    color: '#2D241E',
    mass: 2000,
    engineForce: 7000,
    durability: 10,
    suspensionTravel: 10,
    torque: 10,
    specialty: "The ultimate 'Raid' machine for deep bogs.",
    description: 'Unstoppable power and durability for any terrain.'
  },
  {
    id: 'toyota-yaris',
    name: 'Toyota GR Yaris Rally1',
    cost: 500000,
    color: '#FFFFFF',
    mass: 1260,
    engineForce: 8000,
    durability: 8,
    suspensionTravel: 9,
    torque: 10,
    specialty: 'Hybrid power; the fastest car in Kenya.',
    description: 'The pinnacle of modern rally engineering.'
  }
];

export interface LevelConfig {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: number;
  biomeId: string;
  targetTime: number;
  rivalCount: number;
  rivalSpeed: number;
  hazardCount: number;
}

export { campaignTiers } from './campaignData';
export type { CampaignTier, RaceConfig } from './campaignData';

export const levels: LevelConfig[] = [
  {
    id: 'level-1',
    name: 'Rift Valley Descent',
    difficulty: 'Easy',
    reward: 100,
    biomeId: 'rift-valley',
    targetTime: 60,
    rivalCount: 2,
    rivalSpeed: 15,
    hazardCount: 5
  },
  {
    id: 'level-2',
    name: 'Savannah Sprint',
    difficulty: 'Medium',
    reward: 250,
    biomeId: 'savannah-storm',
    targetTime: 45,
    rivalCount: 5,
    rivalSpeed: 25,
    hazardCount: 15
  },
  {
    id: 'level-3',
    name: 'Frontier Raid',
    difficulty: 'Hard',
    reward: 500,
    biomeId: 'northern-frontier',
    targetTime: 30,
    rivalCount: 8,
    rivalSpeed: 40,
    hazardCount: 30
  }
];
