
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseOTPReturn {
  sendOTP: (email: string, userType: 'user' | 'admin') => Promise<boolean>;
  verifyOTP: (email: string, otpCode: string) => Promise<boolean>;
  isLoading: boolean;
}

export const useOTP = (): UseOTPReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendOTP = async (email: string, userType: 'user' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email, userType }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (data?.success) {
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${email}`,
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
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('verify_otp', { 
          p_email: email, 
          p_otp_code: otpCode 
        });

      if (error) {
        console.error('Error verifying OTP:', error);
        toast({
          title: "Error",
          description: "Failed to verify OTP. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (data) {
        toast({
          title: "Success",
          description: "OTP verified successfully!",
        });
        return true;
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP code is invalid or has expired. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendOTP, verifyOTP, isLoading };
};
