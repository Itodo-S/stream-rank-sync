import { defineChain } from "viem";

// Environment variables
const SOMNIA_NETWORK = import.meta.env.VITE_SOMNIA_NETWORK ?? "testnet";
const SOMNIA_RPC_URL = import.meta.env.VITE_SOMNIA_RPC_URL;
const SOMNIA_EXPLORER_URL = import.meta.env.VITE_SOMNIA_EXPLORER_URL;
const SOMNIA_EXPLORER_NAME = import.meta.env.VITE_SOMNIA_EXPLORER_NAME ?? "Somnia Explorer";

// Testnet configuration
const SOMNIA_TESTNET_RPC_URL = import.meta.env.VITE_SOMNIA_TESTNET_RPC_URL ?? "https://dream-rpc.somnia.network";
const SOMNIA_TESTNET_WS_URL = import.meta.env.VITE_SOMNIA_TESTNET_WS_URL ?? "wss://dream-rpc.somnia.network/ws";
const SOMNIA_TESTNET_EXPLORER_URL = import.meta.env.VITE_SOMNIA_TESTNET_EXPLORER_URL ?? "https://somnia-testnet.socialscan.io";

// Mainnet configuration
const SOMNIA_MAINNET_RPC_URL = import.meta.env.VITE_SOMNIA_MAINNET_RPC_URL;
const SOMNIA_MAINNET_WS_URL = import.meta.env.VITE_SOMNIA_MAINNET_WS_URL;
const SOMNIA_MAINNET_EXPLORER_URL = import.meta.env.VITE_SOMNIA_MAINNET_EXPLORER_URL;

export const somniaTestnet = defineChain({
	id: 50312,
	name: "Somnia Testnet",
	network: "somnia-testnet",
	nativeCurrency: {
		name: "Somnia Testnet Token",
		symbol: "STT",
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
			name: "Somnia Explorer",
			url: SOMNIA_TESTNET_EXPLORER_URL,
		},
	},
});

export const somniaMainnet = defineChain({
	id: 50311,
	name: "Somnia Mainnet",
	network: "somnia-mainnet",
	nativeCurrency: {
		name: "Somnia Token",
		symbol: "SOM",
		decimals: 18,
	},
		rpcUrls: {
			default: {
				http: [SOMNIA_MAINNET_RPC_URL || "https://mainnet-rpc.somnia.network"],
				webSocket: [SOMNIA_MAINNET_WS_URL || "wss://mainnet-rpc.somnia.network/ws"],
			},
			public: {
				http: [SOMNIA_MAINNET_RPC_URL || "https://mainnet-rpc.somnia.network"],
				webSocket: [SOMNIA_MAINNET_WS_URL || "wss://mainnet-rpc.somnia.network/ws"],
			},
		},
	blockExplorers: {
		default: {
			name: "Somnia Explorer",
			url: SOMNIA_MAINNET_EXPLORER_URL || "https://somnia.socialscan.io",
		},
	},
});

// Determine which network to use
export const isMainnet = SOMNIA_NETWORK === "mainnet";
export const somniaChain = isMainnet ? somniaMainnet : somniaTestnet;
export const SOMNIA_CHAIN_ID_HEX = `0x${somniaChain.id.toString(16)}`;
export const SOMNIA_TESTNET_CHAIN_ID_HEX = `0x${somniaTestnet.id.toString(16)}`;
export const SOMNIA_MAINNET_CHAIN_ID_HEX = `0x${somniaMainnet.id.toString(16)}`;

// Legacy support - use the configured network
export const SOMNIA_RPC = SOMNIA_RPC_URL || (isMainnet ? SOMNIA_MAINNET_RPC_URL : SOMNIA_TESTNET_RPC_URL);
export const SOMNIA_WS = isMainnet ? SOMNIA_MAINNET_WS_URL : SOMNIA_TESTNET_WS_URL;
export const SOMNIA_EXPLORER = SOMNIA_EXPLORER_URL || (isMainnet ? SOMNIA_MAINNET_EXPLORER_URL : SOMNIA_TESTNET_EXPLORER_URL);


