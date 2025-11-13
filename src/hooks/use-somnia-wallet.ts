import { useCallback, useEffect, useMemo, useState } from "react";
import "@/lib/polyfills";

import {
  Address,
  PublicClient,
  WalletClient,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  webSocket,
} from "viem";
import { SDK, SubscriptionInitParams } from "@somnia-chain/streams";

import { somniaChain, SOMNIA_CHAIN_ID_HEX, SOMNIA_TESTNET_CHAIN_ID_HEX } from "@/lib/somnia";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const SOMNIA_CHAIN_PARAMS = {
	chainId: SOMNIA_CHAIN_ID_HEX,
	chainName: somniaChain.name,
	nativeCurrency: somniaChain.nativeCurrency,
	rpcUrls: somniaChain.rpcUrls.default.http,
	blockExplorerUrls: somniaChain.blockExplorers?.default
		? [somniaChain.blockExplorers.default.url]
		: [],
};

const createHttpTransport = () => http(somniaChain.rpcUrls.default.http[0]);

const createWebSocketTransport = () => {
	const wsUrl = somniaChain.rpcUrls.default.webSocket?.[0]
	if (!wsUrl) {
		throw new Error('WebSocket URL not configured for Somnia chain')
	}
	return webSocket(wsUrl)
}

export type SomniaSubscription = {
  subscriptionId: string;
  unsubscribe: () => void;
};

export type UseSomniaWalletReturn = {
  address?: Address;
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  chainId?: string;
  providerAvailable: boolean;
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  sdk: SDK | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  ensureNetwork: () => Promise<boolean>;
  subscribe: (params: SubscriptionInitParams) => Promise<SomniaSubscription | undefined>;
};

export const useSomniaWallet = (): UseSomniaWalletReturn => {
  const [address, setAddress] = useState<Address>();
  const [chainId, setChainId] = useState<string>();
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [sdk, setSdk] = useState<SDK | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>();

  const provider = useMemo<EthereumProvider | undefined>(() => window.ethereum, []);
  const providerAvailable = Boolean(provider);

	useEffect(() => {
		try {
			// Create public client with both HTTP and WebSocket transports
			// WebSocket is required for data stream subscriptions
			const wsTransport = createWebSocketTransport()
			const httpTransport = createHttpTransport()
			
			const client = createPublicClient({
				chain: somniaChain,
				transport: wsTransport, // Use WebSocket for subscriptions
			});
			setPublicClient(client);
			console.log('Somnia public client created with WebSocket transport')
		} catch (clientError) {
			console.error("Failed to create Somnia public client", clientError);
			setError("Unable to initialise Somnia public client. WebSocket required for data streams.");
			setPublicClient(null);
		}
	}, []);

  useEffect(() => {
    if (!publicClient) {
      setSdk(null);
      return;
    }

    try {
      const instance = new SDK({
        public: publicClient,
        wallet: walletClient ?? undefined,
      });
      setSdk(instance);
    } catch (sdkError) {
      console.error("Failed to initialise Somnia SDK", sdkError);
      setError("Unable to initialise Somnia Data Streams SDK.");
      setSdk(null);
    }
  }, [publicClient, walletClient]);

  const disconnect = useCallback(() => {
    setAddress(undefined);
    setWalletClient(null);
    setIsConnected(false);
    setError(undefined);
  }, []);

  useEffect(() => {
    if (!provider) {
      return;
    }

    let isMounted = true;

    provider
      .request({ method: "eth_chainId" })
      .then((currentChainId: string) => {
        if (isMounted) {
          setChainId(currentChainId);
        }
      })
      .catch((chainError) => {
        console.warn("Unable to read current chain", chainError);
      });

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
        return;
      }

      setAddress(accounts[0] as Address);
      setIsConnected(true);
    };

		const handleChainChanged = (nextChainId: string) => {
			setChainId(nextChainId);
			if (nextChainId.toLowerCase() !== SOMNIA_CHAIN_ID_HEX.toLowerCase()) {
				setError(`Connected to an unsupported network. Please switch to ${somniaChain.name}.`);
			} else {
				setError(undefined);
			}
		};

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);
    provider.on?.("disconnect", handleDisconnect);

    return () => {
      isMounted = false;
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
      provider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [provider, disconnect]);

  const ensureNetwork = useCallback(async () => {
    if (!provider) {
      setError("No EVM wallet detected. Install MetaMask or a compatible wallet.");
      return false;
    }

		try {
			const currentChainId = await provider.request({ method: "eth_chainId" });
			if (currentChainId?.toLowerCase() === SOMNIA_CHAIN_ID_HEX.toLowerCase()) {
				return true;
			}

			try {
				await provider.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: SOMNIA_CHAIN_ID_HEX }],
				});
				setChainId(SOMNIA_CHAIN_ID_HEX);
				return true;
			} catch (switchError: any) {
				if (switchError?.code === 4902 || /Unrecognized chain ID/i.test(String(switchError?.message ?? ""))) {
					await provider.request({
						method: "wallet_addEthereumChain",
						params: [SOMNIA_CHAIN_PARAMS],
					});
					setChainId(SOMNIA_CHAIN_ID_HEX);
					return true;
				}

				throw switchError;
			}
		} catch (networkError) {
			console.error("Failed to ensure Somnia network", networkError);
			setError(`Could not switch to ${somniaChain.name}. Please check your wallet.`);
			return false;
		}
  }, [provider]);

  const connect = useCallback(async () => {
    if (!provider) {
      setError("No EVM wallet detected. Install MetaMask or another compatible wallet.");
      return;
    }

    setIsConnecting(true);
    setError(undefined);

    try {
      const networkReady = await ensureNetwork();
      if (!networkReady) {
        return;
      }

      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet.");
      }

			const wallet = createWalletClient({
				chain: somniaChain,
				transport: custom(provider),
			});

      setWalletClient(wallet);
      setAddress(accounts[0] as Address);
      setIsConnected(true);
    } catch (connectError: any) {
      console.error("Failed to connect wallet", connectError);
      if (connectError?.code === 4001) {
        setError("Connection request was rejected in the wallet.");
      } else {
        setError(connectError?.message ?? "Unable to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [provider, ensureNetwork]);

	const subscribe = useCallback(
		async (params: SubscriptionInitParams) => {
			if (!sdk) {
				const errorMsg = "Somnia Data Streams SDK is not ready.";
				console.error(errorMsg)
				setError(errorMsg);
				return undefined;
			}

			try {
				console.log('Creating subscription with params:', {
					somniaStreamsEventId: params.somniaStreamsEventId,
					context: params.context,
					onlyPushChanges: params.onlyPushChanges,
					ethCalls: params.ethCalls?.length || 0,
				})
				
				const subscription = await sdk.streams.subscribe(params);
				
				if (!subscription) {
					console.error('Subscription returned null/undefined')
					setError("Subscription returned null");
					return undefined;
				}
				
				console.log('Subscription created successfully:', subscription.subscriptionId)
				return subscription;
			} catch (subscribeError: any) {
				console.error("Failed to create Somnia data stream subscription", subscribeError);
				const errorMsg = subscribeError?.message || "Unable to subscribe to Somnia data stream.";
				setError(errorMsg);
				return undefined;
			}
		},
		[sdk],
	);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    chainId,
    providerAvailable,
    publicClient,
    walletClient,
    sdk,
    connect,
    disconnect,
    ensureNetwork,
    subscribe,
  };
};

