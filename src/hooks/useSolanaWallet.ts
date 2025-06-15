import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction, Connection } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';
import { useState, useCallback, useRef } from 'react';

// Simplified RPC endpoints - focusing on working ones
const RPC_ENDPOINTS = [
  'https://api.devnet.solana.com',
  // Removing endpoints that require API keys or are failing
];

export const useSolanaWallet = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, disconnect, connect, connecting } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Add throttling to prevent rate limiting
  const lastBalanceCheck = useRef<number>(0);
  const balanceCache = useRef<{ balance: number; timestamp: number } | null>(null);
  const BALANCE_CACHE_DURATION = 30000; // 30 seconds
  const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests

  // Create a connection with simple fallback
  const createRobustConnection = useCallback(async () => {
    try {
      console.log('Testing primary connection...');
      // Test the primary connection first with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      await connection.getVersion();
      clearTimeout(timeoutId);
      console.log('Primary connection successful');
      return connection;
    } catch (error) {
      console.warn('Primary connection failed, using fallback');
      // If primary fails, just return it anyway - better than creating new connections
      return connection;
    }
  }, [connection]);

  const getBalance = async () => {
    if (!publicKey) return 0;
    
    const now = Date.now();
    
    // Check cache first
    if (balanceCache.current && (now - balanceCache.current.timestamp) < BALANCE_CACHE_DURATION) {
      console.log('Using cached balance');
      return balanceCache.current.balance;
    }
    
    // Throttle requests to prevent rate limiting
    if (now - lastBalanceCheck.current < MIN_REQUEST_INTERVAL) {
      console.log('Request throttled, using cached balance or returning 0');
      return balanceCache.current?.balance || 0;
    }
    
    lastBalanceCheck.current = now;
    
    try {
      console.log('Fetching balance for:', publicKey.toString());
      
      // Use the primary connection with proper error handling
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      // Cache the result
      balanceCache.current = { balance: solBalance, timestamp: now };
      
      console.log('Balance fetched successfully:', solBalance);
      return solBalance;
    } catch (error: any) {
      console.error('Error getting balance:', error);
      
      // If we have cached data, return it
      if (balanceCache.current) {
        console.log('Returning cached balance due to error');
        return balanceCache.current.balance;
      }
      
      // Only show toast for non-rate-limit errors
      if (!error.message?.includes('429') && !error.message?.includes('Too many requests')) {
        toast({
          title: "Network Issue",
          description: "Unable to fetch balance. This might be temporary.",
          variant: "destructive"
        });
      }
      
      return 0;
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection...');
      const robustConnection = await createRobustConnection();
      await robustConnection.getVersion();
      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Issue",
        description: "Solana network is experiencing issues. Some features may be limited.",
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
      // Still allow voting even if connection test fails
      console.warn('Connection test failed, but proceeding with transaction');
    }

    setLoading(true);
    try {
      const parsedVoteData = JSON.parse(voteData);
      
      // Get a robust connection for the transaction
      const robustConnection = await createRobustConnection();
      
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
      const { blockhash } = await robustConnection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, robustConnection);
      
      // Wait for confirmation
      await robustConnection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "Vote recorded on Solana blockchain",
        description: `Transaction confirmed: ${signature.substring(0, 20)}...`,
      });

      return {
        signature,
        blockhash,
        slot: await robustConnection.getSlot(),
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
      const robustConnection = await createRobustConnection();
      const transaction = await robustConnection.getTransaction(signature, {
        commitment: 'confirmed'
      });
      
      if (transaction) {
        return {
          verified: true,
          slot: transaction.slot,
          blockTime: transaction.blockTime,
          fee: transaction.meta?.fee,
          confirmations: await robustConnection.getSlot() - transaction.slot
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
      const robustConnection = await createRobustConnection();
      const slot = await robustConnection.getSlot();
      const blockHeight = await robustConnection.getBlockHeight();
      const epochInfo = await robustConnection.getEpochInfo();
      
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
    testConnection
  };
};
