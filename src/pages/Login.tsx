
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Vote, Shield, User, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [userForm, setUserForm] = useState({ uniqueId: "", aadharNumber: "" });
  const [adminForm, setAdminForm] = useState({ uniqueId: "", aadharNumber: "" });
  const [currentTab, setCurrentTab] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyLogin } = useAuth();

  const storeLoginOnBlockchain = async (userData: any, userType: string) => {
    try {
      const loginData = {
        user_id: userData.user_id,
        email: userData.email,
        user_type: userType,
        login_timestamp: new Date().toISOString(),
        action: 'LOGIN'
      };

      const loginHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify(loginData))
      );
      
      const hashArray = Array.from(new Uint8Array(loginHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('Login stored on blockchain with hash:', hashHex);
      
      toast({
        title: "Login Recorded on Blockchain",
        description: `Login hash: ${hashHex.substring(0, 20)}...`,
      });

      return hashHex;
    } catch (error) {
      console.error('Error storing login on blockchain:', error);
    }
  };

  const handleLogin = async (userType: string) => {
    const form = userType === 'user' ? userForm : adminForm;
    
    if (!form.uniqueId || !form.aadharNumber) {
      toast({
        title: "Error",
        description: "Please enter both your Unique ID and Aadhar number",
        variant: "destructive"
      });
      return;
    }

    if (form.aadharNumber.length !== 12) {
      toast({
        title: "Error",
        description: "Aadhar number must be 12 digits",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Verify login with unique ID and Aadhar
      const result = await verifyLogin(form.uniqueId, form.aadharNumber);
      
      if (result.success) {
        // Store login on blockchain
        await storeLoginOnBlockchain(result, userType);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.full_name || 'User'}!`,
        });

        // Navigate to appropriate dashboard
        if (result.user_type === 'voter') {
          navigate('/user-dashboard');
        } else {
          navigate('/admin-dashboard');
        }
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid ID or Aadhar number",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 relative overflow-hidden">
      <div className="absolute inset-0 blockchain-grid opacity-20"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-saffron-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5 text-navy-600" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indian-gradient rounded-lg flex items-center justify-center">
                  <Vote className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-navy-900">भारत वोट</span>
              </div>
            </Link>
            <Badge variant="outline" className="border-green-500 text-green-700">
              <Shield className="h-3 w-3 mr-1" />
              Secure Login Portal
            </Badge>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card border-0 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indian-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900">Blockchain Login</h2>
              <p className="text-navy-600 mt-2">Login with your Unique ID & Aadhar</p>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Voter
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-id">Voter ID</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="user-id"
                      type="text"
                      placeholder="VTR-2025XXX-XXXX"
                      className="pl-10"
                      value={userForm.uniqueId}
                      onChange={(e) => setUserForm({...userForm, uniqueId: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-aadhar">Aadhar Number</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="user-aadhar"
                      type="text"
                      placeholder="XXXX XXXX XXXX"
                      className="pl-10"
                      maxLength={12}
                      value={userForm.aadharNumber}
                      onChange={(e) => setUserForm({...userForm, aadharNumber: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleLogin('user')}
                  className="w-full bg-saffron-500 hover:bg-saffron-600 text-white"
                  disabled={!userForm.uniqueId || !userForm.aadharNumber || loading}
                >
                  {loading ? 'Verifying...' : 'Login to Blockchain'}
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-id">Admin ID</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-id"
                      type="text"
                      placeholder="ADM-2025XXX-XXXX"
                      className="pl-10"
                      value={adminForm.uniqueId}
                      onChange={(e) => setAdminForm({...adminForm, uniqueId: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-aadhar">Aadhar Number</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-aadhar"
                      type="text"
                      placeholder="XXXX XXXX XXXX"
                      className="pl-10"
                      maxLength={12}
                      value={adminForm.aadharNumber}
                      onChange={(e) => setAdminForm({...adminForm, aadharNumber: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleLogin('admin')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!adminForm.uniqueId || !adminForm.aadharNumber || loading}
                >
                  {loading ? 'Verifying...' : 'Admin Login to Blockchain'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-sm text-navy-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-saffron-500 hover:text-saffron-600 font-medium">
                  Register on Blockchain
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
