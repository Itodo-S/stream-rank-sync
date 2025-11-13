import { useEffect } from 'react'
import { useDataStreams } from '@/context/data-streams-context'
import { useSomniaWalletContext } from '@/context/somnia-wallet-context'

export const useTournamentStream = (tournamentId: string, streamEventId?: string) => {
	const { subscribeToTournament, lastEvent } = useDataStreams()
	const { isConnected } = useSomniaWalletContext()

	useEffect(() => {
		if (isConnected && tournamentId) {
			subscribeToTournament(tournamentId, streamEventId)
		}
	}, [isConnected, tournamentId, streamEventId, subscribeToTournament])

	return {
		lastEvent,
		isSubscribed: isConnected && !!tournamentId,
	}
}

