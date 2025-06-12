
import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // Use devnet for development
  const network = WalletAdapterNetwork.Devnet;
  
  // Use multiple RPC endpoints for better reliability
  const endpoint = useMemo(() => {
    // Priority order of RPC endpoints for better reliability
    const rpcEndpoints = [
      'https://api.devnet.solana.com',
      'https://devnet.helius-rpc.com/?api-key=demo',
      'https://rpc.ankr.com/solana_devnet',
      'https://solana-devnet.g.alchemy.com/v2/demo',
      clusterApiUrl(network), // Fallback to default
    ];
    
    // Return the first endpoint for now, fallbacks are handled in the hook
    return rpcEndpoints[0];
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
        preflightCommitment: 'confirmed',
      }}
    >
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={(error) => {
          console.error('Wallet connection error:', error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
