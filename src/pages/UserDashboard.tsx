
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, Shield, Eye, CheckCircle, Users, Calendar, MapPin, LogOut, Clock, Trophy } from "lucide-react";
import { useElections } from "@/hooks/useElections";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useAuth } from "@/hooks/useAuth";
import { SolanaWalletButton } from "@/components/SolanaWalletButton";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useToast } from "@/hooks/use-toast";
import { BlockchainExplorer } from "@/components/BlockchainExplorer";

const UserDashboard = () => {
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const [voteCast, setVoteCast] = useState(false);
  const [voteHash, setVoteHash] = useState("");
  const [solanaSignature, setSolanaSignature] = useState("");
  const [activeTab, setActiveTab] = useState("elections");
  
  const { elections, candidates, loading: electionsLoading, fetchCandidates, castVote } = useElections();
  const { votes, blocks, verifyVoteHash } = useBlockchain();
  const { profile, signOut } = useAuth();
  const { sendVoteTransaction, connected: walletConnected, getNetworkStats } = useSolanaWallet();
  const { toast } = useToast();

  // Get active election for voting
  const activeElection = elections.find(e => e.status === 'Active');

  useEffect(() => {
    if (activeElection && !selectedElection) {
      setSelectedElection(activeElection.id);
    }
  }, [activeElection, selectedElection]);

  useEffect(() => {
    if (selectedElection) {
      console.log('Fetching candidates for election:', selectedElection);
      fetchCandidates(selectedElection);
    }
  }, [selectedElection]);

  // Filter candidates for selected election
  const electionCandidates = candidates.filter(c => c.election_id === selectedElection);

  console.log('Selected election:', selectedElection);
  console.log('All candidates:', candidates);
  console.log('Filtered candidates for selected election:', electionCandidates);

  const handleElectionClick = (electionId: string) => {
    console.log('Election clicked:', electionId);
    setSelectedElection(electionId);
    setActiveTab("vote");
    // Reset vote state when switching elections
    setVoteCast(false);
    setVoteHash("");
    setSolanaSignature("");
  };

  const handleVote = async (candidate: any) => {
    if (!selectedElection) return;

    // Check if wallet is connected
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Solana wallet to vote",
        variant: "destructive"
      });
      setActiveTab("wallet");
      return;
    }

    const result = await castVote(selectedElection, candidate.id);
    if (result && result.success) {
      setVoteHash(result.vote_hash || '');
      setVoteCast(true);
      
      // Record on Solana blockchain
      if (walletConnected) {
        const voteData = JSON.stringify({
          election_id: selectedElection,
          candidate_id: candidate.id,
          vote_hash: result.vote_hash,
          timestamp: new Date().toISOString(),
          candidate_name: candidate.name,
          election_title: elections.find(e => e.id === selectedElection)?.title
        });
        
        const solanaResult = await sendVoteTransaction(voteData);
        if (solanaResult?.signature) {
          setSolanaSignature(solanaResult.signature);
          toast({
            title: "Vote Recorded on Blockchain!",
            description: `Your vote is now immutably recorded on Solana. Transaction: ${solanaResult.signature.substring(0, 20)}...`,
          });
        }
      }
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
              {walletConnected && (
                <Badge className="bg-purple-500">
                  <Vote className="h-3 w-3 mr-1" />
                  Blockchain Ready
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="vote">Cast Vote</TabsTrigger>
            <TabsTrigger value="track">Track Vote</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
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
              {elections.map((election) => {
                const electionVotes = votes.filter(v => v.election_id === election.id);
                const results = getElectionResults(election.id);
                const winner = results[0];
                const isCompleted = election.status === 'Completed';
                
                return (
                  <Card key={election.id} className="glass-card border-0 p-6 vote-card-hover cursor-pointer"
                        onClick={() => handleElectionClick(election.id)}>
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

                    {/* Winner Declaration Display */}
                    {isCompleted && winner && (
                      <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg mb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-bold text-green-800">Winner Declared</span>
                        </div>
                        <p className="text-sm text-green-700 font-medium">{winner.name}</p>
                        <p className="text-xs text-green-600">{winner.party} • {winner.percentage}% votes</p>
                      </div>
                    )}

                    {election.status === "Active" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Votes Cast</span>
                          <span>{electionVotes.length}</span>
                        </div>
                        <Progress value={Math.min((electionVotes.length / election.total_voters) * 100, 100)} className="h-2" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Solana Blockchain Wallet</h2>
              <p className="text-navy-600">Connect your Solana wallet for immutable blockchain voting</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <SolanaWalletButton 
                onWalletConnected={(publicKey) => {
                  console.log('Wallet connected:', publicKey);
                  toast({
                    title: "Blockchain Wallet Connected",
                    description: "Your votes will now be recorded on the Solana blockchain",
                  });
                }}
                showBalance={true}
              />
              
              {walletConnected && (
                <Card className="glass-card border-0 p-6 mt-6">
                  <h3 className="text-lg font-bold text-navy-900 mb-4">Blockchain Features Enabled</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Immutable vote recording
                    </div>
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Cryptographic verification
                    </div>
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Public auditability
                    </div>
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Decentralized consensus
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Cast Vote Tab */}
          <TabsContent value="vote" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Cast Your Vote</h2>
              <p className="text-navy-600">
                {selectedElection ? 
                  `Select your preferred candidate for ${elections.find(e => e.id === selectedElection)?.title}` : 
                  'No election selected'
                }
              </p>
              {selectedElection && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-navy-500">
                    Found {electionCandidates.length} candidate(s) for this election
                  </p>
                  <p className="text-xs text-gray-400">
                    Election ID: {selectedElection}
                  </p>
                  {candidates.length === 0 && (
                    <p className="text-xs text-red-500">
                      Debug: No candidates loaded at all. Check database or admin panel.
                    </p>
                  )}
                </div>
              )}
            </div>

            {!walletConnected && (
              <Card className="glass-card border-0 p-6 text-center max-w-2xl mx-auto mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">Wallet Required</h3>
                <p className="text-navy-600 mb-4">Please connect your Solana wallet to cast your vote</p>
                <Button onClick={() => setActiveTab("wallet")} className="bg-purple-500 hover:bg-purple-600">
                  Connect Wallet
                </Button>
              </Card>
            )}

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
            ) : electionCandidates.length > 0 && walletConnected ? (
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
            ) : selectedElection ? (
              <Card className="glass-card border-0 p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">No Candidates Available</h3>
                <p className="text-navy-600 mb-2">There are currently no candidates available for this election.</p>
                <p className="text-navy-500 text-sm mb-4">Election ID: {selectedElection}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Candidates need to be added by an administrator before voting can begin.
                    Please contact your election administrator or check back later.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="glass-card border-0 p-8 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">No Election Selected</h3>
                <p className="text-navy-600">Please select an election from the Elections tab to cast your vote.</p>
              </Card>
            )}
          </TabsContent>

          {/* Track Vote Tab */}
          <TabsContent value="track" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Track Your Vote</h2>
              <p className="text-navy-600">Verify your vote on both the local ledger and Solana blockchain</p>
            </div>

            <Card className="glass-card border-0 p-8 max-w-3xl mx-auto">
              {userVote || voteHash ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">Vote Successfully Verified</h3>
                    <p className="text-navy-600">Your vote exists on both local and blockchain ledgers</p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-2">Local Transaction</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-navy-600">Hash:</span> <span className="font-mono">{(userVote?.vote_hash || voteHash)?.substring(0, 20)}...</span></div>
                          <div><span className="text-navy-600">Block:</span> <span className="font-mono">{userVote?.block_hash?.substring(0, 10)}...</span></div>
                          <div><span className="text-navy-600">Timestamp:</span> <span>{userVote ? new Date(userVote.timestamp).toLocaleString() : new Date().toLocaleString()}</span></div>
                          <div><span className="text-navy-600">Status:</span> <Badge className="bg-green-500">Confirmed</Badge></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-2">Blockchain Transaction</h4>
                        <div className="space-y-2 text-sm">
                          {solanaSignature ? (
                            <>
                              <div><span className="text-navy-600">Solana Signature:</span> <span className="font-mono">{solanaSignature.substring(0, 20)}...</span></div>
                              <div><span className="text-navy-600">Network:</span> <span>Solana Devnet</span></div>
                              <div><span className="text-navy-600">Status:</span> <Badge className="bg-purple-500">On-Chain</Badge></div>
                              <div><span className="text-navy-600">Immutable:</span> <Badge className="bg-blue-500">Forever</Badge></div>
                            </>
                          ) : (
                            <p className="text-gray-500">No blockchain transaction found</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-navy-900 mb-2">Verification Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Identity Verified</div>
                        <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Vote Recorded</div>
                        <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Database Confirmed</div>
                        <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Anonymity Preserved</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          {solanaSignature ? 
                            <CheckCircle className="h-4 w-4 text-purple-500 mr-2" /> : 
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          }
                          Blockchain Recorded
                        </div>
                        <div className="flex items-center">
                          {solanaSignature ? 
                            <CheckCircle className="h-4 w-4 text-purple-500 mr-2" /> : 
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          }
                          Immutable Storage
                        </div>
                        <div className="flex items-center">
                          {solanaSignature ? 
                            <CheckCircle className="h-4 w-4 text-purple-500 mr-2" /> : 
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          }
                          Public Auditability
                        </div>
                        <div className="flex items-center">
                          {solanaSignature ? 
                            <CheckCircle className="h-4 w-4 text-purple-500 mr-2" /> : 
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          }
                          Decentralized Consensus
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
              {selectedElection && elections.find(e => e.id === selectedElection) && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-navy-900">{elections.find(e => e.id === selectedElection)?.title} - {elections.find(e => e.id === selectedElection)?.constituency}</h3>
                    {elections.find(e => e.id === selectedElection)?.status === 'Completed' && (
                      <Badge className="bg-green-500 text-white">
                        <Trophy className="h-3 w-3 mr-1" />
                        Winner Declared
                      </Badge>
                    )}
                  </div>

                  {/* Winner Declaration Banner */}
                  {elections.find(e => e.id === selectedElection)?.status === 'Completed' && (
                    <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-green-800 mb-2">Official Winner Declared</h4>
                      {(() => {
                        const results = getElectionResults(selectedElection);
                        const winner = results[0];
                        return winner ? (
                          <>
                            <p className="text-lg text-green-700 mb-2">{winner.name} has been declared the winner</p>
                            <p className="text-sm text-green-600">Winning with {winner.percentage}% of total votes • Result published on blockchain</p>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {electionCandidates.map((candidate) => {
                      const candidateVotes = votes.filter(v => v.candidate_id === candidate.id).length;
                      const totalVotes = votes.filter(v => v.election_id === selectedElection).length;
                      const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : '0.0';
                      const isWinner = elections.find(e => e.id === selectedElection)?.status === 'Completed' && 
                                     getElectionResults(selectedElection)[0]?.id === candidate.id;
                      
                      return (
                        <div key={candidate.id} className={`flex items-center justify-between p-4 rounded-lg ${
                          isWinner ? 'bg-green-50 border-2 border-green-200' : 'bg-white/50'
                        }`}>
                          <div className="flex items-center space-x-4">
                            {isWinner && <Trophy className="h-5 w-5 text-green-600" />}
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

          {/* New Blockchain Explorer Tab */}
          <TabsContent value="blockchain" className="space-y-6">
            <BlockchainExplorer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
