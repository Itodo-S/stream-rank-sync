import { useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Award, Calendar, ExternalLink, Wifi, WifiOff, Loader2, Wallet } from "lucide-react";
import { usePlayerStream } from "@/hooks/use-player-stream";
import { useSomniaWalletContext } from "@/context/somnia-wallet-context";
import { useDataStreams } from "@/context/data-streams-context";
import { somniaChain } from "@/lib/somnia";
import type { PlayerData } from "@/types/game-events";

const Profile = () => {
	const navigate = useNavigate();
	const { walletAddress: urlWalletAddress } = useParams<{ walletAddress?: string }>();
	const { address: connectedAddress, isConnected, isConnecting } = useSomniaWalletContext();
	const { lastEvent } = useDataStreams();
	
	// Redirect to connect if wallet not connected
	useEffect(() => {
		if (!isConnected && !isConnecting) {
			navigate("/connect", { replace: true });
		}
	}, [isConnected, isConnecting, navigate]);
	
	// Use wallet address from URL params, or connected wallet
	const targetWalletAddress = urlWalletAddress || connectedAddress?.toLowerCase() || "";
	const { player: streamPlayer, isLoading } = usePlayerStream(targetWalletAddress);
	
	// Only use real stream data - no mock fallback
	// Player is always defined (returns default if no streamPlayer or no address)
	const player = useMemo((): PlayerData => {
		if (!targetWalletAddress) {
			return {
				id: '',
				walletAddress: '',
				username: 'Guest',
				avatar: '🎮',
				rank: 0,
				score: 0,
				wins: 0,
				losses: 0,
				winRate: 0,
				level: 1,
				achievements: [],
			}
		}
		
		if (streamPlayer) {
			return {
				...streamPlayer,
				username: streamPlayer.username || `Player ${targetWalletAddress.slice(0, 6)}`,
				avatar: streamPlayer.avatar || "🎮",
			};
		}
		
		// Return default structure if no data yet
		return {
			id: targetWalletAddress.toLowerCase(),
			walletAddress: targetWalletAddress,
			username: `Player ${targetWalletAddress.slice(0, 6)}`,
			avatar: "🎮",
			rank: 0,
			score: 0,
			wins: 0,
			losses: 0,
			winRate: 0,
			level: 1,
			achievements: [],
		};
	}, [streamPlayer, targetWalletAddress]);
	
	const unlockedAchievements = useMemo(() => {
		return (player.achievements || []).filter(a => a.unlockedAt);
	}, [player]);
	
	const isViewingOwnProfile = connectedAddress && targetWalletAddress.toLowerCase() === connectedAddress.toLowerCase();
	const hasRealData = !!streamPlayer && targetWalletAddress;
	
	// Show loading or connect screen
	if (!isConnected || !targetWalletAddress) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<Card className="p-12 text-center">
						<Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h2 className="text-2xl font-bold mb-2">Wallet Connection Required</h2>
						<p className="text-muted-foreground mb-6">Please connect your wallet to view profiles</p>
						<Button onClick={() => navigate("/connect")} size="lg">
							Connect Wallet
						</Button>
					</Card>
				</div>
			</div>
		);
	}
	
	// Player is always defined from useMemo (returns default if no streamPlayer)
	// No need to check for null - just render with default data if stream data hasn't arrived yet

	const stats = [
		{ label: "Total Matches", value: (player.wins || 0) + (player.losses || 0) },
		{ label: "Wins", value: player.wins || 0 },
		{ label: "Losses", value: player.losses || 0 },
		{ label: "Win Rate", value: `${player.winRate || 0}%` },
	];

	// Recent games would come from matchResult events in the future
	// For now, using mock data
	const recentGames = [
		{ date: "2024-03-15", opponent: "CryptoKnight", result: "loss", score: "10-12" },
		{ date: "2024-03-15", opponent: "BlockchainBoss", result: "win", score: "15-8" },
		{ date: "2024-03-14", opponent: "PixelWarrior", result: "win", score: "12-9" },
		{ date: "2024-03-14", opponent: "DataStreamPro", result: "win", score: "14-11" },
		{ date: "2024-03-13", opponent: "CryptoKnight", result: "loss", score: "8-15" },
	];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
			<div className="container mx-auto px-4 py-8 space-y-8">
				{/* Data Source Indicator */}
				{targetWalletAddress && (
					<Card className="p-4 border-border">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{hasRealData ? (
									<>
										<Wifi className="h-4 w-4 text-accent animate-pulse" />
										<span className="text-sm font-medium text-accent">🔴 Live Data from Streams</span>
									</>
								) : isLoading ? (
									<>
										<Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
										<span className="text-sm text-muted-foreground">Loading player data...</span>
									</>
								) : (
									<>
										<WifiOff className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Showing demo data (no stream data yet)</span>
									</>
								)}
							</div>
							{!isViewingOwnProfile && isConnected && (
								<Link to="/profile">
									<Button variant="outline" size="sm">
										View My Profile
									</Button>
								</Link>
							)}
						</div>
					</Card>
				)}
				
				{/* Profile Header */}
				<Card className="p-8 border-primary/20 bg-gradient-glow relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-primary opacity-5" />
					<div className="relative flex flex-col md:flex-row items-center gap-8">
						{/* Avatar */}
						<div className="text-8xl animate-float">{player.avatar}</div>

						{/* Info */}
						<div className="flex-1 text-center md:text-left space-y-4">
							<div>
								<h1 className="text-4xl font-bold mb-2">{player.username}</h1>
								<div className="flex items-center gap-2 justify-center md:justify-start">
									<span className="text-sm font-mono text-muted-foreground">
										{player.walletAddress.slice(0, 10)}...{player.walletAddress.slice(-8)}
									</span>
									<Button 
										variant="ghost" 
										size="icon" 
										className="h-6 w-6"
										onClick={() => window.open(`${somniaChain.blockExplorers?.default?.url}/address/${player.walletAddress}`, '_blank')}
									>
										<ExternalLink className="h-3 w-3" />
									</Button>
								</div>
							</div>

							<div className="flex flex-wrap gap-4 justify-center md:justify-start">
								<div className="flex items-center gap-2">
									<Trophy className="h-5 w-5 text-primary" />
									<span className="font-semibold">Rank #{player.rank || 'N/A'}</span>
								</div>
								<div className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5 text-secondary" />
									<span className="font-semibold">{(player.score || 0).toLocaleString()} Score</span>
								</div>
								<div className="flex items-center gap-2">
									<Award className="h-5 w-5 text-warning" />
									<span className="font-semibold">Level {player.level || 1}</span>
								</div>
							</div>
            </div>

							{/* Action Button */}
							{isViewingOwnProfile ? (
								<Button size="lg" variant="outline" className="border-primary/20 hover:border-primary">
									Edit Profile
								</Button>
							) : (
								<Link to={`/leaderboard?search=${player.walletAddress}`}>
									<Button size="lg" variant="outline" className="border-primary/20 hover:border-primary">
										View on Leaderboard
									</Button>
								</Link>
							)}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="games">Recent Games</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-4">
            <Card className="border-border">
              <div className="divide-y divide-border">
                {recentGames.map((game, index) => (
                  <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">vs {game.opponent}</p>
                          <p className="text-sm text-muted-foreground">{game.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-muted-foreground">{game.score}</span>
                        <div className={`px-4 py-1 rounded-full text-sm font-medium ${
                          game.result === 'win' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {game.result === 'win' ? 'Victory' : 'Defeat'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

						<TabsContent value="achievements" className="space-y-4">
							{unlockedAchievements.length === 0 ? (
								<Card className="p-8 border-border text-center">
									<Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">No achievements unlocked yet</p>
									{hasRealData && (
										<p className="text-xs text-muted-foreground mt-2">
											Achievements will appear here when unlocked via data streams
										</p>
									)}
								</Card>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{unlockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="p-6 border-primary/20">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          achievement.rarity === 'legendary' ? 'bg-warning/20 text-warning' :
                          achievement.rarity === 'epic' ? 'bg-secondary/20 text-secondary' :
                          achievement.rarity === 'rare' ? 'bg-primary/20 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      {achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
										</div>
									</Card>
								))}
							</div>
						)}
					</TabsContent>
        </Tabs>
				</div>

				<Footer />
			</div>
		);
};

export default Profile;
