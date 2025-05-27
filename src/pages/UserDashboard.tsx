
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, Shield, Eye, CheckCircle, Users, Calendar, MapPin, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const [voteCast, setVoteCast] = useState(false);
  const [voteHash, setVoteHash] = useState("");
  const { toast } = useToast();

  const elections = [
    {
      id: "lok-sabha-2024",
      title: "Lok Sabha Elections 2024",
      type: "National",
      status: "Active",
      endDate: "2024-06-04",
      constituency: "Mumbai North",
      totalVoters: 1850000,
      votedCount: 982000
    },
    {
      id: "state-assembly-2024",
      title: "Maharashtra Assembly Elections",
      type: "State", 
      status: "Upcoming",
      endDate: "2024-11-15",
      constituency: "Bandra East",
      totalVoters: 245000,
      votedCount: 0
    },
    {
      id: "municipal-2024",
      title: "Mumbai Municipal Corporation",
      type: "Local",
      status: "Active",
      endDate: "2024-07-20",
      constituency: "Ward 184",
      totalVoters: 85000,
      votedCount: 45000
    }
  ];

  const candidates = [
    { name: "Rajesh Kumar", party: "Indian National Congress", symbol: "🖐️", manifesto: "Focus on employment and healthcare" },
    { name: "Priya Sharma", party: "Bharatiya Janata Party", symbol: "🪷", manifesto: "Digital India and infrastructure development" },
    { name: "Mohammed Ali", party: "Aam Aadmi Party", symbol: "🧹", manifesto: "Education reform and anti-corruption" },
    { name: "Sunita Devi", party: "Independent", symbol: "🏠", manifesto: "Women empowerment and local development" }
  ];

  const handleVote = (candidate: any) => {
    const hash = `0x${Math.random().toString(16).substr(2, 40)}`;
    setVoteHash(hash);
    setVoteCast(true);
    
    toast({
      title: "Vote Cast Successfully!",
      description: `Your vote has been recorded on the blockchain. Transaction hash: ${hash.substring(0, 20)}...`,
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
                <Vote className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">Voter Dashboard</h1>
                <p className="text-sm text-navy-600">ID: VTR-2024-A7X9</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Verified Voter
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
        <Tabs defaultValue="elections" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="vote">Cast Vote</TabsTrigger>
            <TabsTrigger value="track">Track Vote</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Elections Tab */}
          <TabsContent value="elections" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-navy-900">Available Elections</h2>
              <Badge className="bg-saffron-500">
                {elections.filter(e => e.status === "Active").length} Active Elections
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => (
                <Card key={election.id} className="glass-card border-0 p-6 vote-card-hover cursor-pointer"
                      onClick={() => setSelectedElection(election.id)}>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getStatusColor(election.status)}>
                      {election.status}
                    </Badge>
                    <span className="text-sm text-navy-600">{election.type}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{election.title}</h3>
                  
                  <div className="space-y-2 text-sm text-navy-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {election.constituency}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ends: {election.endDate}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {election.totalVoters.toLocaleString()} voters
                    </div>
                  </div>

                  {election.status === "Active" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Turnout</span>
                        <span>{Math.round((election.votedCount / election.totalVoters) * 100)}%</span>
                      </div>
                      <Progress value={(election.votedCount / election.totalVoters) * 100} className="h-2" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cast Vote Tab */}
          <TabsContent value="vote" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Cast Your Vote</h2>
              <p className="text-navy-600">Select your preferred candidate for Lok Sabha Elections 2024</p>
            </div>

            {voteCast ? (
              <Card className="glass-card border-0 p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-vote-cast">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-4">Vote Cast Successfully!</h3>
                <p className="text-navy-600 mb-6">Your vote has been securely recorded on the blockchain</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">Blockchain Transaction Hash:</p>
                  <p className="font-mono text-green-900 break-all">{voteHash}</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {candidates.map((candidate, index) => (
                  <Card key={index} className="glass-card border-0 p-6 vote-card-hover">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{candidate.symbol}</div>
                      <h3 className="text-xl font-bold text-navy-900">{candidate.name}</h3>
                      <p className="text-saffron-600 font-medium">{candidate.party}</p>
                    </div>
                    
                    <p className="text-navy-600 text-sm mb-6 text-center">{candidate.manifesto}</p>
                    
                    <Button 
                      onClick={() => handleVote(candidate)}
                      className="w-full bg-saffron-500 hover:bg-saffron-600 text-white"
                    >
                      <Vote className="mr-2 h-4 w-4" />
                      Vote for {candidate.name}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Track Vote Tab */}
          <TabsContent value="track" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Track Your Vote</h2>
              <p className="text-navy-600">Verify your vote on the public blockchain ledger</p>
            </div>

            <Card className="glass-card border-0 p-8 max-w-3xl mx-auto">
              {voteHash ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">Vote Successfully Verified</h3>
                    <p className="text-navy-600">Your vote exists on the blockchain and has been counted</p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-2">Transaction Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-navy-600">Hash:</span> <span className="font-mono">{voteHash.substring(0, 20)}...</span></div>
                          <div><span className="text-navy-600">Block:</span> <span className="font-mono">8,456,789</span></div>
                          <div><span className="text-navy-600">Timestamp:</span> <span>{new Date().toLocaleString()}</span></div>
                          <div><span className="text-navy-600">Status:</span> <Badge className="bg-green-500">Confirmed</Badge></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-2">Verification Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Identity Verified</div>
                          <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Vote Recorded</div>
                          <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Blockchain Confirmed</div>
                          <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Anonymity Preserved</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">No Vote to Track</h3>
                  <p className="text-navy-600">Cast your vote first to track it on the blockchain</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Election Results</h2>
              <p className="text-navy-600">Real-time, cryptographically verifiable results</p>
            </div>

            <Card className="glass-card border-0 p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-navy-900 mb-6">Lok Sabha Elections 2024 - Mumbai North</h3>
              
              <div className="space-y-4">
                {candidates.map((candidate, index) => {
                  const votes = Math.floor(Math.random() * 200000) + 50000;
                  const percentage = ((votes / 982000) * 100).toFixed(1);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{candidate.symbol}</span>
                        <div>
                          <h4 className="font-semibold text-navy-900">{candidate.name}</h4>
                          <p className="text-sm text-navy-600">{candidate.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-navy-900">{votes.toLocaleString()}</div>
                        <div className="text-sm text-navy-600">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Results verified by blockchain consensus</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
