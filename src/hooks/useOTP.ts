
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
      console.log('Sending OTP to:', email, 'for user type:', userType);
      
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

      console.log('OTP send response:', data);

      if (data?.success) {
        return true;
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to send OTP. Please try again.",
          variant: "destructive"
        });
        return false;
      }
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
      console.log('Verifying OTP for:', email, 'with code:', otpCode);
      
      const { data, error } = await supabase
        .rpc('verify_otp', { 
          p_email: email, 
          p_otp_code: otpCode 
        });

      if (error) {
        console.error('Error verifying OTP:', error);
        return false;
      }

      console.log('OTP verification result:', data);

      if (data) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendOTP, verifyOTP, isLoading };
};
