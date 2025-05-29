
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

interface UserLoginFormProps {
  userForm: { email: string; password: string; otp: string };
  setUserForm: (form: { email: string; password: string; otp: string }) => void;
  otpSent: boolean;
  isLoading: boolean;
  onLogin: () => void;
}

export const UserLoginForm = ({ 
  userForm, 
  setUserForm, 
  otpSent, 
  isLoading, 
  onLogin 
}: UserLoginFormProps) => {
  return (
    <div className="space-y-4">
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

      {otpSent && (
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
        onClick={onLogin}
        className="w-full bg-saffron-500 hover:bg-saffron-600 text-white"
        disabled={!userForm.email || !userForm.password || (otpSent && !userForm.otp) || isLoading}
      >
        {isLoading ? 'Processing...' : (otpSent ? 'Verify & Login to Blockchain' : 'Send OTP & Login')}
      </Button>
    </div>
  );
};
