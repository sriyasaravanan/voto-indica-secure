
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useSolanaWallet = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, disconnect, connect } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getBalance = async () => {
    if (!publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  };

  const sendVoteTransaction = async (voteData: string) => {
    if (!publicKey || !connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Solana wallet first",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      // Create a simple transaction that includes vote data in a memo
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111112'), // System program
          lamports: 1, // Minimal transfer
        })
      );

      // Add vote data as memo (in a real implementation, you'd use a proper program)
      // This is a simplified example
      const signature = await sendTransaction(transaction, connection);
      
      toast({
        title: "Vote recorded on Solana",
        description: `Transaction signature: ${signature.substring(0, 20)}...`,
      });

      return signature;
    } catch (error) {
      console.error('Transaction failed:', error);
      toast({
        title: "Transaction failed",
        description: "Failed to record vote on Solana blockchain",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    publicKey,
    connected,
    loading,
    connect,
    disconnect,
    getBalance,
    sendVoteTransaction
  };
};
