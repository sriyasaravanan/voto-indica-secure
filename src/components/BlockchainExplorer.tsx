
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Activity, Shield, Database, Clock, Hash } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

export const BlockchainExplorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const { blocks, votes, stats, verifyVoteHash } = useBlockchain();
  const { getNetworkStats, verifyVoteOnChain } = useSolanaWallet();
  const [networkStats, setNetworkStats] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery) return;

    // Search for vote hash
    const vote = verifyVoteHash(searchQuery);
    if (vote) {
      // Try to verify on Solana if we have a signature
      let solanaVerification = null;
      if (vote.solana_signature) {
        solanaVerification = await verifyVoteOnChain(vote.solana_signature);
      }
      
      setSearchResult({
        type: 'vote',
        data: vote,
        solanaVerification
      });
      return;
    }

    // Search for block hash
    const block = blocks.find(b => b.block_hash === searchQuery);
    if (block) {
      setSearchResult({
        type: 'block',
        data: block
      });
      return;
    }

    setSearchResult({ type: 'not_found' });
  };

  const loadNetworkStats = async () => {
    const stats = await getNetworkStats();
    setNetworkStats(stats);
  };

  React.useEffect(() => {
    loadNetworkStats();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Blockchain Explorer</h2>
            <p className="text-navy-600">Explore votes, blocks, and transactions</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <Input
            placeholder="Search by vote hash or block hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="bg-purple-500 hover:bg-purple-600">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {searchResult && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            {searchResult.type === 'vote' && (
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Vote Found</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Hash:</span> {searchResult.data.vote_hash}</div>
                  <div><span className="font-medium">Block:</span> {searchResult.data.block_hash}</div>
                  <div><span className="font-medium">Timestamp:</span> {new Date(searchResult.data.timestamp).toLocaleString()}</div>
                  <div><span className="font-medium">Verified:</span> 
                    <Badge className={searchResult.data.is_verified ? "bg-green-500 ml-2" : "bg-red-500 ml-2"}>
                      {searchResult.data.is_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  {searchResult.solanaVerification && (
                    <div className="mt-2 p-2 bg-purple-50 rounded">
                      <span className="font-medium">Solana Verification:</span>
                      <Badge className={searchResult.solanaVerification.verified ? "bg-purple-500 ml-2" : "bg-gray-500 ml-2"}>
                        {searchResult.solanaVerification.verified ? "On-Chain Confirmed" : "Not Found"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
            {searchResult.type === 'block' && (
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Block Found</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Block #:</span> {searchResult.data.block_number}</div>
                  <div><span className="font-medium">Hash:</span> {searchResult.data.block_hash}</div>
                  <div><span className="font-medium">Votes:</span> {searchResult.data.votes_count}</div>
                  <div><span className="font-medium">Validator:</span> {searchResult.data.validator_node}</div>
                </div>
              </div>
            )}
            {searchResult.type === 'not_found' && (
              <div className="text-red-600">
                <h3 className="font-bold mb-2">Not Found</h3>
                <p>No vote or block found with that hash.</p>
              </div>
            )}
          </Card>
        )}
      </Card>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">Network Stats</TabsTrigger>
          <TabsTrigger value="blocks">Recent Blocks</TabsTrigger>
          <TabsTrigger value="votes">Recent Votes</TabsTrigger>
          <TabsTrigger value="solana">Solana Network</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card border-0 p-4 text-center">
                <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-navy-900">{stats.totalVotes}</div>
                <div className="text-sm text-navy-600">Total Votes</div>
              </Card>
              <Card className="glass-card border-0 p-4 text-center">
                <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-navy-900">{stats.totalBlocks}</div>
                <div className="text-sm text-navy-600">Total Blocks</div>
              </Card>
              <Card className="glass-card border-0 p-4 text-center">
                <Hash className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-navy-900">{(stats.networkHashRate / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-navy-600">Network Hash Rate</div>
              </Card>
              <Card className="glass-card border-0 p-4 text-center">
                <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-navy-900">{stats.averageBlockTime.toFixed(1)}s</div>
                <div className="text-sm text-navy-600">Avg Block Time</div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          {blocks.map((block) => (
            <Card key={block.id} className="glass-card border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-navy-900">Block #{block.block_number}</h3>
                  <p className="text-sm text-navy-600 font-mono">{block.block_hash.substring(0, 32)}...</p>
                  <p className="text-xs text-navy-500">{new Date(block.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <Badge className={block.is_validated ? "bg-green-500" : "bg-yellow-500"}>
                    {block.is_validated ? "Validated" : "Pending"}
                  </Badge>
                  <p className="text-sm text-navy-600 mt-1">{block.votes_count} votes</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="votes" className="space-y-4">
          {votes.slice(0, 10).map((vote) => (
            <Card key={vote.id} className="glass-card border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-navy-900">Vote Transaction</h3>
                  <p className="text-sm text-navy-600 font-mono">{vote.vote_hash.substring(0, 32)}...</p>
                  <p className="text-xs text-navy-500">{new Date(vote.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <Badge className={vote.is_verified ? "bg-green-500" : "bg-yellow-500"}>
                    <Shield className="h-3 w-3 mr-1" />
                    {vote.is_verified ? "Verified" : "Pending"}
                  </Badge>
                  {vote.solana_signature && (
                    <p className="text-xs text-purple-600 mt-1">Solana: {vote.solana_signature.substring(0, 8)}...</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="solana" className="space-y-4">
          <Card className="glass-card border-0 p-6">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Solana Network Status</h3>
            {networkStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-navy-600">Current Slot</p>
                  <p className="text-2xl font-bold text-purple-600">{networkStats.currentSlot?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-navy-600">Block Height</p>
                  <p className="text-2xl font-bold text-purple-600">{networkStats.blockHeight?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-navy-600">Current Epoch</p>
                  <p className="text-2xl font-bold text-purple-600">{networkStats.epoch}</p>
                </div>
                <div>
                  <p className="text-sm text-navy-600">Epoch Progress</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {networkStats.slotIndex && networkStats.slotsInEpoch ? 
                      ((networkStats.slotIndex / networkStats.slotsInEpoch) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-navy-600">Loading network stats...</p>
            )}
            <Button onClick={loadNetworkStats} className="mt-4 bg-purple-500 hover:bg-purple-600">
              Refresh Stats
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
