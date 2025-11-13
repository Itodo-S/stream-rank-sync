import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSomniaWalletContext } from "@/context/somnia-wallet-context";
import { useNavigate } from "react-router-dom";

const HomeStats = () => {
  const { isConnected, connect, isConnecting } = useSomniaWalletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate("/dashboard", { replace: true });
    }
  }, [isConnected, navigate]);

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <h2 className="text-3xl font-bold">Track your GameRank in real-time</h2>
        <p className="text-muted-foreground max-w-2xl">
          Connect your wallet to sync your Somnia on-chain stats and compete in live tournaments powered by Somnia Data Streams.
        </p>

        <Button
          size="lg"
          className="bg-gradient-primary hover:shadow-glow mt-4"
          disabled={isConnecting || isConnected}
          onClick={connect}
        >
          {isConnected ? "Wallet Connected" : isConnecting ? "Connecting…" : "Connect Wallet"}
        </Button>
      </div>
    </div>
  );
};

export default HomeStats;

