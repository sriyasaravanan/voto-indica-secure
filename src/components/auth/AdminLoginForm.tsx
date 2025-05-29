
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

interface AdminLoginFormProps {
  adminForm: { adminId: string; password: string; otp: string };
  setAdminForm: (form: { adminId: string; password: string; otp: string }) => void;
  otpSent: boolean;
  isLoading: boolean;
  onLogin: () => void;
}

export const AdminLoginForm = ({ 
  adminForm, 
  setAdminForm, 
  otpSent, 
  isLoading, 
  onLogin 
}: AdminLoginFormProps) => {
  return (
    <div className="space-y-4">
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

      {otpSent && (
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
        onClick={onLogin}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={!adminForm.adminId || !adminForm.password || (otpSent && !adminForm.otp) || isLoading}
      >
        {isLoading ? 'Processing...' : (otpSent ? 'Verify & Login to Blockchain' : 'Send OTP & Login')}
      </Button>
    </div>
  );
};
