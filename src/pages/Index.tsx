
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Shield, Eye, Users, Lock, CheckCircle } from "lucide-react";

const Index = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Blockchain Security",
      description: "Immutable voting records with cryptographic verification",
      detail: "Every vote is secured by blockchain technology, making tampering impossible"
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Full Transparency",
      description: "Real-time public audit trail for complete election oversight",
      detail: "Watch votes being counted in real-time with complete transparency"
    },
    {
      icon: <Vote className="h-8 w-8" />,
      title: "Secure Voting",
      description: "Anonymous yet verifiable digital voting system",
      detail: "Cast your vote securely while maintaining complete anonymity"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Digital Identity",
      description: "Government-verified digital identity authentication",
      detail: "Secure authentication using government-issued digital credentials"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 blockchain-grid opacity-30"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-saffron-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indian-gradient rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-900">भारत वोट</h1>
                <p className="text-sm text-navy-600">Blockchain Voting Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Government Certified
              </Badge>
              <Badge variant="outline" className="border-saffron-500 text-saffron-700">
                <Shield className="h-3 w-3 mr-1" />
                Blockchain Secured
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-navy-900 mb-6 leading-tight">
              The Future of
              <span className="bg-indian-gradient bg-clip-text text-transparent"> Democratic Voting</span>
            </h2>
            <p className="text-xl text-navy-600 mb-8 leading-relaxed">
              Experience the next generation of electoral democracy with blockchain-powered voting. 
              Secure, transparent, and tamper-proof elections for every citizen of India.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button size="lg" className="bg-saffron-500 hover:bg-saffron-600 text-white px-8 py-4 text-lg animate-blockchain-pulse">
                  <Vote className="mr-2 h-5 w-5" />
                  Start Voting Now
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="border-green-500 text-green-700 hover:bg-green-50 px-8 py-4 text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Register to Vote
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="glass-card rounded-2xl p-6 vote-card-hover">
                <div className="text-3xl font-bold text-saffron-600">100%</div>
                <div className="text-navy-600">Secure & Verified</div>
              </div>
              <div className="glass-card rounded-2xl p-6 vote-card-hover">
                <div className="text-3xl font-bold text-green-600">24/7</div>
                <div className="text-navy-600">Real-time Monitoring</div>
              </div>
              <div className="glass-card rounded-2xl p-6 vote-card-hover">
                <div className="text-3xl font-bold text-navy-600">∞</div>
                <div className="text-navy-600">Immutable Records</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-navy-900 mb-12">
            Powered by Advanced Blockchain Technology
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 vote-card-hover cursor-pointer glass-card border-0"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="text-saffron-500 mb-4">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-navy-900 mb-3">{feature.title}</h4>
                <p className="text-navy-600 text-sm leading-relaxed">
                  {hoveredFeature === index ? feature.detail : feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-navy-900 mb-12">
            How Blockchain Voting Works
          </h3>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-saffron-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-navy-900 mb-3">1. Secure Authentication</h4>
                <p className="text-navy-600">Verify your identity using government-issued digital credentials</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-navy-900 mb-3">2. Cast Your Vote</h4>
                <p className="text-navy-600">Select your candidates and cast your vote securely on the blockchain</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-secure-glow">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-navy-900 mb-3">3. Verify & Track</h4>
                <p className="text-navy-600">Get instant confirmation and track your vote on the public ledger</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-navy-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-indian-gradient rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold">भारत वोट</h4>
                <p className="text-sm text-gray-300">Government of India</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Ensuring democratic participation through secure blockchain technology
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <span>Ministry of Electronics & IT</span>
              <span>•</span>
              <span>Election Commission of India</span>
              <span>•</span>
              <span>Digital India Initiative</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
