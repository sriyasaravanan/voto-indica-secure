
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
  const { sendOTP, verifyOTP, isLoading: otpLoading } = useOTP();
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
      }
      return success;
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

      if (!otpSent) {
        const otpSent = await handleSendOTP(userType);
        return;
      }

      const email = userType === 'user' ? userForm.email : adminForm.adminId;
      const otp = userType === 'user' ? userForm.otp : adminForm.otp;
      const password = userType === 'user' ? userForm.password : adminForm.password;
      
      if (!otp) {
        toast({
          title: "Error",
          description: "Please enter the OTP code",
          variant: "destructive"
        });
        return;
      }

      if (!password) {
        toast({
          title: "Error",
          description: "Please enter your password",
          variant: "destructive"
        });
        return;
      }

      // Verify OTP first
      console.log('Verifying OTP for:', email);
      const isValid = await verifyOTP(email, otp);
      
      if (!isValid) {
        toast({
          title: "Invalid OTP",
          description: "The OTP code is incorrect or has expired. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('OTP verified, attempting authentication...');

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        console.log('Sign in failed, attempting sign up...', signInError.message);
        
        if (signInError.message.includes('Invalid login credentials')) {
          // Try to sign up if user doesn't exist
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: undefined,
            }
          });

          if (signUpError) {
            console.error('Sign up error:', signUpError);
            toast({
              title: "Authentication Error",
              description: signUpError.message || "Failed to create account",
              variant: "destructive"
            });
            return;
          }

          if (signUpData.user) {
            console.log('User created successfully:', signUpData.user.id);
            await createProfile(signUpData.user.id, email, userType === 'user' ? 'voter' : 'admin');
            await storeLoginOnBlockchain(signUpData.user.id, email, userType);
            
            toast({
              title: "Account Created Successfully",
              description: "You have been logged in",
            });

            // Navigate based on user type
            if (userType === 'user') {
              navigate('/user-dashboard');
            } else {
              navigate('/admin-dashboard');
            }
          }
        } else {
          toast({
            title: "Login Failed",
            description: signInError.message || "Please check your credentials and try again",
            variant: "destructive"
          });
        }
        return;
      }

      if (signInData.user) {
        console.log('User signed in successfully:', signInData.user.id);
        await storeLoginOnBlockchain(signInData.user.id, email, userType);
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        // Navigate based on user type
        if (userType === 'user') {
          navigate('/user-dashboard');
        } else {
          navigate('/admin-dashboard');
        }
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
    isLoading: isProcessing || otpLoading,
    handleLogin
  };
};
