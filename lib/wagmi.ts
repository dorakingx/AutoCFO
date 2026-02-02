import { createConfig, http } from "wagmi"
import { sepolia } from "wagmi/chains"
import { metaMask, walletConnect } from "@wagmi/connectors"

/**
 * Wagmi configuration for Sepolia testnet
 * Uses MetaMask and WalletConnect connectors
 */
export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
})
