import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Wallet, Cable, Satellite, RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";

import { useSomniaWalletContext } from "@/context/somnia-wallet-context";
import { SomniaSubscription } from "@/hooks/use-somnia-wallet";
import { SOMNIA_CHAIN_ID_HEX, somniaChain } from "@/lib/somnia";

const Connect = () => {
  const navigate = useNavigate();
  const {
    address,
    connect,
    disconnect,
    isConnected,
    isConnecting,
    error,
    chainId,
    providerAvailable,
    ensureNetwork,
    subscribe,
  } = useSomniaWalletContext();

  const [streamEventId, setStreamEventId] = useState("");
  const [onlyPushChanges, setOnlyPushChanges] = useState(true);
  const [subscription, setSubscription] = useState<SomniaSubscription | null>(null);
  const [streamOutput, setStreamOutput] = useState<string[]>([]);
  const hasShownConnectedToast = useRef(false);

  useEffect(() => {
    if (!error) {
      return;
    }
    toast.error(error);
  }, [error]);

  const connectionDescription = useMemo(() => {
    if (!providerAvailable) {
      return "No browser wallet detected. Install MetaMask or another EVM-compatible wallet to continue.";
    }

    if (!isConnected) {
      return "Connect your wallet to authenticate with Somnia and unlock live leaderboard data.";
    }

		if (chainId?.toLowerCase() !== SOMNIA_CHAIN_ID_HEX.toLowerCase()) {
			return `Switch to ${somniaChain.name} inside your wallet to enable contract interactions.`;
		}

    return "Wallet connection active. You can now subscribe to Somnia Data Streams for real-time data.";
  }, [providerAvailable, isConnected, chainId]);

  useEffect(() => {
    if (isConnected && address && !hasShownConnectedToast.current) {
      toast.success(`Wallet connected: ${address.slice(0, 6)}…${address.slice(-4)}`);
      hasShownConnectedToast.current = true;
    }
    if (!isConnected) {
      hasShownConnectedToast.current = false;
    }
  }, [isConnected, address]);

	useEffect(() => {
		if (isConnected && chainId?.toLowerCase() === SOMNIA_CHAIN_ID_HEX.toLowerCase()) {
			navigate("/dashboard", { replace: true });
		}
	}, [isConnected, chainId, navigate]);

  const handleConnect = async () => {
    await connect();
  };

  const handleEnsureNetwork = async () => {
    const switched = await ensureNetwork();
    if (switched) {
      toast.success("Switched to Somnia Testnet.");
    }
  };

  const handleSubscribe = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet before subscribing to a stream.");
      return;
    }

    if (subscription) {
      subscription.unsubscribe();
      setSubscription(null);
    }

    setStreamOutput([]);

    const activeSubscription = await subscribe({
      somniaStreamsEventId: streamEventId.trim() || undefined,
      ethCalls: [],
      context: "data",
      onlyPushChanges,
      onData: (payload) => {
        setStreamOutput((prev) => [JSON.stringify(payload, null, 2), ...prev].slice(0, 10));
      },
      onError: (streamError) => {
        toast.error(streamError.message ?? "Stream subscription error.");
      },
    });

    if (activeSubscription) {
      setSubscription(activeSubscription);
      toast.success("Subscribed to Somnia Data Stream.");
    } else {
      toast.error("Unable to create Somnia stream subscription.");
    }
  };

  const handleDisconnect = () => {
    if (subscription) {
      subscription.unsubscribe();
      setSubscription(null);
    }
    disconnect();
    setStreamOutput([]);
    toast.info("Wallet disconnected.");
  };

  useEffect(() => {
    return () => {
      subscription?.unsubscribe();
    };
  }, [subscription]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Connect Your Wallet</h1>
            <p className="text-muted-foreground text-lg">
              Choose your preferred wallet provider to get started
            </p>
          </div>

          <Card className="p-6 border-border space-y-6 animate-slide-up">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{connectionDescription}</p>
                  {address && <p className="text-xs text-muted-foreground/80 break-all">Address: {address}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isConnected ? (
                    <Button onClick={handleConnect} disabled={!providerAvailable || isConnecting}>
                      {isConnecting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Connecting…
                        </>
                      ) : (
                        <>
                          <Cable className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={handleEnsureNetwork} className="flex items-center gap-2">
                        <Satellite className="h-4 w-4" />
                        Ensure Somnia Network
                      </Button>
                      <Button variant="ghost" onClick={handleDisconnect} className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Somnia Data Streams</h2>
              <p className="text-sm text-muted-foreground">
                Subscribe to real-time on-chain events through Somnia Data Streams (SDS). Provide a registered stream ID or leave blank to test a custom emitter.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr_auto]">
              <Input
                value={streamEventId}
                onChange={(event) => setStreamEventId(event.currentTarget.value)}
                placeholder="streams.event-id (optional)"
              />
              <Button
                type="button"
                variant={onlyPushChanges ? "default" : "outline"}
                onClick={() => setOnlyPushChanges((prev) => !prev)}
              >
                {onlyPushChanges ? "Push on changes" : "Push every event"}
              </Button>
              <Button type="button" onClick={handleSubscribe} disabled={!isConnected}>
                Subscribe
              </Button>
            </div>
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 h-48 overflow-auto text-sm font-mono">
              {streamOutput.length === 0 ? (
                <p className="text-muted-foreground">Stream updates will appear here once emitted.</p>
              ) : (
                <ul className="space-y-3">
                  {streamOutput.map((entry, index) => (
                    <li key={index} className="whitespace-pre-wrap break-words">
                      {entry}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-muted/50 border-border animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-sm text-muted-foreground text-center">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy. 
              Your wallet address will be used to track your gaming stats and achievements.
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Connect;
