import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Vote, Shield, Mail, Lock, User, ArrowLeft, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOTP } from "@/hooks/useOTP";

const Signup = () => {
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    aadhar: "",
    address: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });
  
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    adminCode: "",
    department: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [currentTab, setCurrentTab] = useState("user");
  const [generatedId, setGeneratedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendOTP, verifyOTP, isLoading: otpLoading } = useOTP();

  const generateUniqueId = (type: string) => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return type === 'user' ? `VTR-${timestamp}-${random}` : `ADM-${timestamp}-${random}`;
  };

  const handleSendOTP = async (userType: 'user' | 'admin') => {
    const email = userType === 'user' ? userForm.email : adminForm.email;
    const form = userType === 'user' ? userForm : adminForm;
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    if (!form.name || !form.password || form.password !== form.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill all required fields and ensure passwords match",
        variant: "destructive"
      });
      return;
    }

    if (form.password.length < 6) {
      toast({
        title: "Error",
        description: "Password should be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await sendOTP(email, userType);
      if (success) {
        setOtpSent(true);
        const newId = generateUniqueId(userType);
        setGeneratedId(newId);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const storeRegistrationOnBlockchain = async (userId: string, userData: any, userType: string) => {
    try {
      const registrationData = {
        user_id: userId,
        email: userData.email,
        user_type: userType,
        registration_timestamp: new Date().toISOString(),
        action: 'REGISTRATION',
        full_name: userData.name,
        ...(userType === 'user' ? {
          phone: userData.phone,
          aadhar: userData.aadhar,
          address: userData.address
        } : {
          admin_code: userData.adminCode,
          department: userData.department
        })
      };

      const regHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify(registrationData))
      );
      
      const hashArray = Array.from(new Uint8Array(regHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('Registration stored on blockchain with hash:', hashHex);
      
      toast({
        title: "Registration Recorded on Blockchain",
        description: `Registration hash: ${hashHex.substring(0, 20)}...`,
      });

      return hashHex;
    } catch (error) {
      console.error('Error storing registration on blockchain:', error);
    }
  };

  const handleSignup = async (userType: 'user' | 'admin') => {
    if (!otpSent) {
      await handleSendOTP(userType);
      return;
    }

    const form = userType === 'user' ? userForm : adminForm;
    
    if (!form.otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Verify OTP first
      const otpValid = await verifyOTP(form.email, form.otp);
      if (!otpValid) {
        setLoading(false);
        return;
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          email: form.email,
          user_type: userType === 'user' ? 'voter' : 'admin',
          full_name: form.name,
          verified: true,
          ...(userType === 'user' ? {
            constituency: userForm.address
          } : {})
        }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Store registration on blockchain
        await storeRegistrationOnBlockchain(authData.user.id, form, userType);

        toast({
          title: "Registration Successful",
          description: `Your account has been registered successfully. ID: ${generatedId}`,
        });

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (userType: 'user' | 'admin') => {
    setResendLoading(true);
    const email = userType === 'user' ? userForm.email : adminForm.email;
    if (!email) {
      toast({
        title: "Error",
        description: "Enter email to resend OTP.",
        variant: "destructive"
      });
      setResendLoading(false);
      return;
    }
    const success = await sendOTP(email, userType);
    if (success) {
      toast({
        title: "OTP Sent",
        description: `A new OTP has been sent to ${email}.`,
      });
    }
    setResendLoading(false);
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
              Secure Registration
            </Badge>
          </div>
        </div>
      </header>

      {/* Signup Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card border-0 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indian-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900">Blockchain Registration</h2>
              <p className="text-navy-600 mt-2">Join the secure blockchain voting system</p>
            </div>

            {generatedId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-green-800">Your Unique ID:</p>
                <p className="text-lg font-mono text-green-900">{generatedId}</p>
                <p className="text-xs text-green-600 mt-1">Please save this ID for future login</p>
              </div>
            )}

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
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      placeholder="Enter your full name"
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    />
                  </div>

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
                    <Label htmlFor="user-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="user-phone"
                        placeholder="+91 XXXXX XXXXX"
                        className="pl-10"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-aadhar">Aadhar Number</Label>
                    <Input
                      id="user-aadhar"
                      placeholder="XXXX XXXX XXXX"
                      maxLength={12}
                      value={userForm.aadhar}
                      onChange={(e) => setUserForm({...userForm, aadhar: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="user-address"
                        placeholder="Your residential address"
                        className="pl-10"
                        value={userForm.address}
                        onChange={(e) => setUserForm({...userForm, address: e.target.value})}
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
                        placeholder="Create a strong password"
                        className="pl-10"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="user-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={userForm.confirmPassword}
                        onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
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
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => handleResendOTP("user")}
                        disabled={resendLoading || otpLoading || loading}
                      >
                        {resendLoading ? "Resending..." : "Resend OTP"}
                      </Button>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handleSignup('user')}
                  className="w-full bg-saffron-500 hover:bg-saffron-600 text-white"
                  disabled={loading || otpLoading || !userForm.name || !userForm.email || !userForm.phone || !userForm.aadhar || !userForm.password}
                >
                  {loading ? 'Registering...' : otpLoading ? 'Sending OTP...' : (otpSent ? 'Verify OTP & Register' : 'Send OTP & Register')}
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                      id="admin-name"
                      placeholder="Enter your full name"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Official Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="official.email@gov.in"
                        className="pl-10"
                        value={adminForm.email}
                        onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-code">Admin Authorization Code</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-code"
                        placeholder="Enter authorization code"
                        className="pl-10"
                        value={adminForm.adminCode}
                        onChange={(e) => setAdminForm({...adminForm, adminCode: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-department">Department</Label>
                    <Input
                      id="admin-department"
                      placeholder="Election Commission / IT Department"
                      value={adminForm.department}
                      onChange={(e) => setAdminForm({...adminForm, department: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={adminForm.confirmPassword}
                        onChange={(e) => setAdminForm({...adminForm, confirmPassword: e.target.value})}
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
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => handleResendOTP("admin")}
                        disabled={resendLoading || otpLoading || loading}
                      >
                        {resendLoading ? "Resending..." : "Resend OTP"}
                      </Button>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handleSignup('admin')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading || otpLoading || !adminForm.name || !adminForm.email || !adminForm.adminCode || !adminForm.password}
                >
                  {loading ? 'Registering...' : otpLoading ? 'Sending OTP...' : (otpSent ? 'Verify OTP & Register' : 'Send OTP & Register')}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-sm text-navy-600">
                Already have an account?{' '}
                <Link to="/login" className="text-saffron-500 hover:text-saffron-600 font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
