
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Shield, 
  Activity, 
  Users, 
  Zap,
  TrendingUp,
  Database,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdvancedBlockchainExplorer } from '@/components/AdvancedBlockchainExplorer';
import { AdvancedAnalyticsDashboard } from '@/components/AdvancedAnalyticsDashboard';
import { RealTimeNotifications } from '@/components/RealTimeNotifications';
import { MultiSignatureVoting } from '@/components/MultiSignatureVoting';
import { AdvancedSecurityPanel } from '@/components/AdvancedSecurityPanel';
import { SolanaWalletButton } from '@/components/SolanaWalletButton';

const AdvancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-saffron-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5 text-navy-600" />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indian-gradient rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-bold text-navy-900">Advanced Dashboard</span>
                </div>
              </Link>
              <Badge variant="outline" className="border-purple-500 text-purple-700">
                <Zap className="h-3 w-3 mr-1" />
                Enterprise Features
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <RealTimeNotifications />
              <div className="w-64">
                <SolanaWalletButton showBalance={true} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Nodes</p>
                <p className="text-2xl font-bold text-blue-900">1,247</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5.2% from yesterday</span>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Transactions</p>
                <p className="text-2xl font-bold text-green-900">892,341</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.8% this week</span>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Security Score</p>
                <p className="text-2xl font-bold text-purple-900">98.5%</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-purple-600">Excellent security rating</span>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Users</p>
                <p className="text-2xl font-bold text-orange-900">45,129</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8.4% growth</span>
            </div>
          </Card>
        </div>

        {/* Advanced Features Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="multisig" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Multi-Sig
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            <AdvancedBlockchainExplorer />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <AdvancedSecurityPanel />
          </TabsContent>

          <TabsContent value="multisig" className="space-y-6">
            <MultiSignatureVoting />
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Network Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">99.99%</p>
                  <p className="text-sm text-gray-600">Network Uptime</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">2.1ms</p>
                  <p className="text-sm text-gray-600">Average Latency</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">1,247</p>
                  <p className="text-sm text-gray-600">Active Validators</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
