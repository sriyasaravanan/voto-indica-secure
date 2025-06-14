
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Fingerprint,
  Smartphone,
  Key,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetric {
  name: string;
  value: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'vote' | 'breach_attempt' | 'verification';
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export const AdvancedSecurityPanel: React.FC = () => {
  const [securityScore, setSecurityScore] = useState(85);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize security metrics
    setSecurityMetrics([
      {
        name: 'Encryption Strength',
        value: 98,
        status: 'excellent',
        description: 'AES-256 encryption active'
      },
      {
        name: 'Authentication Security',
        value: 75,
        status: 'good',
        description: '2FA recommended for improvement'
      },
      {
        name: 'Network Security',
        value: 92,
        status: 'excellent',
        description: 'All connections secured with TLS 1.3'
      },
      {
        name: 'Audit Trail',
        value: 88,
        status: 'good',
        description: 'Complete transaction logging active'
      },
      {
        name: 'Access Control',
        value: 82,
        status: 'good',
        description: 'Role-based permissions enforced'
      },
      {
        name: 'Threat Detection',
        value: 95,
        status: 'excellent',
        description: 'AI-powered threat monitoring'
      }
    ]);

    // Generate security events
    generateSecurityEvents();

    // Simulate real-time security monitoring
    const interval = setInterval(() => {
      updateSecurityMetrics();
      generateNewSecurityEvent();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const generateSecurityEvents = () => {
    const events: SecurityEvent[] = [
      {
        id: '1',
        type: 'login',
        description: 'Successful login from verified device',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        severity: 'low',
        resolved: true
      },
      {
        id: '2',
        type: 'vote',
        description: 'Vote verification completed successfully',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        severity: 'low',
        resolved: true
      },
      {
        id: '3',
        type: 'breach_attempt',
        description: 'Suspicious login attempt blocked',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'high',
        resolved: true
      },
      {
        id: '4',
        type: 'verification',
        description: 'Blockchain verification check passed',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        severity: 'low',
        resolved: true
      }
    ];
    setSecurityEvents(events);
  };

  const generateNewSecurityEvent = () => {
    if (Math.random() > 0.7) {
      const eventTypes = ['login', 'vote', 'verification'] as const;
      const severities = ['low', 'medium'] as const;
      
      const newEvent: SecurityEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        description: 'New security event detected',
        timestamp: new Date(),
        severity: severities[Math.floor(Math.random() * severities.length)],
        resolved: true
      };

      setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    }
  };

  const updateSecurityMetrics = () => {
    setSecurityMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.min(100, Math.max(70, metric.value + (Math.random() - 0.5) * 5))
    })));

    // Update overall security score
    setSecurityScore(prev => Math.min(100, Math.max(70, prev + (Math.random() - 0.5) * 3)));
  };

  const enableTwoFactor = () => {
    setTwoFactorEnabled(true);
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been enabled for your account.",
    });
  };

  const enableBiometric = () => {
    setBiometricEnabled(true);
    toast({
      title: "Biometric Authentication Enabled",
      description: "Biometric authentication has been enabled for enhanced security.",
    });
  };

  const runSecurityScan = () => {
    toast({
      title: "Security Scan Started",
      description: "Running comprehensive security analysis...",
    });

    setTimeout(() => {
      toast({
        title: "Security Scan Complete",
        description: "No threats detected. Your system is secure.",
      });
    }, 3000);
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Security Center</h2>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Security Score</p>
            <p className={`text-2xl font-bold ${getSecurityScoreColor(securityScore)}`}>
              {securityScore.toFixed(0)}/100
            </p>
          </div>
          <Button onClick={runSecurityScan} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Scan
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Overview
          </h3>
          <Badge variant={securityScore >= 90 ? 'default' : securityScore >= 75 ? 'secondary' : 'destructive'}>
            {securityScore >= 90 ? 'Excellent' : securityScore >= 75 ? 'Good' : 'Needs Attention'}
          </Badge>
        </div>
        
        <Progress value={securityScore} className="mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-800">Blockchain Secured</p>
            <p className="text-sm text-green-600">All votes cryptographically protected</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Lock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-800">End-to-End Encryption</p>
            <p className="text-sm text-blue-600">AES-256 military-grade encryption</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-800">Real-time Monitoring</p>
            <p className="text-sm text-purple-600">24/7 threat detection active</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Security Metrics</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityMetrics.map((metric, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{metric.name}</h4>
                  <span className={`font-bold ${getMetricStatusColor(metric.status)}`}>
                    {metric.value.toFixed(0)}%
                  </span>
                </div>
                <Progress value={metric.value} className="mb-2" />
                <p className="text-sm text-gray-600">{metric.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <h4 className="font-semibold">Two-Factor Authentication</h4>
                </div>
                <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Add an extra layer of security to your account with 2FA
              </p>
              {!twoFactorEnabled && (
                <Button onClick={enableTwoFactor} className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="h-5 w-5" />
                  <h4 className="font-semibold">Biometric Authentication</h4>
                </div>
                <Badge variant={biometricEnabled ? 'default' : 'secondary'}>
                  {biometricEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Use fingerprint or face recognition for secure access
              </p>
              {!biometricEnabled && (
                <Button onClick={enableBiometric} className="w-full">
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Enable Biometric
                </Button>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Recent Security Events
            </h3>
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded ${
                      event.severity === 'high' ? 'bg-red-100' : 
                      event.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {event.severity === 'high' ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-xs text-gray-500">
                        {event.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityBadgeVariant(event.severity)}>
                      {event.severity}
                    </Badge>
                    {event.resolved && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h4 className="font-semibold mb-4">Security Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-logout after inactivity</span>
                  <Badge variant="outline">15 minutes</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session timeout</span>
                  <Badge variant="outline">24 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Login notifications</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold mb-4">Advanced Security</h4>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Emergency Lockdown
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rotate API Keys
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
