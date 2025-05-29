
import { Shield } from "lucide-react";

export const LoginFormHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-indian-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
        <Shield className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-navy-900">Blockchain Login</h2>
      <p className="text-navy-600 mt-2">Secure blockchain-verified authentication</p>
    </div>
  );
};
