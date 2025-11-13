import { createContext, useContext, useEffect, useCallback, useState, type ReactNode } from 'react'
import { useSomniaWalletContext } from '@/context/somnia-wallet-context'
import { type SomniaSubscription } from '@/hooks/use-somnia-wallet'
import { toast } from 'sonner'
import type { GameEvent, PlayerData, AchievementUnlockedEvent, RankChangeEvent, ScoreUpdateEvent, MatchResultEvent, TournamentData } from '@/types/game-events'
import { transformEvent } from '@/utils/event-transformer'

interface DataStreamsContextValue {
	players: Map<string, PlayerData>
	tournaments: Map<string, TournamentData>
	subscriptions: Map<string, SomniaSubscription>
	isSubscribed: boolean
	subscribeToLeaderboard: (streamEventId?: string) => Promise<void>
	subscribeToPlayer: (playerAddress: string, streamEventId?: string) => Promise<void>
	subscribeToTournament: (tournamentId: string, streamEventId?: string) => Promise<void>
	subscribeToAllTournaments: (streamEventId?: string) => Promise<void>
	unsubscribe: (subscriptionId: string) => void
	unsubscribeAll: () => void
	lastEvent: GameEvent | null
}

const DataStreamsContext = createContext<DataStreamsContextValue | null>(null)

export const DataStreamsProvider = ({ children }: { children: ReactNode }) => {
	const { subscribe, isConnected, address, sdk } = useSomniaWalletContext()
	const [players, setPlayers] = useState<Map<string, PlayerData>>(new Map())
	const [tournaments, setTournaments] = useState<Map<string, TournamentData>>(new Map())
	const [subscriptions, setSubscriptions] = useState<Map<string, SomniaSubscription>>(new Map())
	const [lastEvent, setLastEvent] = useState<GameEvent | null>(null)
	const [isInitialized, setIsInitialized] = useState(false)
	const [tournamentsInitialized, setTournamentsInitialized] = useState(false)

	const updatePlayer = useCallback((playerAddress: string, updates: Partial<PlayerData>) => {
		setPlayers((prev) => {
			const updated = new Map(prev)
			const addressKey = playerAddress.toLowerCase()
			const existing = updated.get(addressKey) || {
				id: addressKey,
				walletAddress: playerAddress,
				username: `Player ${playerAddress.slice(0, 6)}`,
				avatar: '🎮',
				rank: 0,
				score: 0,
				wins: 0,
				losses: 0,
				winRate: 0,
				level: 1,
				achievements: [],
			}
			const merged = { ...existing, ...updates }
			// Recalculate winRate if wins or losses changed but winRate wasn't explicitly set
			if (updates.wins !== undefined || updates.losses !== undefined) {
				if (updates.winRate === undefined) {
					const totalGames = merged.wins + merged.losses
					merged.winRate = totalGames > 0 ? Math.round((merged.wins / totalGames) * 100 * 10) / 10 : 0
				}
			}
			updated.set(addressKey, { ...merged, lastUpdated: new Date().toISOString() })
			return updated
		})
	}, [])

	const handleGameEvent = useCallback((event: GameEvent) => {
		setLastEvent(event)

		switch (event.type) {
			case 'scoreUpdate': {
				const scoreEvent = event as ScoreUpdateEvent
				updatePlayer(scoreEvent.playerAddress, {
					score: scoreEvent.score,
				})
				if (address && scoreEvent.playerAddress.toLowerCase() === address.toLowerCase()) {
					toast.success(`Score updated: ${scoreEvent.score.toLocaleString()}`)
				}
				break
			}

			case 'rankChange': {
				const rankEvent = event as RankChangeEvent
				updatePlayer(rankEvent.playerAddress, {
					rank: rankEvent.newRank,
					rankChange: rankEvent.direction,
				})
				if (address && rankEvent.playerAddress.toLowerCase() === address.toLowerCase()) {
					const message =
						rankEvent.direction === 'up'
							? `Rank improved! You're now #${rankEvent.newRank}`
							: rankEvent.direction === 'down'
								? `Rank changed to #${rankEvent.newRank}`
								: `Rank: #${rankEvent.newRank}`
					toast.info(message)
				}
				break
			}

			case 'achievementUnlocked': {
				const achievementEvent = event as AchievementUnlockedEvent
				const player = players.get(achievementEvent.playerAddress)
				const newAchievement = {
					id: achievementEvent.achievementId,
					name: achievementEvent.achievementName,
					description: achievementEvent.achievementDescription,
					icon: '🏆',
					unlockedAt: achievementEvent.timestamp,
					rarity: achievementEvent.rarity,
				}
				updatePlayer(achievementEvent.playerAddress, {
					achievements: [...(player?.achievements || []), newAchievement],
				})
				if (address && achievementEvent.playerAddress.toLowerCase() === address.toLowerCase()) {
					toast.success(`Achievement unlocked: ${achievementEvent.achievementName}!`, {
						description: achievementEvent.achievementDescription,
					})
				}
				break
			}

			case 'matchResult': {
				const matchEvent = event as MatchResultEvent
				const isWinner1 = matchEvent.winnerAddress.toLowerCase() === matchEvent.player1Address.toLowerCase()
				const isWinner2 = matchEvent.winnerAddress.toLowerCase() === matchEvent.player2Address.toLowerCase()

				const player1 = players.get(matchEvent.player1Address.toLowerCase())
				const player2 = players.get(matchEvent.player2Address.toLowerCase())

				const player1Wins = (player1?.wins || 0) + (isWinner1 ? 1 : 0)
				const player1Losses = (player1?.losses || 0) + (!isWinner1 ? 1 : 0)
				const player1WinRate = player1Wins + player1Losses > 0 ? (player1Wins / (player1Wins + player1Losses)) * 100 : 0

				const player2Wins = (player2?.wins || 0) + (isWinner2 ? 1 : 0)
				const player2Losses = (player2?.losses || 0) + (!isWinner2 ? 1 : 0)
				const player2WinRate = player2Wins + player2Losses > 0 ? (player2Wins / (player2Wins + player2Losses)) * 100 : 0

				updatePlayer(matchEvent.player1Address, {
					wins: player1Wins,
					losses: player1Losses,
					winRate: Math.round(player1WinRate * 10) / 10,
				})

				updatePlayer(matchEvent.player2Address, {
					wins: player2Wins,
					losses: player2Losses,
					winRate: Math.round(player2WinRate * 10) / 10,
				})

				// Update tournament bracket if tournamentId is present
				if (matchEvent.tournamentId) {
					setTournaments((prev) => {
						const updated = new Map(prev)
						const tournament = updated.get(matchEvent.tournamentId!)
						if (tournament && tournament.bracket) {
							// Find and update the match in the bracket
							const updatedBracket = { ...tournament.bracket }
							updatedBracket.rounds = updatedBracket.rounds.map((round) => ({
								...round,
								matches: round.matches.map((match) => {
									if (match.matchId === matchEvent.matchId) {
										return {
											...match,
											winnerAddress: matchEvent.winnerAddress,
											status: 'completed' as const,
											player1Score: matchEvent.player1Score,
											player2Score: matchEvent.player2Score,
										}
									}
									return match
								}),
							}))
							updated.set(matchEvent.tournamentId!, {
								...tournament,
								bracket: updatedBracket,
							})
						}
						return updated
					})
				}

				if (address && (matchEvent.player1Address.toLowerCase() === address.toLowerCase() || matchEvent.player2Address.toLowerCase() === address.toLowerCase())) {
					const isWinner = matchEvent.winnerAddress.toLowerCase() === address.toLowerCase()
					toast[isWinner ? 'success' : 'error'](
						isWinner ? 'Match won!' : 'Match lost',
						{
							description: `${matchEvent.player1Score} - ${matchEvent.player2Score}`,
						}
					)
				}
				break
			}
		}
	}, [address, players, updatePlayer])

	const subscribeToLeaderboard = useCallback(
		async (streamEventId?: string) => {
			if (!sdk) {
				console.warn('Somnia SDK not ready yet, will retry...')
				return
			}

			if (!isConnected) {
				console.warn('Wallet connection required to subscribe to leaderboard')
				return
			}

			const subscriptionKey = `leaderboard-${streamEventId || 'default'}`
			if (subscriptions.has(subscriptionKey)) {
				console.log('Already subscribed to leaderboard')
				return
			}

			try {
				console.log('Subscribing to leaderboard stream...', { streamEventId, context: 'leaderboard' })
				
				const subscription = await subscribe({
					somniaStreamsEventId: streamEventId,
					ethCalls: [],
					context: 'leaderboard',
					onlyPushChanges: false, // Get initial data too
					onData: (payload) => {
						try {
							console.log('Leaderboard stream data received:', payload)
							
							// Transform payload (handles both GameEvents and BlockchainEvents)
							const transformed = transformEvent(payload)
							
							if (!transformed) {
								console.warn('Could not transform payload:', payload)
								return
							}
							
							// Handle array of events or single event
							const events = Array.isArray(transformed) ? transformed : [transformed]
							events.forEach((event) => {
								if (event && typeof event === 'object' && 'type' in event) {
									handleGameEvent(event as GameEvent)
								}
							})
						} catch (error) {
							console.error('Error processing leaderboard event:', error, payload)
						}
					},
					onError: (error) => {
						console.error('Leaderboard stream error:', error)
						toast.error('Leaderboard stream error: ' + (error.message || 'Unknown error'))
					},
				})

				if (subscription) {
					console.log('Successfully subscribed to leaderboard:', subscription.subscriptionId)
					setSubscriptions((prev) => new Map(prev).set(subscriptionKey, subscription))
					toast.success('Subscribed to leaderboard updates')
				} else {
					console.error('Subscription returned undefined')
					toast.error('Failed to create subscription')
				}
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error('Failed to subscribe to leaderboard:', error)
				toast.error('Failed to subscribe to leaderboard stream: ' + errorMessage)
			}
		},
		[sdk, isConnected, subscribe, subscriptions, handleGameEvent]
	)

	const subscribeToPlayer = useCallback(
		async (playerAddress: string, streamEventId?: string) => {
			if (!sdk) {
				console.warn('Somnia SDK not ready yet')
				return
			}

			if (!isConnected) {
				console.warn('Wallet connection required to subscribe to player data')
				return
			}

			const subscriptionKey = `player-${playerAddress}`
			if (subscriptions.has(subscriptionKey)) {
				return
			}

			try {
				console.log('Subscribing to player stream...', { playerAddress, streamEventId })
				
				const subscription = await subscribe({
					somniaStreamsEventId: streamEventId,
					ethCalls: [],
					context: `player:${playerAddress}`,
					onlyPushChanges: false, // Get initial data too
					onData: (payload) => {
						try {
							console.log('Player stream data received:', payload)
							
							// Transform payload (handles both GameEvents and BlockchainEvents)
							const transformed = transformEvent(payload)
							
							if (!transformed) {
								console.warn('Could not transform payload:', payload)
								return
							}
							
							// Handle array of events or single event
							const events = Array.isArray(transformed) ? transformed : [transformed]
							events.forEach((event) => {
								if (event && typeof event === 'object' && 'type' in event) {
									const gameEvent = event as GameEvent
									if (gameEvent.type === 'scoreUpdate' || gameEvent.type === 'rankChange' || gameEvent.type === 'achievementUnlocked') {
										const playerEvent = gameEvent as ScoreUpdateEvent | RankChangeEvent | AchievementUnlockedEvent
										if (playerEvent.playerAddress.toLowerCase() === playerAddress.toLowerCase()) {
											handleGameEvent(gameEvent)
										}
									}
								}
							})
						} catch (error) {
							console.error('Error processing player event:', error, payload)
						}
					},
					onError: (error) => {
						console.error('Player stream error:', error)
						toast.error('Player stream error: ' + (error.message || 'Unknown error'))
					},
				})

				if (subscription) {
					console.log('Successfully subscribed to player:', subscription.subscriptionId)
					setSubscriptions((prev) => new Map(prev).set(subscriptionKey, subscription))
					toast.success(`Subscribed to player ${playerAddress.slice(0, 6)}... updates`)
				} else {
					console.error('Player subscription returned undefined')
					toast.error('Failed to create player subscription')
				}
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error('Failed to subscribe to player:', error)
				toast.error('Failed to subscribe to player stream: ' + errorMessage)
			}
		},
		[sdk, isConnected, subscribe, subscriptions, handleGameEvent]
	)

	const subscribeToTournament = useCallback(
		async (tournamentId: string, streamEventId?: string) => {
			if (!sdk) {
				console.warn('Somnia SDK not ready yet')
				return
			}

			if (!isConnected) {
				console.warn('Wallet connection required to subscribe to tournament data')
				return
			}

			const subscriptionKey = `tournament-${tournamentId}`
			if (subscriptions.has(subscriptionKey)) {
				return
			}

			try {
				console.log('Subscribing to tournament stream...', { tournamentId, streamEventId })
				
				const subscription = await subscribe({
					somniaStreamsEventId: streamEventId,
					ethCalls: [],
					context: `tournament:${tournamentId}`,
					onlyPushChanges: false, // Get initial data too
					onData: (payload) => {
						try {
							console.log('Tournament stream data received:', payload)
							
							// Transform payload (handles both GameEvents and BlockchainEvents)
							const transformed = transformEvent(payload)
							
							// Handle tournament data updates (non-game events)
							if (!transformed && payload && typeof payload === 'object') {
								if ('id' in payload && 'status' in payload && (payload as Record<string, unknown>).id === tournamentId) {
									const tournamentData = payload as TournamentData
									setTournaments((prev) => {
										const updated = new Map(prev)
										updated.set(tournamentId, tournamentData)
										return updated
									})
									return
								}
							}
							
							if (!transformed) {
								console.warn('Could not transform payload:', payload)
								return
							}
							
							// Handle array of events or single event
							const events = Array.isArray(transformed) ? transformed : [transformed]
							events.forEach((event) => {
								if (event && typeof event === 'object') {
									// Handle match results for this tournament
									if ('type' in event && (event as GameEvent).type === 'matchResult') {
										const matchEvent = event as MatchResultEvent
										if (matchEvent.tournamentId === tournamentId) {
											handleGameEvent(matchEvent)
										}
									}
									// Handle tournament data updates
									if ('id' in event && 'status' in event && !('type' in event) && (event as Record<string, unknown>).id === tournamentId) {
										const tournamentData = event as TournamentData
										setTournaments((prev) => {
											const updated = new Map(prev)
											updated.set(tournamentId, tournamentData)
											return updated
										})
									}
								}
							})
						} catch (error) {
							console.error('Error processing tournament event:', error, payload)
						}
					},
					onError: (error) => {
						console.error('Tournament stream error:', error)
						toast.error('Tournament stream error: ' + (error.message || 'Unknown error'))
					},
				})

				if (subscription) {
					console.log('Successfully subscribed to tournament:', subscription.subscriptionId)
					setSubscriptions((prev) => new Map(prev).set(subscriptionKey, subscription))
					toast.success(`Subscribed to tournament ${tournamentId} updates`)
				} else {
					console.error('Tournament subscription returned undefined')
					toast.error('Failed to create tournament subscription')
				}
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error('Failed to subscribe to tournament:', error)
				toast.error('Failed to subscribe to tournament stream: ' + errorMessage)
			}
		},
		[sdk, isConnected, subscribe, subscriptions, handleGameEvent]
	)

	const subscribeToAllTournaments = useCallback(
		async (streamEventId?: string) => {
			if (!sdk) {
				console.warn('Somnia SDK not ready yet')
				return
			}

			if (!isConnected) {
				console.warn('Wallet connection required to subscribe to tournaments')
				return
			}

			const subscriptionKey = 'all-tournaments'
			if (subscriptions.has(subscriptionKey)) {
				return
			}

			try {
				console.log('Subscribing to all tournaments stream...', { streamEventId })
				
				const subscription = await subscribe({
					somniaStreamsEventId: streamEventId,
					ethCalls: [],
					context: 'tournaments',
					onlyPushChanges: false, // Get initial data too
					onData: (payload) => {
						try {
							console.log('Tournaments stream data received:', payload)
							
							// Transform payload (handles both GameEvents and BlockchainEvents)
							const transformed = transformEvent(payload)
							
							// Handle tournament data updates (non-game events)
							if (!transformed && payload && typeof payload === 'object') {
								if ('id' in payload && 'status' in payload) {
									const tournamentData = payload as TournamentData
									setTournaments((prev) => {
										const updated = new Map(prev)
										updated.set(tournamentData.id, tournamentData)
										return updated
									})
									return
								}
							}
							
							if (!transformed) {
								console.warn('Could not transform payload:', payload)
								return
							}
							
							// Handle array of events or single event
							const events = Array.isArray(transformed) ? transformed : [transformed]
							events.forEach((event) => {
								if (event && typeof event === 'object') {
									// Handle tournament data updates
									if ('id' in event && 'status' in event && !('type' in event)) {
										const tournamentData = event as TournamentData
										setTournaments((prev) => {
											const updated = new Map(prev)
											updated.set(tournamentData.id, tournamentData)
											return updated
										})
									}
									// Handle match results
									if ('type' in event && (event as GameEvent).type === 'matchResult') {
										handleGameEvent(event as GameEvent)
									}
								}
							})
						} catch (error) {
							console.error('Error processing tournaments event:', error, payload)
						}
					},
					onError: (error) => {
						console.error('Tournaments stream error:', error)
						toast.error('Tournaments stream error: ' + (error.message || 'Unknown error'))
					},
				})

				if (subscription) {
					console.log('Successfully subscribed to all tournaments:', subscription.subscriptionId)
					setSubscriptions((prev) => new Map(prev).set(subscriptionKey, subscription))
					console.log('Subscribed to all tournaments stream')
				} else {
					console.error('Tournaments subscription returned undefined')
				}
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error('Failed to subscribe to tournaments:', error)
				toast.error('Failed to subscribe to tournaments: ' + errorMessage)
			}
		},
		[sdk, isConnected, subscribe, subscriptions, handleGameEvent]
	)

	const unsubscribe = useCallback((subscriptionId: string) => {
		const subscription = subscriptions.get(subscriptionId)
		if (subscription) {
			subscription.unsubscribe()
			setSubscriptions((prev) => {
				const updated = new Map(prev)
				updated.delete(subscriptionId)
				return updated
			})
			toast.info('Unsubscribed from stream')
		}
	}, [subscriptions])

	const unsubscribeAll = useCallback(() => {
		if (subscriptions.size === 0) {
			return // No subscriptions to unsubscribe from
		}
		
		subscriptions.forEach((subscription) => {
			subscription.unsubscribe()
		})
		setSubscriptions(new Map())
		// Don't show toast on cleanup - only show when explicitly called
	}, [subscriptions])

	// Auto-subscribe to leaderboard on mount (requires wallet connection)
	useEffect(() => {
		if (sdk && isConnected && !isInitialized) {
			console.log('Auto-subscribing to leaderboard...')
			const streamEventId = import.meta.env.VITE_LEADERBOARD_STREAM_EVENT_ID || undefined
			subscribeToLeaderboard(streamEventId).catch((error) => {
				console.error('Failed to auto-subscribe to leaderboard:', error)
			})
			setIsInitialized(true)
		}
	}, [sdk, isConnected, isInitialized, subscribeToLeaderboard])

	// Auto-subscribe to tournaments on mount (requires wallet connection)
	useEffect(() => {
		if (sdk && isConnected && !tournamentsInitialized) {
			console.log('Auto-subscribing to tournaments...')
			const streamEventId = import.meta.env.VITE_TOURNAMENT_STREAM_EVENT_ID || undefined
			subscribeToAllTournaments(streamEventId).catch((error) => {
				console.error('Failed to auto-subscribe to tournaments:', error)
			})
			setTournamentsInitialized(true)
		}
	}, [sdk, isConnected, tournamentsInitialized, subscribeToAllTournaments])

	// Cleanup on unmount - silent cleanup, no toast
	useEffect(() => {
		return () => {
			// Only cleanup if there are active subscriptions
			if (subscriptions.size > 0) {
				subscriptions.forEach((subscription) => {
					subscription.unsubscribe()
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run on unmount

	// Wrapper for unsubscribeAll that shows toast (for explicit user actions)
	const unsubscribeAllWithToast = useCallback(() => {
		if (subscriptions.size === 0) {
			toast.info('No active subscriptions')
			return
		}
		
		subscriptions.forEach((subscription) => {
			subscription.unsubscribe()
		})
		setSubscriptions(new Map())
		toast.info('Unsubscribed from all streams')
	}, [subscriptions])

	return (
		<DataStreamsContext.Provider
			value={{
				players,
				tournaments,
				subscriptions,
				isSubscribed: subscriptions.size > 0,
				subscribeToLeaderboard,
				subscribeToPlayer,
				subscribeToTournament,
				subscribeToAllTournaments,
				unsubscribe,
				unsubscribeAll: unsubscribeAllWithToast,
				lastEvent,
			}}
		>
			{children}
		</DataStreamsContext.Provider>
	)
}

export const useDataStreams = () => {
	const context = useContext(DataStreamsContext)
	if (!context) {
		throw new Error('useDataStreams must be used within a DataStreamsProvider')
	}
	return context
}

