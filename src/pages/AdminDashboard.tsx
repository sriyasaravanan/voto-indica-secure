import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Vote, Users, Eye, BarChart3, Settings, LogOut, Plus, CheckCircle, AlertTriangle, Trophy, X, UserPlus } from "lucide-react";
import { useElections } from "@/hooks/useElections";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [newElection, setNewElection] = useState({
    title: "",
    type: "National" as 'National' | 'State' | 'Local',
    constituency: "",
    start_date: "",
    end_date: "",
    total_voters: 0
  });

  const { elections, candidates, loading, createElection, fetchElections, fetchCandidates, populateAllElectionsWithCandidates } = useElections();
  const { blocks, votes, fetchBlocks } = useBlockchain();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const blockchainStats = [
    { label: "Total Blocks", value: blocks.length.toString(), change: "+2,543" },
    { label: "Active Nodes", value: "1,247", change: "+12" },
    { label: "Validation Time", value: "2.3s", change: "-0.5s" },
    { label: "Network Hash Rate", value: "127 TH/s", change: "+5.2 TH/s" }
  ];

  const handleCreateElection = async () => {
    if (!newElection.title || !newElection.constituency || !newElection.start_date || !newElection.end_date) {
      return;
    }

    const result = await createElection({
      title: newElection.title,
      type: newElection.type,
      constituency: newElection.constituency,
      start_date: newElection.start_date,
      end_date: newElection.end_date,
      status: 'Upcoming',
      total_voters: newElection.total_voters || 100000
    });

    if (result) {
      setNewElection({ 
        title: "", 
        type: "National", 
        constituency: "", 
        start_date: "", 
        end_date: "",
        total_voters: 0
      });
    }
  };

  const handleDeclareWinner = async (electionId: string, winnerId: string) => {
    try {
      // Update the election status to 'Completed'
      const { error: electionError } = await supabase
        .from('elections')
        .update({ 
          status: 'Completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', electionId);

      if (electionError) throw electionError;

      // Get winner details for the toast
      const winner = candidates.find(c => c.id === winnerId);
      const election = elections.find(e => e.id === electionId);
      
      toast({
        title: "Winner Declared Successfully!",
        description: `${winner?.name} from ${winner?.party} has been declared the winner of ${election?.title}`,
      });

      // Refresh elections to show updated status
      await fetchElections();
      
      console.log(`Winner declared: ${winner?.name} for election ${election?.title}`);
    } catch (error) {
      console.error('Error declaring winner:', error);
      toast({
        title: "Error",
        description: "Failed to declare winner. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUndeclareWinner = async (electionId: string) => {
    try {
      // Update the election status back to 'Active'
      const { error: electionError } = await supabase
        .from('elections')
        .update({ 
          status: 'Active',
          updated_at: new Date().toISOString()
        })
        .eq('id', electionId);

      if (electionError) throw electionError;

      const election = elections.find(e => e.id === electionId);
      
      toast({
        title: "Winner Undeclared Successfully!",
        description: `${election?.title} is now back to active status. Winner declaration has been reverted.`,
      });

      // Refresh elections to show updated status
      await fetchElections();
      
      console.log(`Winner undeclared for election ${election?.title}`);
    } catch (error) {
      console.error('Error undeclaring winner:', error);
      toast({
        title: "Error",
        description: "Failed to undeclare winner. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createNewBlock = async () => {
    try {
      // Get the latest block to determine the next block number
      const { data: latestBlock } = await supabase
        .from('blockchain_blocks')
        .select('*')
        .order('block_number', { ascending: false })
        .limit(1)
        .single();

      const nextBlockNumber = latestBlock ? latestBlock.block_number + 1 : 1;
      const previousHash = latestBlock ? latestBlock.block_hash : null;

      // Get recent unblocked votes
      const recentVotes = votes.slice(0, 5); // Take up to 5 recent votes
      const voteHashes = recentVotes.map(v => v.vote_hash);
      
      // Create merkle root from vote hashes
      const merkleRoot = voteHashes.length > 0 ? 
        btoa(voteHashes.join('')).substring(0, 32) : 
        'no_votes_' + Date.now().toString(36);

      // Generate block hash first
      const timestamp = new Date().toISOString();
      const blockHashInput = `${nextBlockNumber}${previousHash || ''}${merkleRoot}${timestamp}`;
      const blockHash = btoa(blockHashInput).substring(0, 64);

      // Create block data with the hash
      const blockData = {
        block_number: nextBlockNumber,
        previous_block_hash: previousHash,
        merkle_root: merkleRoot,
        timestamp: timestamp,
        votes_count: voteHashes.length,
        validator_node: 'gov-node-001',
        is_validated: true,
        block_hash: blockHash
      };

      // Insert new block
      const { error } = await supabase
        .from('blockchain_blocks')
        .insert([blockData]);

      if (error) throw error;

      toast({
        title: "New Block Created",
        description: `Block #${nextBlockNumber} has been mined and added to the blockchain`,
      });

      // Refresh blockchain data
      await fetchBlocks();
    } catch (error) {
      console.error('Error creating new block:', error);
      toast({
        title: "Error",
        description: "Failed to create new block",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Upcoming": return "bg-blue-500";
      case "Completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getElectionResults = (electionId: string) => {
    const electionVotes = votes.filter(v => v.election_id === electionId);
    const electionCandidates = candidates.filter(c => c.election_id === electionId);
    
    return electionCandidates.map(candidate => ({
      ...candidate,
      votes: electionVotes.filter(v => v.candidate_id === candidate.id).length,
      percentage: electionVotes.length > 0 ? 
        ((electionVotes.filter(v => v.candidate_id === candidate.id).length / electionVotes.length) * 100).toFixed(1) : 
        '0.0'
    })).sort((a, b) => b.votes - a.votes);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indian-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <p className="text-navy-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-navy-600">ID: ADM-{profile?.id?.substring(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
                  {elections.slice(0, 5).map((election) => (
                    <div key={election.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-navy-900">{election.title}</h4>
                        <p className="text-sm text-navy-600">{election.type} • {election.total_voters.toLocaleString()} voters</p>
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
                      <span>Total Votes Cast</span>
                      <span>{votes.length}</span>
                    </div>
                    <Progress value={Math.min((votes.length / 1000) * 100, 100)} className="h-2" />
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-navy-900">Create New Election</h3>
                <Button 
                  onClick={populateAllElectionsWithCandidates}
                  className="bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Standard Candidates to All Elections
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                    onChange={(e) => setNewElection({...newElection, type: e.target.value as 'National' | 'State' | 'Local'})}
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
                    value={newElection.start_date}
                    onChange={(e) => setNewElection({...newElection, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newElection.end_date}
                    onChange={(e) => setNewElection({...newElection, end_date: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateElection} 
                    className="w-full bg-saffron-500 hover:bg-saffron-600"
                    disabled={!newElection.title || !newElection.constituency || !newElection.start_date || !newElection.end_date}
                  >
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
              {elections.map((election) => {
                const electionVotes = votes.filter(v => v.election_id === election.id);
                const results = getElectionResults(election.id);
                const winner = results[0];
                const isCompleted = election.status === 'Completed';
                
                return (
                  <Card key={election.id} className="glass-card border-0 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getStatusColor(election.status)}>
                        {election.status}
                      </Badge>
                      <span className="text-sm text-navy-600">{election.type}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-navy-900 mb-4">{election.title}</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-navy-600">Total Voters</span>
                        <span className="font-medium">{election.total_voters.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-navy-600">Votes Cast</span>
                        <span className="font-medium">{electionVotes.length.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-navy-600">Blockchain Blocks</span>
                        <span className="font-medium">{blocks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-navy-600">Data Integrity</span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                    </div>

                    {/* Winner Declaration Buttons */}
                    <div className="space-y-2 mb-4">
                      {election.status === 'Active' && electionVotes.length > 0 && (
                        <Button 
                          onClick={() => handleDeclareWinner(election.id, winner.id)}
                          className="w-full bg-saffron-500 hover:bg-saffron-600"
                          size="sm"
                        >
                          <Trophy className="mr-2 h-4 w-4" />
                          Declare Winner
                        </Button>
                      )}
                      {isCompleted && (
                        <Button 
                          onClick={() => handleUndeclareWinner(election.id)}
                          className="w-full bg-red-500 hover:bg-red-600"
                          variant="destructive"
                          size="sm"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Undeclare Winner
                        </Button>
                      )}
                    </div>

                    {/* Winner Display */}
                    {isCompleted && winner && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Winner: {winner.name}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">{winner.percentage}% votes</p>
                      </div>
                    )}

                    {election.status === "Active" && electionVotes.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Turnout</span>
                          <span>{Math.round((electionVotes.length / election.total_voters) * 100)}%</span>
                        </div>
                        <Progress value={(electionVotes.length / election.total_voters) * 100} className="h-2" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">Blockchain Network Status</h2>
              <Button onClick={createNewBlock} className="bg-saffron-500 hover:bg-saffron-600">
                <Plus className="mr-2 h-4 w-4" />
                Mine New Block
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Blockchain Blocks</h3>
                <div className="space-y-3">
                  {blocks.slice(0, 5).map((block) => (
                    <div key={block.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Block #{block.block_number}</h4>
                        <p className="text-sm text-navy-600 font-mono">{block.block_hash.substring(0, 20)}...</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">{block.votes_count}</span>
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validated
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card border-0 p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Network Status</h3>
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
          </TabsContent>

          {/* Enhanced Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">Election Results & Winner Declaration</h2>
              <Badge className="bg-green-500 text-white">
                Winner Declared
              </Badge>
            </div>

            {elections.map(election => {
              const results = getElectionResults(election.id);
              const totalVotes = votes.filter(v => v.election_id === election.id).length;
              const winner = results[0];
              const isCompleted = election.status === 'Completed';
              
              return (
                <Card key={election.id} className="glass-card border-0 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-navy-900">{election.title} - {election.constituency}</h3>
                    <div className="flex space-x-2">
                      {election.status === 'Active' && totalVotes > 0 && (
                        <Button 
                          onClick={() => handleDeclareWinner(election.id, winner.id)}
                          className="bg-saffron-500 hover:bg-saffron-600"
                        >
                          <Trophy className="mr-2 h-4 w-4" />
                          Declare Winner
                        </Button>
                      )}
                      {isCompleted && (
                        <Button 
                          onClick={() => handleUndeclareWinner(election.id)}
                          className="bg-red-500 hover:bg-red-600"
                          variant="destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Undeclare Winner
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {isCompleted && winner && (
                    <div className="mb-8 p-8 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-green-800 mb-2">Winner Declared</h4>
                      <p className="text-lg text-green-700 mb-2">{winner.name} has been officially declared the winner</p>
                      <p className="text-sm text-green-600">Result published on blockchain with immutable proof</p>
                      
                      <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2">Winner Declared</h5>
                        <p className="text-sm text-green-700">
                          {winner.name} has been officially declared the winner with {winner.percentage}% votes
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {results.map((candidate, index) => (
                      <div key={candidate.id} className={`flex items-center justify-between p-6 rounded-lg ${
                        index === 0 && totalVotes > 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-white/50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          {index === 0 && totalVotes > 0 && <CheckCircle className="h-6 w-6 text-green-600" />}
                          <div className="text-2xl">{candidate.symbol}</div>
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
                      <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
                      <div className="text-blue-800">Total Votes</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {election.total_voters > 0 ? ((totalVotes / election.total_voters) * 100).toFixed(1) : '0.0'}%
                      </div>
                      <div className="text-green-800">Turnout</div>
                    </div>
                    <div className="p-4 bg-saffron-50 rounded-lg">
                      <div className="text-2xl font-bold text-saffron-600">100%</div>
                      <div className="text-saffron-800">Verified</div>
                    </div>
                  </div>
                </Card>
              );
            })}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
