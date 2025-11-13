import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Award, Zap, ArrowUp, ArrowDown, Wifi, WifiOff, Loader2, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { mockTournaments } from "@/utils/mockData";
import { useSomniaWalletContext } from "@/context/somnia-wallet-context";
import { usePlayerStream } from "@/hooks/use-player-stream";
import { useLeaderboardStream } from "@/hooks/use-leaderboard-stream";
import type { PlayerData } from "@/types/game-events";

const Dashboard = () => {
	const navigate = useNavigate();
	const { address, isConnected, isConnecting } = useSomniaWalletContext();
	const { player: streamPlayer, isLoading: isLoadingPlayer } = usePlayerStream(address || "");
	const { isSubscribed } = useLeaderboardStream();
	
	// Redirect to connect if wallet not connected
	useEffect(() => {
		if (!isConnected && !isConnecting) {
			navigate("/connect", { replace: true });
		}
	}, [isConnected, isConnecting, navigate]);

	// Only use real stream data - no mock fallback
	const currentPlayer = useMemo((): PlayerData => {
		if (!address) {
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
				username: streamPlayer.username || `Player ${address.slice(0, 6)}`,
				avatar: streamPlayer.avatar || "🎮",
			};
		}
		
		// Return default structure if no data yet (show default instead of loading forever)
		return {
			id: address.toLowerCase(),
			walletAddress: address,
			username: `Player ${address.slice(0, 6)}`,
			avatar: "🎮",
			rank: 0,
			score: 0,
			wins: 0,
			losses: 0,
			winRate: 0,
			level: 1,
			achievements: [],
		};
	}, [streamPlayer, address]);
	const liveTournaments = mockTournaments.filter(t => t.status === 'live');
	
	// Show loading state if wallet not connected
	if (!isConnected || !address) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<Card className="p-12 text-center">
						<Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h2 className="text-2xl font-bold mb-2">Wallet Connection Required</h2>
						<p className="text-muted-foreground mb-6">Please connect your wallet to view your dashboard</p>
						<Button onClick={() => navigate("/connect")} size="lg">
							Connect Wallet
						</Button>
					</Card>
				</div>
			</div>
		);
	}
	
	// currentPlayer is always defined from useMemo (returns default if no streamPlayer)
	// No need to check for null - just render with default data if stream data hasn't arrived yet
  const recentMatches = [
    { opponent: "CryptoKnight", result: "loss", score: "10-12", time: "2 hours ago" },
    { opponent: "BlockchainBoss", result: "win", score: "15-8", time: "5 hours ago" },
    { opponent: "PixelWarrior", result: "win", score: "12-9", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
						<h1 className="text-4xl font-bold mb-2">
							Welcome back, <span className="text-primary">{currentPlayer.username}</span>
						</h1>
						<p className="text-muted-foreground">Track your performance and compete in real-time</p>
						{isConnected && (
							<div className="flex items-center gap-2 mt-2">
								{isSubscribed ? (
									<>
										<Wifi className="h-4 w-4 text-accent animate-pulse" />
										<span className="text-xs text-accent">Live data stream active</span>
									</>
								) : (
									<>
										<WifiOff className="h-4 w-4 text-muted-foreground" />
										<span className="text-xs text-muted-foreground">Connecting to stream...</span>
									</>
								)}
							</div>
						)}
					</div>
					<div className="text-6xl animate-float">{currentPlayer.avatar}</div>
				</div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-primary/20 bg-gradient-glow relative overflow-hidden group hover:border-primary transition-all">
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Global Rank</span>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
							<div className="flex items-end gap-2">
								<span className="text-4xl font-bold">#{currentPlayer.rank || 'N/A'}</span>
								{currentPlayer.rankChange === 'up' && (
									<span className="flex items-center text-success text-sm mb-1">
										<ArrowUp className="h-4 w-4" />
										↑
									</span>
								)}
								{currentPlayer.rankChange === 'down' && (
									<span className="flex items-center text-destructive text-sm mb-1">
										<ArrowDown className="h-4 w-4" />
										↓
									</span>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								{currentPlayer.rank ? `Rank #${currentPlayer.rank} globally` : 'Ranking pending'}
							</p>
            </div>
          </Card>

          <Card className="p-6 border-border hover:border-primary/50 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
							<div className="text-4xl font-bold">{(currentPlayer.score || 0).toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">
								{isSubscribed ? 'Live score updates' : 'Waiting for data...'}
							</p>
            </div>
          </Card>

          <Card className="p-6 border-border hover:border-primary/50 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <Zap className="h-5 w-5 text-accent" />
              </div>
							<div className="text-4xl font-bold">{currentPlayer.winRate || 0}%</div>
							<p className="text-xs text-muted-foreground">
								{currentPlayer.wins || 0}W - {currentPlayer.losses || 0}L
							</p>
            </div>
          </Card>

          <Card className="p-6 border-border hover:border-primary/50 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <Award className="h-5 w-5 text-warning" />
              </div>
							<div className="text-4xl font-bold">{currentPlayer.level || 1}</div>
							<p className="text-xs text-muted-foreground">Level {currentPlayer.level || 1}</p>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Matches */}
          <Card className="lg:col-span-2 p-6 border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Matches</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentMatches.map((match, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.result === 'win' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {match.result === 'win' ? 'Victory' : 'Defeat'}
                    </div>
                    <div>
                      <p className="font-medium">vs {match.opponent}</p>
                      <p className="text-sm text-muted-foreground">{match.time}</p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-muted-foreground">{match.score}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Live Tournaments */}
          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Live Tournaments</h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent animate-glow-pulse" />
                <span className="text-sm text-accent">Live</span>
              </div>
            </div>
            <div className="space-y-4">
              {liveTournaments.map((tournament) => (
                <Link key={tournament.id} to={`/tournaments/${tournament.id}`}>
                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted hover:border-primary/50 border border-transparent transition-all cursor-pointer">
                    <h3 className="font-semibold mb-2">{tournament.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool</span>
                        <span className="font-medium text-primary">{tournament.prizePool}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Players</span>
                        <span className="font-medium">{tournament.participants}/{tournament.maxParticipants}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Link to="/tournaments">
                <Button variant="outline" className="w-full border-primary/20 hover:border-primary">
                  View All Tournaments
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 border-primary/20 bg-gradient-glow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready for your next match?</h3>
              <p className="text-muted-foreground">Join a tournament or challenge other players</p>
            </div>
            <div className="flex gap-3">
              <Link to="/tournaments">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow">
                  Find Match
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="lg" variant="outline" className="border-primary/20 hover:border-primary">
                  Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
