export interface ScoreUpdateEvent {
	type: 'scoreUpdate'
	playerAddress: string
	score: number
	previousScore: number
	timestamp: string
	gameId?: string
	tournamentId?: string
}

export interface RankChangeEvent {
	type: 'rankChange'
	playerAddress: string
	newRank: number
	previousRank: number
	timestamp: string
	direction: 'up' | 'down' | 'same'
}

export interface AchievementUnlockedEvent {
	type: 'achievementUnlocked'
	playerAddress: string
	achievementId: string
	achievementName: string
	achievementDescription: string
	rarity: 'common' | 'rare' | 'epic' | 'legendary'
	timestamp: string
}

export interface MatchResultEvent {
	type: 'matchResult'
	matchId: string
	player1Address: string
	player2Address: string
	winnerAddress: string
	player1Score: number
	player2Score: number
	tournamentId?: string
	timestamp: string
}

export type GameEvent = ScoreUpdateEvent | RankChangeEvent | AchievementUnlockedEvent | MatchResultEvent

export interface PlayerData {
	id: string
	walletAddress: string
	username: string
	avatar: string
	rank: number
	score: number
	wins: number
	losses: number
	winRate: number
	level: number
	achievements: Achievement[]
	rankChange?: 'up' | 'down' | 'same'
	lastUpdated?: string
}

export interface Achievement {
	id: string
	name: string
	description: string
	icon: string
	unlockedAt?: string
	rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface TournamentData {
	id: string
	name: string
	status: 'upcoming' | 'live' | 'completed'
	participants: number
	maxParticipants: number
	prizePool: string
	startDate: string
	endDate: string
	game: string
	bracket?: TournamentBracket
}

export interface TournamentBracket {
	rounds: TournamentRound[]
}

export interface TournamentRound {
	roundNumber: number
	matches: TournamentMatch[]
}

export interface TournamentMatch {
	matchId: string
	player1Address: string
	player2Address: string
	winnerAddress?: string
	status: 'pending' | 'in-progress' | 'completed'
	player1Score?: number
	player2Score?: number
}

