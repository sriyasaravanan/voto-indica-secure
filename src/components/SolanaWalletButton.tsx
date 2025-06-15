
import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ExternalLink, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

interface SolanaWalletButtonProps {
  onWalletConnected?: (publicKey: string) => void;
  showBalance?: boolean;
}

export const SolanaWalletButton: React.FC<SolanaWalletButtonProps> = ({
  onWalletConnected,
  showBalance = false
}) => {
  const { publicKey, connected, connecting, getBalance, testConnection } = useSolanaWallet();
  const [balance, setBalance] = useState<number>(0);
  const [connectionTested, setConnectionTested] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(false);

  useEffect(() => {
    // Test connection on mount
    if (!connectionTested) {
      testConnection().then(() => setConnectionTested(true));
    }
  }, [testConnection, connectionTested]);

  useEffect(() => {
    if (connected && publicKey) {
      onWalletConnected?.(publicKey.toString());
      
      if (showBalance) {
        fetchBalance();
      }
    }
  }, [connected, publicKey, onWalletConnected, showBalance]);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    setBalanceError(false);
    try {
      const newBalance = await getBalance();
      setBalance(newBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalanceError(true);
    } finally {
      setBalanceLoading(false);
    }
  };

  if (connecting) {
    return (
      <Card className="glass-card border-0 p-6 text-center">
        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">Connecting Wallet...</h3>
        <p className="text-navy-600 text-sm mb-4">
          Please approve the connection in your wallet
        </p>
      </Card>
    );
  }

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
                {publicKey.toString().substring(0, 8)}...{publicKey.toString().slice(-8)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showBalance && (
              <div className="flex items-center space-x-2">
                {balanceLoading ? (
                  <Badge variant="outline" className="border-gray-400">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading...
                  </Badge>
                ) : balanceError ? (
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="border-red-500 text-red-700">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchBalance}
                      className="h-6 px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className="border-purple-500 text-purple-700">
                    {balance.toFixed(4)} SOL
                  </Badge>
                )}
              </div>
            )}
            <Badge className="bg-green-500 hover:bg-green-500">
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
      {!connectionTested && (
        <div className="mt-2 text-xs text-amber-600">
          Testing network connection...
        </div>
      )}
    </Card>
  );
};
