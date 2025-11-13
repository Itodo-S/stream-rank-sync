import { SDK } from '@somnia-chain/streams'
import { createPublicClient, http, webSocket } from 'viem'
import { defineChain } from 'viem'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const SOMNIA_TESTNET_RPC_URL = process.env.VITE_SOMNIA_TESTNET_RPC_URL || 'https://dream-rpc.somnia.network'
const SOMNIA_TESTNET_WS_URL = process.env.VITE_SOMNIA_TESTNET_WS_URL || 'wss://dream-rpc.somnia.network/ws'

const somniaTestnet = defineChain({
	id: 50312,
	name: 'Somnia Testnet',
	network: 'somnia-testnet',
	nativeCurrency: {
		name: 'Somnia Testnet Token',
		symbol: 'STT',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: [SOMNIA_TESTNET_RPC_URL],
			webSocket: [SOMNIA_TESTNET_WS_URL],
		},
		public: {
			http: [SOMNIA_TESTNET_RPC_URL],
			webSocket: [SOMNIA_TESTNET_WS_URL],
		},
	},
	blockExplorers: {
		default: {
			name: 'Somnia Explorer',
			url: 'https://somnia-testnet.socialscan.io',
		},
	},
})

function isGameEvent(payload) {
	if (!payload || typeof payload !== 'object') return false
	const validTypes = ['scoreUpdate', 'rankChange', 'achievementUnlocked', 'matchResult']
	return 'type' in payload && validTypes.includes(payload.type)
}

function analyzePayload(payload) {
	if (!payload || typeof payload !== 'object') {
		return { type: 'unknown', structure: 'not an object' }
	}
	
	if (isGameEvent(payload)) {
		return { 
			type: 'gameEvent', 
			eventType: payload.type,
			structure: 'matches GameEvent interface',
			sample: {
				type: payload.type,
				playerAddress: payload.playerAddress || payload.player1Address || 'N/A',
			}
		}
	}
	
	if ('subscription' in payload && 'result' in payload) {
		return {
			type: 'blockchainEvent',
			structure: 'raw blockchain log',
			hasAddress: !!payload.result?.address,
			hasTopics: Array.isArray(payload.result?.topics),
			hasData: !!payload.result?.data,
		}
	}
	
	if (Array.isArray(payload)) {
		return {
			type: 'array',
			length: payload.length,
			firstItemType: payload[0] ? analyzePayload(payload[0]).type : 'empty',
		}
	}
	
	return {
		type: 'object',
		keys: Object.keys(payload),
		structure: 'generic object',
	}
}

async function testSomniaStreams() {
	console.log('🧪 Testing Somnia Data Streams Connection...\n')
	console.log('Configuration:')
	console.log(`  RPC URL: ${SOMNIA_TESTNET_RPC_URL}`)
	console.log(`  WebSocket URL: ${SOMNIA_TESTNET_WS_URL}\n`)

	try {
		console.log('📡 Step 1: Creating public client with WebSocket transport...')
		let publicClient
		try {
			publicClient = createPublicClient({
				chain: somniaTestnet,
				transport: webSocket(SOMNIA_TESTNET_WS_URL),
			})
			console.log('✅ Public client created successfully\n')
		} catch (error) {
			console.error('❌ Failed to create public client:', error.message)
			console.log('\n💡 Trying with HTTP transport instead...')
			publicClient = createPublicClient({
				chain: somniaTestnet,
				transport: http(SOMNIA_TESTNET_RPC_URL),
			})
			console.log('✅ Public client created with HTTP (may not work for subscriptions)\n')
		}

		console.log('🔧 Step 2: Initializing Somnia SDK...')
		const sdk = new SDK({
			public: publicClient,
		})
		console.log('✅ SDK initialized successfully\n')

		const receivedPayloads = []
		let gameEventCount = 0
		let blockchainEventCount = 0

		console.log('📥 Step 3: Testing subscription to general stream...')
		console.log('   (This will test if WebSocket connection works)\n')

		const subscription = await sdk.streams.subscribe({
			somniaStreamsEventId: undefined,
			ethCalls: [],
			context: 'test',
			onlyPushChanges: false,
			onData: (payload) => {
				const analysis = analyzePayload(payload)
				receivedPayloads.push(analysis)
				
				if (analysis.type === 'gameEvent') {
					gameEventCount++
					console.log(`✅ Game Event Received (${gameEventCount}):`, {
						eventType: analysis.eventType,
						sample: analysis.sample,
					})
				} else if (analysis.type === 'blockchainEvent') {
					blockchainEventCount++
					if (blockchainEventCount <= 3) {
						console.log(`\n📨 Blockchain Event (${blockchainEventCount}):`)
						console.log('Full structure:', JSON.stringify(payload, null, 2))
						console.log('Extracted info:', {
							subscription: payload.subscription,
							address: payload.result?.address,
							topicsCount: payload.result?.topics?.length || 0,
							topics: payload.result?.topics?.map(t => t.slice(0, 20) + '...') || [],
							dataLength: payload.result?.data?.length || 0,
							dataPreview: payload.result?.data?.slice(0, 100) + '...' || 'none',
							hasBlockNumber: !!payload.result?.blockNumber,
							hasTxHash: !!payload.result?.transactionHash,
						})
						console.log('')
					}
				} else if (analysis.type === 'array') {
					console.log(`📦 Array Received:`, {
						length: analysis.length,
						firstItemType: analysis.firstItemType,
					})
					if (Array.isArray(payload) && payload[0]) {
						const firstAnalysis = analyzePayload(payload[0])
						if (firstAnalysis.type === 'gameEvent') {
							gameEventCount++
							console.log(`  ✅ First item is a GameEvent:`, firstAnalysis)
						} else if (firstAnalysis.type === 'blockchainEvent') {
							console.log(`  📨 First item is a BlockchainEvent:`, JSON.stringify(payload[0], null, 2))
						}
					}
				} else {
					console.log(`📨 Unknown Payload:`, analysis)
					if (blockchainEventCount <= 3) {
						console.log('Full payload:', JSON.stringify(payload, null, 2))
					}
				}
			},
			onError: (error) => {
				console.error('❌ Stream error:', error.message || error)
			},
		})

		if (subscription) {
			console.log(`✅ Subscription created successfully!`)
			console.log(`   Subscription ID: ${subscription.subscriptionId}\n`)
			console.log('⏳ Waiting for data (will timeout after 10 seconds)...\n')

			await new Promise((resolve) => setTimeout(resolve, 10000))

			console.log('\n📊 Summary:')
			console.log(`   Total payloads received: ${receivedPayloads.length}`)
			console.log(`   Game Events (usable for pages): ${gameEventCount}`)
			console.log(`   Blockchain Events (raw data): ${blockchainEventCount}`)
			console.log(`   Other payloads: ${receivedPayloads.length - gameEventCount - blockchainEventCount}`)
			
			if (gameEventCount > 0) {
				console.log('\n✅ SUCCESS: Received game events that match our page structure!')
				console.log('   Your pages should be able to display this data.\n')
			} else {
				console.log('\n⚠️  WARNING: No game events received in the expected format.')
				console.log('   Your pages will show empty/loading states.')
				console.log('   Possible reasons:')
				console.log('   1. Need specific stream event ID for game data')
				console.log('   2. Need to transform raw blockchain events to game events')
				console.log('   3. Game contract not deployed or not emitting events yet\n')
			}

			console.log('🧹 Cleaning up subscription...')
			subscription.unsubscribe()
			console.log('✅ Subscription unsubscribed\n')
		} else {
			console.error('❌ Subscription returned null/undefined\n')
		}

		const streamEventId = process.env.VITE_LEADERBOARD_STREAM_EVENT_ID
		if (streamEventId) {
			console.log(`📥 Step 4: Testing subscription with event ID: ${streamEventId}...\n`)

			const specificSubscription = await sdk.streams.subscribe({
				somniaStreamsEventId: streamEventId,
				ethCalls: [],
				context: 'leaderboard-test',
				onlyPushChanges: false,
				onData: (payload) => {
					const analysis = analyzePayload(payload)
					if (analysis.type === 'gameEvent') {
						console.log('✅ Leaderboard Game Event:', analysis)
					} else {
						console.log('📨 Leaderboard data received:', analysis)
					}
				},
				onError: (error) => {
					console.error('❌ Leaderboard stream error:', error.message || error)
				},
			})

			if (specificSubscription) {
				console.log(`✅ Leaderboard subscription created!`)
				console.log(`   Subscription ID: ${specificSubscription.subscriptionId}\n`)
				await new Promise((resolve) => setTimeout(resolve, 5000))
				specificSubscription.unsubscribe()
				console.log('✅ Leaderboard subscription unsubscribed\n')
			}
		} else {
			console.log('⏭️  Step 4: Skipped (no VITE_LEADERBOARD_STREAM_EVENT_ID set)\n')
			console.log('💡 Tip: Set VITE_LEADERBOARD_STREAM_EVENT_ID in your .env to test specific game streams\n')
		}

		console.log('✅ All tests completed!\n')
	} catch (error) {
		console.error('\n❌ Test failed with error:')
		console.error(error)
		console.error('\nStack trace:')
		console.error(error.stack)
		process.exit(1)
	}
}

testSomniaStreams()
	.then(() => {
		console.log('✨ Test script finished')
		process.exit(0)
	})
	.catch((error) => {
		console.error('💥 Fatal error:', error)
		process.exit(1)
	})
