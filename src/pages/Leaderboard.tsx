import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, ArrowUp, ArrowDown, Minus, Search, Filter, Wifi, WifiOff, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaderboardStream } from "@/hooks/use-leaderboard-stream";
import { useSomniaWalletContext } from "@/context/somnia-wallet-context";
import type { PlayerData } from "@/types/game-events";

const Leaderboard = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const { address, isConnected, connect, isConnecting } = useSomniaWalletContext();
	const { players: streamPlayers, isSubscribed } = useLeaderboardStream();
	
	// Redirect to connect if wallet not connected
	useEffect(() => {
		if (!isConnected && !isConnecting) {
			navigate("/connect", { replace: true });
		}
	}, [isConnected, isConnecting, navigate]);

	// Only show real stream data - no mock fallback
	const allPlayers = useMemo(() => {
		return streamPlayers
			.sort((a, b) => {
				if (a.rank !== b.rank && a.rank > 0 && b.rank > 0) {
					return a.rank - b.rank;
				}
				return b.score - a.score;
			})
			.map((p, i) => ({ ...p, rank: p.rank || i + 1 }));
	}, [streamPlayers]);

	const filteredPlayers = allPlayers.filter(p => 
		p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
		p.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
	);

  const getRankIcon = (change?: 'up' | 'down' | 'same') => {
    if (change === 'up') return <ArrowUp className="h-4 w-4 text-success" />;
    if (change === 'down') return <ArrowDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-warning";
    if (rank === 2) return "text-muted-foreground";
    if (rank === 3) return "text-orange-600";
    return "text-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="h-10 w-10 text-primary" />
              Global Leaderboard
            </h1>
						<p className="text-muted-foreground">
							{isSubscribed 
								? "🔴 Live data from Somnia Data Streams - updates in real-time"
								: "Connecting to live data stream..."}
						</p>
          </div>
					<div className="flex items-center gap-2">
						{isSubscribed ? (
							<>
								<Wifi className="h-4 w-4 text-accent animate-pulse" />
								<span className="text-sm font-medium text-accent">🔴 LIVE - Real-Time Data</span>
							</>
						) : (
							<>
								<WifiOff className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium text-muted-foreground">
									Connecting to live stream...
								</span>
							</>
						)}
					</div>
        </div>

        {/* Filters */}
        <Card className="p-4 border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Button variant="outline" className="gap-2 border-primary/20">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Leaderboard Table */}
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Win Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
								{!isConnected ? (
									<tr>
										<td colSpan={6} className="px-6 py-8 text-center">
											<div className="flex flex-col items-center gap-4">
												<Wallet className="h-12 w-12 text-muted-foreground" />
												<p className="text-muted-foreground">Please connect your wallet to view live leaderboard</p>
												<Button onClick={() => navigate("/connect")}>
													Connect Wallet
												</Button>
											</div>
										</td>
									</tr>
								) : !isSubscribed ? (
									<tr>
										<td colSpan={6} className="px-6 py-8 text-center">
											<div className="flex flex-col items-center gap-4">
												<Loader2 className="h-8 w-8 text-primary animate-spin" />
												<p className="text-muted-foreground">Connecting to live data stream...</p>
											</div>
										</td>
									</tr>
								) : filteredPlayers.length === 0 ? (
									<tr>
										<td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
											No players found in live stream yet. Waiting for data...
										</td>
									</tr>
								) : (
									filteredPlayers.map((player) => {
										const isCurrentUser = address && player.walletAddress.toLowerCase() === address.toLowerCase();
                  return (
                    <tr
                      key={player.id}
                      className={cn(
                        "border-b border-border transition-all hover:bg-muted/30",
                        isCurrentUser && "bg-primary/5 border-primary/20"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={cn("text-2xl font-bold", getRankColor(player.rank))}>
                            {player.rank}
                          </span>
                          {player.rank <= 3 && (
                            <Trophy className={cn("h-5 w-5", getRankColor(player.rank))} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{player.avatar}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{player.username}</span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
                              {player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-primary">
                          {player.score.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-semibold">{player.winRate}%</span>
                          <p className="text-xs text-muted-foreground">
                            {player.wins}W - {player.losses}L
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold">{player.level}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {getRankIcon(player.rankChange)}
                        </div>
                      </td>
										</tr>
									);
								})
							)}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary">
            Load More Players
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
