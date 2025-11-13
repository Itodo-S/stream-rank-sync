import { useMemo } from 'react'
import { useDataStreams } from '@/context/data-streams-context'
import type { TournamentData } from '@/types/game-events'

export const useTournamentsStream = () => {
	const { tournaments, isSubscribed } = useDataStreams()

	const tournamentsArray = useMemo((): TournamentData[] => {
		return Array.from(tournaments.values())
	}, [tournaments])

	const liveTournaments = useMemo(() => {
		return tournamentsArray.filter(t => t.status === 'live')
	}, [tournamentsArray])

	const upcomingTournaments = useMemo(() => {
		return tournamentsArray.filter(t => t.status === 'upcoming')
	}, [tournamentsArray])

	const completedTournaments = useMemo(() => {
		return tournamentsArray.filter(t => t.status === 'completed')
	}, [tournamentsArray])

	return {
		tournaments: tournamentsArray,
		liveTournaments,
		upcomingTournaments,
		completedTournaments,
		tournamentsMap: tournaments,
		isSubscribed,
	}
}

