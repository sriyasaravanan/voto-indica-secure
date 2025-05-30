
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOTP } from "@/hooks/useOTP";
import { useAuth } from "@/hooks/useAuth";

export const useLoginLogic = () => {
  const [userForm, setUserForm] = useState({ email: "", password: "", otp: "" });
  const [adminForm, setAdminForm] = useState({ adminId: "", password: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [currentTab, setCurrentTab] = useState("user");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendOTP, verifyOTP } = useOTP();
  const { createProfile } = useAuth();

  const storeLoginOnBlockchain = async (userId: string, email: string, userType: string) => {
    try {
      const loginData = {
        user_id: userId,
        email: email,
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

  const handleSendOTP = async (userType: string) => {
    const email = userType === 'user' ? userForm.email : adminForm.adminId;
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsProcessing(true);
      const success = await sendOTP(email, userType as 'user' | 'admin');
      if (success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (userType: string) => {
    try {
      setIsProcessing(true);

      const email = userType === 'user' ? userForm.email : adminForm.adminId;
      const password = userType === 'user' ? userForm.password : adminForm.password;
      const otp = userType === 'user' ? userForm.otp : adminForm.otp;

      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please enter your email and password",
          variant: "destructive"
        });
        return;
      }

      // If OTP not sent yet, send it first
      if (!otpSent) {
        const otpSuccess = await handleSendOTP(userType);
        if (!otpSuccess) {
          toast({
            title: "Error",
            description: "Failed to send OTP. Please try again.",
            variant: "destructive"
          });
        }
        return;
      }

      if (!otp) {
        toast({
          title: "Error",
          description: "Please enter the OTP code",
          variant: "destructive"
        });
        return;
      }

      // Verify OTP
      const isValidOTP = await verifyOTP(email, otp);
      if (!isValidOTP) {
        toast({
          title: "Invalid OTP",
          description: "The OTP code is incorrect or has expired. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        // If user doesn't exist, create account
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
          });

          if (signUpError) {
            toast({
              title: "Authentication Error",
              description: signUpError.message || "Failed to create account",
              variant: "destructive"
            });
            return;
          }

          if (signUpData.user) {
            await createProfile(signUpData.user.id, email, userType === 'user' ? 'voter' : 'admin');
            await storeLoginOnBlockchain(signUpData.user.id, email, userType);
            
            toast({
              title: "Account Created Successfully",
              description: "You have been logged in",
            });

            navigate(userType === 'user' ? '/user-dashboard' : '/admin-dashboard');
          }
        } else {
          toast({
            title: "Login Failed",
            description: signInError.message || "Please check your credentials",
            variant: "destructive"
          });
        }
        return;
      }

      if (signInData.user) {
        await storeLoginOnBlockchain(signInData.user.id, email, userType);
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        navigate(userType === 'user' ? '/user-dashboard' : '/admin-dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    userForm,
    setUserForm,
    adminForm,
    setAdminForm,
    otpSent,
    currentTab,
    setCurrentTab,
    isLoading: isProcessing,
    handleLogin
  };
};
