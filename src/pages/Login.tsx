
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from "lucide-react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginFormHeader } from "@/components/auth/LoginFormHeader";
import { UserLoginForm } from "@/components/auth/UserLoginForm";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { useLoginLogic } from "@/hooks/useLoginLogic";

const Login = () => {
  const {
    userForm,
    setUserForm,
    adminForm,
    setAdminForm,
    otpSent,
    currentTab,
    setCurrentTab,
    isLoading,
    handleLogin
  } = useLoginLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 relative overflow-hidden">
      <div className="absolute inset-0 blockchain-grid opacity-20"></div>
      
      <AuthHeader />

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card border-0 p-8">
            <LoginFormHeader />

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
                <UserLoginForm
                  userForm={userForm}
                  setUserForm={setUserForm}
                  otpSent={otpSent && currentTab === "user"}
                  isLoading={isLoading}
                  onLogin={() => handleLogin('user')}
                />
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <AdminLoginForm
                  adminForm={adminForm}
                  setAdminForm={setAdminForm}
                  otpSent={otpSent && currentTab === "admin"}
                  isLoading={isLoading}
                  onLogin={() => handleLogin('admin')}
                />
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
