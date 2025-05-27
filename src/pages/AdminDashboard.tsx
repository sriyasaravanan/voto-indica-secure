
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Vote, Users, Eye, BarChart3, Settings, LogOut, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [newElection, setNewElection] = useState({
    title: "",
    type: "National",
    constituency: "",
    startDate: "",
    endDate: ""
  });
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const { toast } = useToast();

  const blockchainStats = [
    { label: "Total Blocks", value: "8,456,789", change: "+2,543" },
    { label: "Active Nodes", value: "1,247", change: "+12" },
    { label: "Validation Time", value: "2.3s", change: "-0.5s" },
    { label: "Network Hash Rate", value: "127 TH/s", change: "+5.2 TH/s" }
  ];

  const elections = [
    {
      id: "lok-sabha-2024",
      title: "Lok Sabha Elections 2024",
      type: "National",
      status: "Active",
      totalVoters: 1850000,
      votedCount: 982000,
      nodes: 45,
      integrity: 100
    },
    {
      id: "state-assembly-2024", 
      title: "Maharashtra Assembly Elections",
      type: "State",
      status: "Upcoming",
      totalVoters: 245000,
      votedCount: 0,
      nodes: 12,
      integrity: 100
    },
    {
      id: "municipal-2024",
      title: "Mumbai Municipal Corporation",
      type: "Local", 
      status: "Active",
      totalVoters: 85000,
      votedCount: 45000,
      nodes: 8,
      integrity: 100
    }
  ];

  const candidates = [
    { name: "Rajesh Kumar", party: "Indian National Congress", votes: 245678, percentage: 25.0 },
    { name: "Priya Sharma", party: "Bharatiya Janata Party", votes: 312456, percentage: 31.8 },
    { name: "Mohammed Ali", party: "Aam Aadmi Party", votes: 189234, percentage: 19.3 },
    { name: "Sunita Devi", party: "Independent", votes: 234632, percentage: 23.9 }
  ];

  const handleCreateElection = () => {
    if (!newElection.title || !newElection.constituency || !newElection.startDate || !newElection.endDate) {
      toast({
        title: "Error",
        description: "Please fill all fields to create an election",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Election Created",
      description: `${newElection.title} has been successfully created and deployed to blockchain`,
    });

    setNewElection({ title: "", type: "National", constituency: "", startDate: "", endDate: "" });
  };

  const declareWinner = () => {
    const winner = candidates.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
    setSelectedWinner(winner.name);
    
    toast({
      title: "Winner Declared",
      description: `${winner.name} has been officially declared the winner with ${winner.percentage}% votes`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Upcoming": return "bg-blue-500";
      case "Completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-saffron-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-indian-gradient rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">Admin Control Center</h1>
                <p className="text-sm text-navy-600">ID: ADM-2024-X9K7</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
              <Link to="/">
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Blockchain Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {blockchainStats.map((stat, index) => (
            <Card key={index} className="glass-card border-0 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-navy-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                </div>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  {stat.change}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center">
                  <Vote className="mr-2 h-5 w-5" />
                  Election Status
                </h3>
                <div className="space-y-4">
                  {elections.map((election) => (
                    <div key={election.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-navy-900">{election.title}</h4>
                        <p className="text-sm text-navy-600">{election.type} • {election.totalVoters.toLocaleString()} voters</p>
                      </div>
                      <Badge className={getStatusColor(election.status)}>
                        {election.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Real-time Analytics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Total Turnout</span>
                      <span>53.1%</span>
                    </div>
                    <Progress value={53.1} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Blockchain Sync</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Node Consensus</span>
                      <span>98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="glass-card border-0 p-6">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Create New Election</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Election Title</Label>
                  <Input
                    id="title"
                    placeholder="Election name"
                    value={newElection.title}
                    onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newElection.type}
                    onChange={(e) => setNewElection({...newElection, type: e.target.value})}
                  >
                    <option value="National">National</option>
                    <option value="State">State</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="constituency">Constituency</Label>
                  <Input
                    id="constituency"
                    placeholder="Area/Region"
                    value={newElection.constituency}
                    onChange={(e) => setNewElection({...newElection, constituency: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreateElection} className="w-full bg-saffron-500 hover:bg-saffron-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Elections Management Tab */}
          <TabsContent value="elections" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">Election Management</h2>
              <Badge className="bg-saffron-500">
                {elections.filter(e => e.status === "Active").length} Active Elections
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {elections.map((election) => (
                <Card key={election.id} className="glass-card border-0 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getStatusColor(election.status)}>
                      {election.status}
                    </Badge>
                    <span className="text-sm text-navy-600">{election.type}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{election.title}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Total Voters</span>
                      <span className="font-medium">{election.totalVoters.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Votes Cast</span>
                      <span className="font-medium">{election.votedCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Validator Nodes</span>
                      <span className="font-medium">{election.nodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-navy-600">Data Integrity</span>
                      <span className="font-medium text-green-600">{election.integrity}%</span>
                    </div>
                  </div>

                  {election.status === "Active" && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Turnout</span>
                        <span>{Math.round((election.votedCount / election.totalVoters) * 100)}%</span>
                      </div>
                      <Progress value={(election.votedCount / election.totalVoters) * 100} className="h-2" />
                    </div>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain" className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-900">Blockchain Network Status</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Network Nodes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Government Nodes</h4>
                      <p className="text-sm text-navy-600">Primary validation nodes</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">45</span>
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Observer Nodes</h4>
                      <p className="text-sm text-navy-600">NGOs & Media outlets</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">23</span>
                      <div className="flex items-center text-sm text-blue-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Backup Nodes</h4>
                      <p className="text-sm text-navy-600">Redundancy & failover</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-600">12</span>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Standby
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Smart Contract Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Vote Validation</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Identity Verification</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Vote Counting</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Result Declaration</span>
                    <Badge className="bg-blue-500">Ready</Badge>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="glass-card border-0 p-6">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Blockchain Activity</h3>
              <div className="space-y-3">
                {[
                  { action: "Vote cast", hash: "0x7af4...2b9c", time: "2 minutes ago", status: "Confirmed" },
                  { action: "Identity verified", hash: "0x9d5e...4f8a", time: "3 minutes ago", status: "Confirmed" },
                  { action: "Smart contract executed", hash: "0x1c2b...7e9d", time: "5 minutes ago", status: "Confirmed" },
                  { action: "Block mined", hash: "0x8f6a...3d1c", time: "8 minutes ago", status: "Confirmed" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{activity.action}</h4>
                      <p className="text-sm text-navy-600 font-mono">{activity.hash}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500 mb-1">{activity.status}</Badge>
                      <p className="text-sm text-navy-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">Election Results & Winner Declaration</h2>
              <Button 
                onClick={declareWinner}
                className="bg-green-600 hover:bg-green-700"
                disabled={!!selectedWinner}
              >
                {selectedWinner ? "Winner Declared" : "Declare Winner"}
              </Button>
            </div>

            <Card className="glass-card border-0 p-8">
              <h3 className="text-xl font-bold text-navy-900 mb-6">Lok Sabha Elections 2024 - Mumbai North</h3>
              
              {selectedWinner && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-green-800 mb-2">Winner Declared</h4>
                  <p className="text-green-700">{selectedWinner} has been officially declared the winner</p>
                  <p className="text-sm text-green-600 mt-2">Result published on blockchain with immutable proof</p>
                </div>
              )}
              
              <div className="space-y-4">
                {candidates
                  .sort((a, b) => b.votes - a.votes)
                  .map((candidate, index) => (
                  <div key={index} className={`flex items-center justify-between p-6 rounded-lg ${
                    index === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-white/50'
                  }`}>
                    <div className="flex items-center space-x-4">
                      {index === 0 && <CheckCircle className="h-6 w-6 text-green-600" />}
                      <div>
                        <h4 className="font-semibold text-navy-900 text-lg">{candidate.name}</h4>
                        <p className="text-navy-600">{candidate.party}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-navy-900">{candidate.votes.toLocaleString()}</div>
                      <div className="text-lg text-navy-600">{candidate.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">982,000</div>
                  <div className="text-blue-800">Total Votes</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">53.1%</div>
                  <div className="text-green-800">Turnout</div>
                </div>
                <div className="p-4 bg-saffron-50 rounded-lg">
                  <div className="text-2xl font-bold text-saffron-600">100%</div>
                  <div className="text-saffron-800">Verified</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-900">Security & Audit Trail</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Security Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <span>Encryption Status</span>
                    </div>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span>Multi-Factor Auth</span>
                    </div>
                    <Badge className="bg-green-500">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-green-600 mr-2" />
                      <span>Audit Logging</span>
                    </div>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span>Threat Detection</span>
                    </div>
                    <Badge className="bg-yellow-500">Monitoring</Badge>
                  </div>
                </div>
              </Card>

              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Fraud Prevention</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Double Voting Attempts</span>
                      <span className="text-green-600 font-bold">0</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Identity Verification Rate</span>
                      <span className="text-green-600 font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Blockchain Integrity</span>
                      <span className="text-green-600 font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="glass-card border-0 p-6">
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Security Events</h3>
              <div className="space-y-3">
                {[
                  { event: "Successful identity verification", user: "VTR-2024-A7X9", time: "1 minute ago", level: "Info" },
                  { event: "Vote cast and encrypted", user: "VTR-2024-B3M2", time: "3 minutes ago", level: "Info" },
                  { event: "Failed login attempt detected", user: "Unknown", time: "15 minutes ago", level: "Warning" },
                  { event: "System backup completed", user: "System", time: "2 hours ago", level: "Info" }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.event}</h4>
                      <p className="text-sm text-navy-600">User: {event.user}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={event.level === 'Warning' ? 'bg-yellow-500' : 'bg-blue-500'}>
                        {event.level}
                      </Badge>
                      <p className="text-sm text-navy-600 mt-1">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
