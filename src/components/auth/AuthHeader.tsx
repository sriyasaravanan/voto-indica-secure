
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Vote, Shield, ArrowLeft } from "lucide-react";

export const AuthHeader = () => {
  return (
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
  );
};
