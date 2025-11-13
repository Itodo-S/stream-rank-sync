import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, Zap, Shield, TrendingUp, Users, Award } from "lucide-react";
import { useSomniaWalletContext } from "@/context/somnia-wallet-context";

const Landing = () => {
  const { isConnected, connect, isConnecting } = useSomniaWalletContext();

  const features = [
    {
      icon: Zap,
      title: "Real-Time Updates",
      description: "Instant rank changes powered by Somnia Data Streams with zero delay",
    },
    {
      icon: Shield,
      title: "Web3 Authenticated",
      description: "Secure wallet-based player authentication and profile management",
    },
    {
      icon: TrendingUp,
      title: "Live Tournaments",
      description: "Dynamic brackets with real-time match results and standings",
    },
    {
      icon: Users,
      title: "Global Leaderboard",
      description: "Compete with players worldwide with live rank tracking",
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Unlock achievements instantly as they happen on-chain",
    },
    {
      icon: Trophy,
      title: "Player Profiles",
      description: "Track your stats, history, and compare with other players",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-hero">
          <div className="absolute inset-0 bg-gradient-glow animate-glow-pulse" />
        </div>
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm">
              <Zap className="h-4 w-4 text-primary animate-glow-pulse" />
              <span className="text-foreground">Powered by Somnia Data Streams</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Live Gaming
              </span>
              <br />
              Leaderboards
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience instant rank updates, real-time tournaments, and Web3-powered 
              player authentication. Compete globally with zero delay.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isConnected ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8">
                    <Trophy className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-primary hover:shadow-glow text-lg px-8"
                  onClick={connect}
                  disabled={isConnecting}
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  {isConnecting ? "Connecting…" : "Connect Wallet"}
                </Button>
              )}
              <Link to="/leaderboard">
                <Button size="lg" variant="outline" className="border-primary/20 hover:border-primary text-lg px-8">
                  View Leaderboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground mt-1">Live Tournaments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">1M+</div>
                <div className="text-sm text-muted-foreground mt-1">Matches Played</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <Trophy className="h-12 w-12 text-primary/20" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1s' }}>
          <Award className="h-16 w-16 text-secondary/20" />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-bold">
            Built for <span className="text-primary">Competitive Gaming</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature designed to give you the edge in competitive play
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="p-6 border-border bg-card hover:border-primary/50 transition-all hover:shadow-card group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 border-primary/20 bg-gradient-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5" />
          <div className="relative text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Compete?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join thousands of players in real-time tournaments and climb the global leaderboard
            </p>
            {isConnected ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8">
                  Enter Dashboard
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="bg-gradient-primary hover:shadow-glow text-lg px-8"
                onClick={connect}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting…" : "Get Started Now"}
              </Button>
            )}
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
