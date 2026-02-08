import { createConfig, http } from "wagmi"
import { sepolia } from "wagmi/chains"
import { metaMask, walletConnect, mock } from "@wagmi/connectors"

/**
 * Wagmi configuration for Sepolia testnet
 * Uses MetaMask, WalletConnect, and Mock connectors
 */
export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
    }),
    // Mock Connector for testing without a real wallet
    mock({
      accounts: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      features: {
        reconnect: true,
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
})
