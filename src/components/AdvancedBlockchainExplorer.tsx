
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Shield, 
  Zap, 
  Clock, 
  Database, 
  Network,
  Eye,
  CheckCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

export const AdvancedBlockchainExplorer: React.FC = () => {
  const { blocks, votes, stats, loading } = useBlockchain();
  const { getNetworkStats, connected } = useSolanaWallet();
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    consensus: 98,
    network: 95,
    storage: 92,
    security: 99
  });

  useEffect(() => {
    const fetchNetworkStats = async () => {
      if (connected) {
        const stats = await getNetworkStats();
        setNetworkStats(stats);
      }
    };

    fetchNetworkStats();
    
    // Simulate real-time data updates
    const interval = setInterval(() => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        transactions: Math.floor(Math.random() * 100) + 50,
        blockTime: Math.random() * 2 + 1,
        networkLoad: Math.floor(Math.random() * 100),
        gasPrice: Math.random() * 50 + 20
      };
      
      setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
      
      // Update system health
      setSystemHealth(prev => ({
        consensus: Math.max(90, prev.consensus + (Math.random() - 0.5) * 2),
        network: Math.max(85, prev.network + (Math.random() - 0.5) * 3),
        storage: Math.max(80, prev.storage + (Math.random() - 0.5) * 2),
        security: Math.max(95, prev.security + (Math.random() - 0.5) * 1)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [connected, getNetworkStats]);

  const getHealthColor = (value: number) => {
    if (value >= 95) return 'text-green-600';
    if (value >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadgeVariant = (value: number): "default" | "secondary" | "destructive" | "outline" => {
    if (value >= 95) return 'default';
    if (value >= 85) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className={`h-5 w-5 ${getHealthColor(systemHealth.security)}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Security</p>
              <p className={`text-lg font-bold ${getHealthColor(systemHealth.security)}`}>
                {systemHealth.security.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Network className={`h-5 w-5 ${getHealthColor(systemHealth.network)}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Network</p>
              <p className={`text-lg font-bold ${getHealthColor(systemHealth.network)}`}>
                {systemHealth.network.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Cpu className={`h-5 w-5 ${getHealthColor(systemHealth.consensus)}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Consensus</p>
              <p className={`text-lg font-bold ${getHealthColor(systemHealth.consensus)}`}>
                {systemHealth.consensus.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <HardDrive className={`h-5 w-5 ${getHealthColor(systemHealth.storage)}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Storage</p>
              <p className={`text-lg font-bold ${getHealthColor(systemHealth.storage)}`}>
                {systemHealth.storage.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Real-time Network Activity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h4 className="font-semibold mb-3">Block Time Trend</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realTimeData}>
                    <Line type="monotone" dataKey="blockTime" stroke="#82ca9d" strokeWidth={2} />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-3">Network Load</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realTimeData.slice(-10)}>
                    <Bar dataKey="networkLoad" fill="#ffc658" />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Recent Blocks
            </h3>
            <div className="space-y-3">
              {blocks.slice(0, 10).map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={block.is_validated ? 'default' : 'secondary'}>
                      #{block.block_number}
                    </Badge>
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        {block.block_hash.substring(0, 16)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {block.votes_count} votes • {new Date(block.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {block.is_validated ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="votes" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Vote Verification Status
            </h3>
            <div className="space-y-3">
              {votes.slice(0, 10).map((vote) => (
                <div key={vote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={vote.is_verified ? 'default' : 'secondary'}>
                      {vote.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        {vote.vote_hash.substring(0, 16)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(vote.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {vote.is_verified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    {vote.solana_signature && (
                      <Badge variant="outline" className="text-xs">
                        Solana: {vote.solana_slot}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Solana Network Stats
              </h4>
              {networkStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Slot:</span>
                    <span className="font-mono">{networkStats.currentSlot?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Block Height:</span>
                    <span className="font-mono">{networkStats.blockHeight?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Epoch:</span>
                    <span className="font-mono">{networkStats.epoch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Epoch Progress:</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(networkStats.slotIndex / networkStats.slotsInEpoch) * 100} 
                        className="w-20" 
                      />
                      <span className="text-xs text-gray-500">
                        {((networkStats.slotIndex / networkStats.slotsInEpoch) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Connect wallet to view network stats</p>
              )}
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                System Health
              </h4>
              <div className="space-y-4">
                {Object.entries(systemHealth).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{key}:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={value} className="w-20" />
                      <Badge variant={getHealthBadgeVariant(value)} className="text-xs">
                        {value.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
