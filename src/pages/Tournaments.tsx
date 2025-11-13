import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Calendar, DollarSign, Play, Wifi, WifiOff, Loader2, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useSomniaWalletContext } from "@/context/somnia-wallet-context";
import { useTournamentsStream } from "@/hooks/use-tournaments-stream";
import type { TournamentData } from "@/types/game-events";

const Tournaments = () => {
	const navigate = useNavigate();
	const { isConnected, isConnecting } = useSomniaWalletContext();
	const { liveTournaments, upcomingTournaments, completedTournaments, isSubscribed } = useTournamentsStream();
	
	// Redirect to connect if wallet not connected
	useEffect(() => {
		if (!isConnected && !isConnecting) {
			navigate("/connect", { replace: true });
		}
	}, [isConnected, isConnecting, navigate]);

	if (!isConnected) {
		return (
			<div className="min-h-screen bg-background">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<Card className="p-12 text-center">
						<Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h2 className="text-2xl font-bold mb-2">Wallet Connection Required</h2>
						<p className="text-muted-foreground mb-6">Please connect your wallet to view tournaments</p>
						<Button onClick={() => navigate("/connect")} size="lg">
							Connect Wallet
						</Button>
					</Card>
				</div>
			</div>
		);
	}

	const TournamentCard = ({ tournament }: { tournament: TournamentData }) => {
    const statusColors = {
      live: "bg-accent text-accent-foreground",
      upcoming: "bg-secondary text-secondary-foreground",
      completed: "bg-muted text-muted-foreground"
    };

    const statusIcons = {
      live: <div className="h-2 w-2 rounded-full bg-accent animate-glow-pulse" />,
      upcoming: <Calendar className="h-3 w-3" />,
      completed: <Trophy className="h-3 w-3" />
    };

    return (
      <Card className="p-6 border-border hover:border-primary/50 transition-all group">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                {tournament.name}
              </h3>
              <p className="text-sm text-muted-foreground">{tournament.game}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[tournament.status]}`}>
              {statusIcons[tournament.status]}
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Prize Pool</span>
              </div>
              <p className="text-lg font-bold text-primary">{tournament.prizePool}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs">Participants</span>
              </div>
              <p className="text-lg font-bold">{tournament.participants}/{tournament.maxParticipants}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all"
                style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((tournament.participants / tournament.maxParticipants) * 100)}% full
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link to={`/tournaments/${tournament.id}`} className="flex-1">
              <Button className="w-full bg-gradient-primary hover:shadow-glow">
                <Play className="h-4 w-4 mr-2" />
                {tournament.status === 'live' ? 'Watch Live' : 'View Details'}
              </Button>
            </Link>
            {tournament.status === 'upcoming' && (
              <Button variant="outline" className="border-primary/20 hover:border-primary">
                Join
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
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
							Tournaments
						</h1>
						<p className="text-muted-foreground">
							{isSubscribed 
								? "🔴 Live tournaments with real-time brackets and instant updates"
								: "Connecting to live tournament data..."}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{isSubscribed ? (
							<>
								<Wifi className="h-4 w-4 text-accent animate-pulse" />
								<span className="text-sm font-medium text-accent">🔴 LIVE</span>
							</>
						) : (
							<>
								<Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
								<span className="text-sm text-muted-foreground">Connecting...</span>
							</>
						)}
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="p-6 border-border">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Live Now</p>
								<p className="text-3xl font-bold text-accent">{liveTournaments.length}</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
								<Play className="h-6 w-6 text-accent" />
							</div>
						</div>
					</Card>

					<Card className="p-6 border-border">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Upcoming</p>
								<p className="text-3xl font-bold text-secondary">{upcomingTournaments.length}</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
								<Calendar className="h-6 w-6 text-secondary" />
							</div>
						</div>
					</Card>

					<Card className="p-6 border-border">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Total Prize Pool</p>
								<p className="text-3xl font-bold text-primary">
									{liveTournaments.length + upcomingTournaments.length > 0
										? `${liveTournaments.concat(upcomingTournaments).reduce((sum, t) => {
												const prize = parseFloat(t.prizePool.replace(/[^0-9.]/g, '')) || 0
												return sum + prize
											}, 0).toLocaleString()}K+`
										: '0'}
								</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
								<DollarSign className="h-6 w-6 text-primary" />
							</div>
						</div>
					</Card>
				</div>

        {/* Tournaments List */}
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

						<TabsContent value="live" className="space-y-6">
							{liveTournaments.length === 0 ? (
								<Card className="p-12 text-center border-border">
									<Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										{isSubscribed 
											? "No live tournaments at the moment. Check back soon!"
											: "Connecting to live tournament data..."}
									</p>
								</Card>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{liveTournaments.map(tournament => (
										<TournamentCard key={tournament.id} tournament={tournament} />
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="upcoming" className="space-y-6">
							{upcomingTournaments.length === 0 ? (
								<Card className="p-12 text-center border-border">
									<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										{isSubscribed 
											? "No upcoming tournaments scheduled. Check back later!"
											: "Connecting to tournament data..."}
									</p>
								</Card>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{upcomingTournaments.map(tournament => (
										<TournamentCard key={tournament.id} tournament={tournament} />
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="completed" className="space-y-6">
							{completedTournaments.length === 0 ? (
								<Card className="p-12 text-center border-border">
									<Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										{isSubscribed 
											? "No completed tournaments yet."
											: "Connecting to tournament data..."}
									</p>
								</Card>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{completedTournaments.map(tournament => (
										<TournamentCard key={tournament.id} tournament={tournament} />
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

export default Tournaments;
