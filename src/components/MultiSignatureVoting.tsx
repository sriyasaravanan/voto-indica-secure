
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Key,
  Plus,
  Trash2,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

interface MultiSigWallet {
  id: string;
  name: string;
  description: string;
  requiredSignatures: number;
  totalSigners: number;
  signers: string[];
  pendingTransactions: MultiSigTransaction[];
  completedTransactions: MultiSigTransaction[];
}

interface MultiSigTransaction {
  id: string;
  type: 'vote' | 'election_create' | 'emergency_stop';
  title: string;
  description: string;
  initiator: string;
  signatures: string[];
  requiredSignatures: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
  voteData?: any;
}

export const MultiSignatureVoting: React.FC = () => {
  const [multisigWallets, setMultisigWallets] = useState<MultiSigWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [newSignerAddress, setNewSignerAddress] = useState('');
  const [newTransactionData, setNewTransactionData] = useState({
    type: 'vote',
    title: '',
    description: '',
    voteData: ''
  });
  const { toast } = useToast();
  const { publicKey, connected } = useSolanaWallet();

  useEffect(() => {
    // Initialize with demo data
    const demoWallets: MultiSigWallet[] = [
      {
        id: '1',
        name: 'Election Commission MultiSig',
        description: 'Official multi-signature wallet for election management',
        requiredSignatures: 3,
        totalSigners: 5,
        signers: [
          '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          'AuBTjbkfLSGqiUZUSPS4PAj6Qhx5p6qQCPPwDsGy46L9'
        ],
        pendingTransactions: [
          {
            id: 'tx1',
            type: 'election_create',
            title: 'Create Mumbai Local Election',
            description: 'Create new election for Mumbai Municipal Corporation',
            initiator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            signatures: ['7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'],
            requiredSignatures: 3,
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }
        ],
        completedTransactions: []
      }
    ];
    
    setMultisigWallets(demoWallets);
    setSelectedWallet(demoWallets[0]?.id || '');
  }, []);

  const currentWallet = multisigWallets.find(w => w.id === selectedWallet);

  const createMultiSigTransaction = async () => {
    if (!connected || !publicKey || !currentWallet) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    const newTransaction: MultiSigTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: newTransactionData.type as any,
      title: newTransactionData.title,
      description: newTransactionData.description,
      initiator: publicKey.toString(),
      signatures: [publicKey.toString()],
      requiredSignatures: currentWallet.requiredSignatures,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      voteData: newTransactionData.voteData ? JSON.parse(newTransactionData.voteData) : undefined
    };

    setMultisigWallets(prev => prev.map(wallet => 
      wallet.id === selectedWallet 
        ? { ...wallet, pendingTransactions: [...wallet.pendingTransactions, newTransaction] }
        : wallet
    ));

    setNewTransactionData({ type: 'vote', title: '', description: '', voteData: '' });

    toast({
      title: "Transaction Created",
      description: `Multi-signature transaction created. ${currentWallet.requiredSignatures - 1} more signatures needed.`,
    });
  };

  const signTransaction = async (transactionId: string) => {
    if (!connected || !publicKey || !currentWallet) return;

    const userAddress = publicKey.toString();
    
    setMultisigWallets(prev => prev.map(wallet => 
      wallet.id === selectedWallet 
        ? {
            ...wallet,
            pendingTransactions: wallet.pendingTransactions.map(tx => {
              if (tx.id === transactionId && !tx.signatures.includes(userAddress)) {
                const newSignatures = [...tx.signatures, userAddress];
                const newStatus = newSignatures.length >= tx.requiredSignatures ? 'approved' : 'pending';
                
                return {
                  ...tx,
                  signatures: newSignatures,
                  status: newStatus
                };
              }
              return tx;
            })
          }
        : wallet
    ));

    toast({
      title: "Transaction Signed",
      description: "Your signature has been added to the transaction.",
    });
  };

  const executeTransaction = async (transactionId: string) => {
    if (!currentWallet) return;

    const transaction = currentWallet.pendingTransactions.find(tx => tx.id === transactionId);
    if (!transaction || transaction.status !== 'approved') return;

    // Move to completed transactions
    setMultisigWallets(prev => prev.map(wallet => 
      wallet.id === selectedWallet 
        ? {
            ...wallet,
            pendingTransactions: wallet.pendingTransactions.filter(tx => tx.id !== transactionId),
            completedTransactions: [...wallet.completedTransactions, { ...transaction, status: 'approved' }]
          }
        : wallet
    ));

    toast({
      title: "Transaction Executed",
      description: `Multi-signature transaction "${transaction.title}" has been executed successfully.`,
    });
  };

  const addSigner = () => {
    if (!newSignerAddress || !currentWallet) return;

    setMultisigWallets(prev => prev.map(wallet => 
      wallet.id === selectedWallet 
        ? {
            ...wallet,
            signers: [...wallet.signers, newSignerAddress],
            totalSigners: wallet.totalSigners + 1
          }
        : wallet
    ));

    setNewSignerAddress('');
    toast({
      title: "Signer Added",
      description: "New signer has been added to the multi-signature wallet.",
    });
  };

  if (!connected) {
    return (
      <Card className="p-6 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Connect Wallet Required</h3>
        <p className="text-gray-600">Please connect your Solana wallet to access multi-signature features.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Multi-Signature Voting</h2>
        <Badge variant="outline" className="border-purple-500 text-purple-700">
          <Shield className="h-3 w-3 mr-1" />
          Enhanced Security
        </Badge>
      </div>

      {currentWallet && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{currentWallet.name}</h3>
              <p className="text-gray-600">{currentWallet.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Signatures Required</p>
              <p className="text-xl font-bold text-purple-600">
                {currentWallet.requiredSignatures} of {currentWallet.totalSigners}
              </p>
            </div>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({currentWallet.pendingTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({currentWallet.completedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Create New Transaction</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tx-title">Transaction Title</Label>
                    <Input
                      id="tx-title"
                      value={newTransactionData.title}
                      onChange={(e) => setNewTransactionData({...newTransactionData, title: e.target.value})}
                      placeholder="Enter transaction title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tx-type">Transaction Type</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newTransactionData.type}
                      onChange={(e) => setNewTransactionData({...newTransactionData, type: e.target.value})}
                    >
                      <option value="vote">Vote Transaction</option>
                      <option value="election_create">Create Election</option>
                      <option value="emergency_stop">Emergency Stop</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="tx-description">Description</Label>
                    <Input
                      id="tx-description"
                      value={newTransactionData.description}
                      onChange={(e) => setNewTransactionData({...newTransactionData, description: e.target.value})}
                      placeholder="Enter transaction description"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Button onClick={createMultiSigTransaction} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Multi-Sig Transaction
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                {currentWallet.pendingTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{transaction.title}</h4>
                          <Badge variant={transaction.status === 'approved' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{transaction.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1">
                            <UserCheck className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {transaction.signatures.length} / {transaction.requiredSignatures} signatures
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Expires: {transaction.expiresAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <Progress 
                          value={(transaction.signatures.length / transaction.requiredSignatures) * 100} 
                          className="mb-3" 
                        />
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {transaction.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => signTransaction(transaction.id)}
                            disabled={transaction.signatures.includes(publicKey?.toString() || '')}
                          >
                            {transaction.signatures.includes(publicKey?.toString() || '') ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Signed
                              </>
                            ) : (
                              <>
                                <Key className="h-3 w-3 mr-1" />
                                Sign
                              </>
                            )}
                          </Button>
                        )}
                        
                        {transaction.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => executeTransaction(transaction.id)}
                          >
                            Execute
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {currentWallet.completedTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No completed transactions yet</p>
                </div>
              ) : (
                currentWallet.completedTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800">{transaction.title}</h4>
                        <p className="text-sm text-green-600">{transaction.description}</p>
                      </div>
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Executed
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Add New Signer</h4>
                <div className="flex space-x-2">
                  <Input
                    value={newSignerAddress}
                    onChange={(e) => setNewSignerAddress(e.target.value)}
                    placeholder="Enter Solana wallet address"
                    className="flex-1"
                  />
                  <Button onClick={addSigner}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Current Signers</h4>
                <div className="space-y-2">
                  {currentWallet.signers.map((signer, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-mono text-sm">{signer}</span>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};
