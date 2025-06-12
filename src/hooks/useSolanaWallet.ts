import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useSolanaWallet = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, disconnect, connect, connecting } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getBalance = async () => {
    if (!publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      toast({
        title: "Network Error",
        description: "Unable to fetch balance. Please check your connection.",
        variant: "destructive"
      });
      return 0;
    }
  };

  const testConnection = async () => {
    try {
      const version = await connection.getVersion();
      console.log('Solana RPC connection successful:', version);
      return true;
    } catch (error) {
      console.error('Solana RPC connection failed:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to Solana network. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const createVoteDataAccount = async (voteData: any) => {
    if (!publicKey || !connected) return null;

    try {
      // Create a unique vote account for this vote
      const voteAccount = new PublicKey(
        // Generate deterministic address based on vote data
        await connection.getRecentBlockhash().then(blockhash => 
          PublicKey.createWithSeed(
            publicKey,
            `vote_${voteData.election_id.substring(0, 8)}_${Date.now()}`,
            SystemProgram.programId
          )
        )
      );

      return voteAccount;
    } catch (error) {
      console.error('Error creating vote account:', error);
      return null;
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

    // Test connection first
    const connectionWorking = await testConnection();
    if (!connectionWorking) {
      return null;
    }

    setLoading(true);
    try {
      const parsedVoteData = JSON.parse(voteData);
      
      // Create multiple instructions for a more comprehensive vote record
      const instructions = [];

      // 1. Main vote instruction with memo
      const voteInstruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true }
        ],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), // Memo program
        data: Buffer.from(JSON.stringify({
          type: 'VOTE',
          timestamp: new Date().toISOString(),
          election_id: parsedVoteData.election_id,
          candidate_id: parsedVoteData.candidate_id,
          vote_hash: parsedVoteData.vote_hash,
          voter_signature: `${publicKey.toString()}_${Date.now()}`
        }))
      });
      instructions.push(voteInstruction);

      // 2. Create a small transfer to establish vote on-chain
      const voteTransfer = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey('11111111111111111111111111111112'), // System program
        lamports: 1000, // 0.000001 SOL as vote fee
      });
      instructions.push(voteTransfer);

      // 3. Add election metadata instruction
      const electionMetadata = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: false }
        ],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: Buffer.from(`ELECTION_META:${parsedVoteData.election_id}:${Date.now()}`)
      });
      instructions.push(electionMetadata);

      // Create and send transaction
      const transaction = new Transaction().add(...instructions);
      
      // Get recent blockhash for transaction
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "Vote recorded on Solana blockchain",
        description: `Transaction confirmed: ${signature.substring(0, 20)}...`,
      });

      return {
        signature,
        blockhash,
        slot: await connection.getSlot(),
        confirmations: 1
      };
    } catch (error) {
      console.error('Blockchain transaction failed:', error);
      toast({
        title: "Blockchain transaction failed",
        description: "Failed to record vote on Solana blockchain. Please check your wallet and try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyVoteOnChain = async (signature: string) => {
    try {
      const transaction = await connection.getTransaction(signature, {
        commitment: 'confirmed'
      });
      
      if (transaction) {
        return {
          verified: true,
          slot: transaction.slot,
          blockTime: transaction.blockTime,
          fee: transaction.meta?.fee,
          confirmations: await connection.getSlot() - transaction.slot
        };
      }
      return { verified: false };
    } catch (error) {
      console.error('Error verifying vote on chain:', error);
      return { verified: false };
    }
  };

  const getNetworkStats = async () => {
    try {
      const slot = await connection.getSlot();
      const blockHeight = await connection.getBlockHeight();
      const epochInfo = await connection.getEpochInfo();
      
      return {
        currentSlot: slot,
        blockHeight,
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      return null;
    }
  };

  return {
    publicKey,
    connected,
    connecting,
    loading,
    connect,
    disconnect,
    getBalance,
    sendVoteTransaction,
    verifyVoteOnChain,
    getNetworkStats,
    createVoteDataAccount,
    testConnection
  };
};
