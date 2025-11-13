import { createContext, useContext, type ReactNode } from "react";

import { useSomniaWallet, type UseSomniaWalletReturn } from "@/hooks/use-somnia-wallet";

const SomniaWalletContext = createContext<UseSomniaWalletReturn | null>(null);

export const SomniaWalletProvider = ({ children }: { children: ReactNode }) => {
  const wallet = useSomniaWallet();
  return <SomniaWalletContext.Provider value={wallet}>{children}</SomniaWalletContext.Provider>;
};

export const useSomniaWalletContext = () => {
  const context = useContext(SomniaWalletContext);
  if (!context) {
    throw new Error("useSomniaWalletContext must be used within a SomniaWalletProvider");
  }
  return context;
};


