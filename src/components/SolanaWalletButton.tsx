
import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink } from 'lucide-react';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

interface SolanaWalletButtonProps {
  onWalletConnected?: (publicKey: string) => void;
  showBalance?: boolean;
}

export const SolanaWalletButton: React.FC<SolanaWalletButtonProps> = ({
  onWalletConnected,
  showBalance = false
}) => {
  const { publicKey, connected, getBalance } = useSolanaWallet();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (connected && publicKey) {
      onWalletConnected?.(publicKey.toString());
      
      if (showBalance) {
        getBalance().then(setBalance);
      }
    }
  }, [connected, publicKey, onWalletConnected, showBalance, getBalance]);

  if (connected && publicKey) {
    return (
      <Card className="glass-card border-0 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-900">Solana Wallet Connected</p>
              <p className="text-xs text-navy-600 font-mono">
                {publicKey.toString().substring(0, 8)}...{publicKey.toString().substring(-8)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showBalance && (
              <Badge variant="outline" className="border-purple-500 text-purple-700">
                {balance.toFixed(4)} SOL
              </Badge>
            )}
            <Badge className="bg-green-500">
              Connected
            </Badge>
          </div>
        </div>
        <div className="mt-3">
          <WalletMultiButton className="!bg-purple-500 hover:!bg-purple-600 !text-white !text-sm !py-2 !px-4 !rounded-md !transition-colors" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 p-6 text-center">
      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wallet className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-navy-900 mb-2">Connect Solana Wallet</h3>
      <p className="text-navy-600 text-sm mb-4">
        Connect your Solana wallet to vote on the blockchain
      </p>
      <WalletMultiButton className="!bg-purple-500 hover:!bg-purple-600 !text-white !py-2 !px-6 !rounded-md !transition-colors !mx-auto" />
      <div className="mt-4 flex items-center justify-center text-xs text-navy-500">
        <ExternalLink className="h-3 w-3 mr-1" />
        Supports Phantom, Solflare, and more
      </div>
    </Card>
  );
};
