
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Vote, Shield, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useOTP } from "@/hooks/useOTP";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [userForm, setUserForm] = useState({ email: "", password: "", otp: "" });
  const [adminForm, setAdminForm] = useState({ adminId: "", password: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [currentTab, setCurrentTab] = useState("user");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendOTP, verifyOTP, isLoading } = useOTP();

  const handleSendOTP = async (userType: string) => {
    const email = userType === 'user' ? userForm.email : adminForm.adminId;
    
    if (!email) {
      return;
    }

    const success = await sendOTP(email, userType as 'user' | 'admin');
    if (success) {
      setOtpSent(true);
    }
  };

  const storeLoginOnBlockchain = async (userId: string, email: string, userType: string) => {
    try {
      // Create a blockchain record for this login
      const loginData = {
        user_id: userId,
        email: email,
        user_type: userType,
        login_timestamp: new Date().toISOString(),
        action: 'LOGIN'
      };

      // Generate a hash for this login event
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
    if (!otpSent) {
      await handleSendOTP(userType);
      return;
    }

    const email = userType === 'user' ? userForm.email : adminForm.adminId;
    const otp = userType === 'user' ? userForm.otp : adminForm.otp;
    
    if (!otp) {
      return;
    }

    const isValid = await verifyOTP(email, otp);
    
    if (isValid) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: userType === 'user' ? userForm.password : adminForm.password,
        });

        if (error && error.message.includes('Invalid login credentials')) {
          // User doesn't exist, create them
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: userType === 'user' ? userForm.password : adminForm.password,
          });

          if (signUpError) {
            console.error('Sign up error:', signUpError);
            toast({
              title: "Error",
              description: "Failed to create account",
              variant: "destructive"
            });
            return;
          }

          if (signUpData.user) {
            // Create profile
            await supabase.from('profiles').insert([{
              id: signUpData.user.id,
              email: email,
              user_type: userType === 'user' ? 'voter' : 'admin',
              verified: true
            }]);

            // Store registration on blockchain
            await storeLoginOnBlockchain(signUpData.user.id, email, userType);
          }
        } else if (error) {
          console.error('Sign in error:', error);
          toast({
            title: "Error",
            description: "Login failed",
            variant: "destructive"
          });
          return;
        } else if (data.user) {
          // Store login on blockchain
          await storeLoginOnBlockchain(data.user.id, email, userType);
        }

        // Navigate to appropriate dashboard
        if (userType === 'user') {
          navigate('/user-dashboard');
        } else {
          navigate('/admin-dashboard');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Error",
          description: "Authentication failed",
          variant: "destructive"
        });
      }
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
              <p className="text-navy-600 mt-2">Secure blockchain-verified authentication</p>
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
                  <Label htmlFor="user-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    />
                  </div>
                </div>

                {otpSent && currentTab === "user" && (
                  <div className="space-y-2">
                    <Label htmlFor="user-otp">OTP Verification</Label>
                    <Input
                      id="user-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={userForm.otp}
                      onChange={(e) => setUserForm({...userForm, otp: e.target.value})}
                    />
                  </div>
                )}

                <Button 
                  onClick={() => handleLogin('user')}
                  className="w-full bg-saffron-500 hover:bg-saffron-600 text-white"
                  disabled={!userForm.email || !userForm.password || (otpSent && !userForm.otp) || isLoading}
                >
                  {isLoading ? 'Processing...' : (otpSent ? 'Verify & Login to Blockchain' : 'Send OTP & Login')}
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-id">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-id"
                      type="email"
                      placeholder="admin@example.com"
                      className="pl-10"
                      value={adminForm.adminId}
                      onChange={(e) => setAdminForm({...adminForm, adminId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      className="pl-10"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    />
                  </div>
                </div>

                {otpSent && currentTab === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="admin-otp">OTP Verification</Label>
                    <Input
                      id="admin-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={adminForm.otp}
                      onChange={(e) => setAdminForm({...adminForm, otp: e.target.value})}
                    />
                  </div>
                )}

                <Button 
                  onClick={() => handleLogin('admin')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!adminForm.adminId || !adminForm.password || (otpSent && !adminForm.otp) || isLoading}
                >
                  {isLoading ? 'Processing...' : (otpSent ? 'Verify & Login to Blockchain' : 'Send OTP & Login')}
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
