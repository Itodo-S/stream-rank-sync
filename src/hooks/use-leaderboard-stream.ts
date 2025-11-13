import { useCallback } from 'react'
import { useDataStreams } from '@/context/data-streams-context'
import type { PlayerData } from '@/types/game-events'

export const useLeaderboardStream = (streamEventId?: string) => {
	const { subscribeToLeaderboard, players, isSubscribed } = useDataStreams()
	
	// Auto-subscription happens in DataStreamsProvider, no need to check wallet here

	const getPlayersArray = useCallback((): PlayerData[] => {
		return Array.from(players.values())
			.sort((a, b) => {
				// Sort by rank first, then by score
				if (a.rank !== b.rank) {
					return a.rank - b.rank
				}
				return b.score - a.score
			})
	}, [players])

	return {
		players: getPlayersArray(),
		playersMap: players,
		isSubscribed,
		subscribe: () => subscribeToLeaderboard(streamEventId),
	}
}

