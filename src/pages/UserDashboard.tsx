
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, Shield, Eye, CheckCircle, Users, Calendar, MapPin, LogOut } from "lucide-react";
import { useElections } from "@/hooks/useElections";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useAuth } from "@/hooks/useAuth";

const UserDashboard = () => {
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const [voteCast, setVoteCast] = useState(false);
  const [voteHash, setVoteHash] = useState("");
  
  const { elections, candidates, loading: electionsLoading, fetchCandidates, castVote } = useElections();
  const { votes, blocks, verifyVoteHash } = useBlockchain();
  const { profile, signOut } = useAuth();

  useEffect(() => {
    if (selectedElection) {
      fetchCandidates(selectedElection);
    }
  }, [selectedElection]);

  // Get active election for voting
  const activeElection = elections.find(e => e.status === 'Active');

  useEffect(() => {
    if (activeElection && !selectedElection) {
      setSelectedElection(activeElection.id);
    }
  }, [activeElection, selectedElection]);

  // Filter candidates for selected election
  const electionCandidates = candidates.filter(c => c.election_id === selectedElection);

  const handleVote = async (candidate: any) => {
    if (!selectedElection) return;

    const result = await castVote(selectedElection, candidate.id);
    if (result && result.success) {
      setVoteHash(result.vote_hash || '');
      setVoteCast(true);
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

  const getUserVote = () => {
    return votes.find(vote => vote.voter_id === profile?.id && vote.election_id === selectedElection);
  };

  const userVote = getUserVote();

  if (electionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indian-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <Vote className="h-8 w-8 text-white" />
          </div>
          <p className="text-navy-600">Loading election data...</p>
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
                <Vote className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">Voter Dashboard</h1>
                <p className="text-sm text-navy-600">ID: {profile?.voter_id || 'VTR-' + profile?.id?.substring(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Verified Voter
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
                      Ends: {new Date(election.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {election.total_voters.toLocaleString()} voters
                    </div>
                  </div>

                  {election.status === "Active" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Votes Cast</span>
                        <span>{votes.filter(v => v.election_id === election.id).length}</span>
                      </div>
                      <Progress value={Math.min((votes.filter(v => v.election_id === election.id).length / election.total_voters) * 100, 100)} className="h-2" />
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
              <p className="text-navy-600">
                {activeElection ? `Select your preferred candidate for ${activeElection.title}` : 'No active elections available'}
              </p>
            </div>

            {userVote || voteCast ? (
              <Card className="glass-card border-0 p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-vote-cast">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-4">Vote Cast Successfully!</h3>
                <p className="text-navy-600 mb-6">Your vote has been securely recorded on the blockchain</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">Blockchain Transaction Hash:</p>
                  <p className="font-mono text-green-900 break-all">{userVote?.vote_hash || voteHash}</p>
                </div>
              </Card>
            ) : electionCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {electionCandidates.map((candidate) => (
                  <Card key={candidate.id} className="glass-card border-0 p-6 vote-card-hover">
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
            ) : (
              <Card className="glass-card border-0 p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">No Active Elections</h3>
                <p className="text-navy-600">There are currently no active elections available for voting.</p>
              </Card>
            )}
          </TabsContent>

          {/* Track Vote Tab */}
          <TabsContent value="track" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Track Your Vote</h2>
              <p className="text-navy-600">Verify your vote on the public blockchain ledger</p>
            </div>

            <Card className="glass-card border-0 p-8 max-w-3xl mx-auto">
              {userVote || voteHash ? (
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
                          <div><span className="text-navy-600">Hash:</span> <span className="font-mono">{(userVote?.vote_hash || voteHash)?.substring(0, 20)}...</span></div>
                          <div><span className="text-navy-600">Block:</span> <span className="font-mono">{userVote?.block_hash?.substring(0, 10)}...</span></div>
                          <div><span className="text-navy-600">Timestamp:</span> <span>{userVote ? new Date(userVote.timestamp).toLocaleString() : new Date().toLocaleString()}</span></div>
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
              {activeElection && (
                <>
                  <h3 className="text-xl font-bold text-navy-900 mb-6">{activeElection.title} - {activeElection.constituency}</h3>
                  
                  <div className="space-y-4">
                    {electionCandidates.map((candidate) => {
                      const candidateVotes = votes.filter(v => v.candidate_id === candidate.id).length;
                      const totalVotes = votes.filter(v => v.election_id === activeElection.id).length;
                      const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <div key={candidate.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{candidate.symbol}</span>
                            <div>
                              <h4 className="font-semibold text-navy-900">{candidate.name}</h4>
                              <p className="text-sm text-navy-600">{candidate.party}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-navy-900">{candidateVotes.toLocaleString()}</div>
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
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
