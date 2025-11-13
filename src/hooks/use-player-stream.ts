import { useEffect } from 'react'
import { useDataStreams } from '@/context/data-streams-context'
import type { PlayerData } from '@/types/game-events'

export const usePlayerStream = (playerAddress: string, streamEventId?: string) => {
	const { subscribeToPlayer, players } = useDataStreams()

	// Subscribe to player data even without wallet connection (public data)
	useEffect(() => {
		if (playerAddress) {
			const addressKey = playerAddress.toLowerCase()
			subscribeToPlayer(addressKey, streamEventId)
		}
	}, [playerAddress, streamEventId, subscribeToPlayer])

	const addressKey = playerAddress.toLowerCase()
	const player = players.get(addressKey)

	return {
		player,
		isLoading: !player && !!playerAddress,
	}
}

