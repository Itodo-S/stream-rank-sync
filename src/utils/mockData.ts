export interface Player {
  id: string;
  rank: number;
  username: string;
  walletAddress: string;
  score: number;
  wins: number;
  losses: number;
  winRate: number;
  level: number;
  avatar: string;
  achievements: Achievement[];
  rankChange?: 'up' | 'down' | 'same';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'live' | 'completed';
  participants: number;
  maxParticipants: number;
  prizePool: string;
  startDate: string;
  endDate: string;
  game: string;
}

export const mockPlayers: Player[] = [
  {
    id: "1",
    rank: 1,
    username: "CryptoKnight",
    walletAddress: "0x7a3f8b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    score: 9850,
    wins: 487,
    losses: 13,
    winRate: 97.4,
    level: 45,
    avatar: "🏆",
    achievements: [],
    rankChange: 'same'
  },
  {
    id: "2",
    rank: 2,
    username: "NeonGamer",
    walletAddress: "0x8b4f9c3d0e2f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    score: 9720,
    wins: 453,
    losses: 47,
    winRate: 90.6,
    level: 43,
    avatar: "⚡",
    achievements: [],
    rankChange: 'up'
  },
  {
    id: "3",
    rank: 3,
    username: "PixelWarrior",
    walletAddress: "0x9c5f0d4e1f3a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    score: 9650,
    wins: 441,
    losses: 59,
    winRate: 88.2,
    level: 42,
    avatar: "🎮",
    achievements: [],
    rankChange: 'down'
  },
  {
    id: "4",
    rank: 4,
    username: "BlockchainBoss",
    walletAddress: "0x0d6f1e5f2a4b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    score: 9580,
    wins: 429,
    losses: 71,
    winRate: 85.8,
    level: 41,
    avatar: "👑",
    achievements: [],
    rankChange: 'same'
  },
  {
    id: "5",
    rank: 5,
    username: "DataStreamPro",
    walletAddress: "0x1e7f2f6a3b5c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
    score: 9510,
    wins: 418,
    losses: 82,
    winRate: 83.6,
    level: 40,
    avatar: "🌊",
    achievements: [],
    rankChange: 'up'
  },
];

export const mockAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Victory",
    description: "Win your first match",
    icon: "🥇",
    rarity: "common",
    unlockedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "Winning Streak",
    description: "Win 10 matches in a row",
    icon: "🔥",
    rarity: "rare",
    unlockedAt: "2024-01-20T14:45:00Z"
  },
  {
    id: "3",
    name: "Tournament Champion",
    description: "Win a tournament",
    icon: "🏆",
    rarity: "epic",
    unlockedAt: "2024-02-01T18:00:00Z"
  },
  {
    id: "4",
    name: "Perfect Game",
    description: "Win without taking damage",
    icon: "💎",
    rarity: "legendary"
  },
];

export const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "Spring Championship 2024",
    status: "live",
    participants: 234,
    maxParticipants: 256,
    prizePool: "50,000 USDC",
    startDate: "2024-03-15T00:00:00Z",
    endDate: "2024-03-20T23:59:59Z",
    game: "Cyber Arena"
  },
  {
    id: "2",
    name: "Weekend Warrior Cup",
    status: "upcoming",
    participants: 128,
    maxParticipants: 128,
    prizePool: "10,000 USDC",
    startDate: "2024-03-25T12:00:00Z",
    endDate: "2024-03-26T20:00:00Z",
    game: "Battle Royale X"
  },
  {
    id: "3",
    name: "Winter Finals 2024",
    status: "completed",
    participants: 512,
    maxParticipants: 512,
    prizePool: "100,000 USDC",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2024-02-10T23:59:59Z",
    game: "Cyber Arena"
  },
];
