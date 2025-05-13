
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cog, Check, X, AlertTriangle } from 'lucide-react';
import { configStore, updateServerConfig } from '../utils/configStore';
import { checkServerHealth } from '../services/apiService';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServerConfigProps {
  onClose: () => void;
}

const ServerConfig: React.FC<ServerConfigProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = useState(configStore.serverUrl);
  const [serverPort, setServerPort] = useState(configStore.serverPort);
  const [ngrokUrl, setNgrokUrl] = useState(configStore.ngrokUrl || '');
  const [corsProxy, setCorsProxy] = useState(configStore.corsProxy || '');
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<string>(ngrokUrl ? 'ngrok' : 'direct');

  useEffect(() => {
    // Initialize health status based on current configuration
    // Fix: Convert string to boolean using Boolean() instead of directly assigning
    const hasConfig = activeTab === 'ngrok' ? Boolean(ngrokUrl) : Boolean(serverUrl);
    setHealthStatus(hasConfig ? null : false);
  }, [activeTab, ngrokUrl, serverUrl]);

  const handleSave = async () => {
    // Update configuration based on the active tab
    updateServerConfig(
      serverUrl, 
      serverPort,
      activeTab === 'ngrok' ? ngrokUrl : '',
      activeTab === 'cors' ? corsProxy : ''
    );
    
    setIsCheckingHealth(true);
    const isHealthy = await checkServerHealth();
    setIsCheckingHealth(false);
    setHealthStatus(isHealthy);
    
    if (isHealthy) {
      toast({
        title: "Server configuration saved",
        description: "Connection to server verified successfully",
      });
      onClose();
    } else {
      toast({
        title: "Server connection failed",
        description: "Could not connect to server. Check your configuration settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Cog className="h-5 w-5" />
          Server Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <AlertDescription className="text-blue-700">
            <strong>Docker Mode:</strong> The app is configured to automatically connect to the API proxy when running in Docker.
            If you're using Docker, the API proxy will forward requests to the Mercedes container at port 8000.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="direct">Direct Connection</TabsTrigger>
            <TabsTrigger value="ngrok">Ngrok Forwarding</TabsTrigger>
            <TabsTrigger value="cors">CORS Proxy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct" className="space-y-4">
            <Alert className="bg-gray-50 border-gray-200 mb-4">
              <AlertDescription className="text-gray-700">
                Use direct connection to a local server or API proxy when running outside of Docker.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="server-url">Server URL</Label>
              <Input 
                id="server-url" 
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="server-port">Server Port</Label>
              <Input 
                id="server-port" 
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value)}
                placeholder="8081"
              />
              <p className="text-xs text-gray-500">
                Default port is 8081 for the API proxy (which forwards to Mercedes at port 8000)
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="ngrok" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <AlertDescription className="text-blue-700">
                Use ngrok URL when connecting to a server behind a firewall or running in WSL.
                Example: https://8695-109-205-220-22.ngrok-free.app
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="ngrok-url">Ngrok URL</Label>
              <Input 
                id="ngrok-url" 
                value={ngrokUrl}
                onChange={(e) => setNgrokUrl(e.target.value)}
                placeholder="https://8695-109-205-220-22.ngrok-free.app"
              />
              <p className="text-xs text-gray-500">
                Enter the full ngrok URL without the port number
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="cors" className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700">
                Use a CORS proxy when connecting to a local backend from the hosted Lovable app.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="server-url">Server URL</Label>
              <Input 
                id="server-url" 
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="server-port">Server Port</Label>
              <Input 
                id="server-port" 
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value)}
                placeholder="8081"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cors-proxy">CORS Proxy URL</Label>
              <Input 
                id="cors-proxy" 
                value={corsProxy}
                onChange={(e) => setCorsProxy(e.target.value)}
                placeholder="https://cors-anywhere.herokuapp.com/"
              />
              <p className="text-xs text-gray-500">
                Example: https://cors-anywhere.herokuapp.com/ or https://corsproxy.io/?
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {healthStatus !== null && (
          <div className={`flex items-center gap-2 text-sm ${healthStatus ? 'text-green-600' : 'text-red-600'}`}>
            {healthStatus ? (
              <>
                <Check className="h-4 w-4" />
                Server connection successful
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Server connection failed
              </>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isCheckingHealth || 
              (activeTab === 'direct' && (!serverUrl || !serverPort)) || 
              (activeTab === 'ngrok' && !ngrokUrl) || 
              (activeTab === 'cors' && (!serverUrl || !serverPort || !corsProxy))}
          >
            {isCheckingHealth ? 'Testing Connection...' : 'Save & Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerConfig;
