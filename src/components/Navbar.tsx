import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trophy,
  Zap,
  User,
  Bell,
  Award,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSomniaWalletContext } from "@/context/somnia-wallet-context";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, isConnected, connect, isConnecting, disconnect } = useSomniaWalletContext();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const truncatedAddress =
    address && address.length > 10 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;

  const handleConnectClick = async () => {
    if (!isConnected) {
      await connect();
    }
    navigate("/connect");
  };

  const handleDisconnectClick = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
      toast.info("Wallet disconnected.");
      navigate("/connect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Zap },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/tournaments", label: "Tournaments", icon: Award },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Trophy className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 animate-glow-pulse blur-xl bg-primary/20 rounded-full" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StreamRankSync
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent animate-glow-pulse" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/20 hover:border-primary hover:shadow-glow flex items-center gap-2"
                    disabled={isDisconnecting}
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="text-xs font-mono">{truncatedAddress ?? "Wallet"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground uppercase">Connected Wallet</p>
                    <p className="text-sm font-mono mt-1 break-all">{address}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDisconnectClick}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button className="bg-gradient-primary hover:shadow-glow" onClick={handleConnectClick} disabled={isConnecting}>
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
