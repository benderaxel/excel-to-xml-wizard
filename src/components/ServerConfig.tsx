
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cog, Check, X } from 'lucide-react';
import { configStore, updateServerConfig } from '../utils/configStore';
import { checkServerHealth } from '../services/apiService';
import { useToast } from "@/hooks/use-toast";

interface ServerConfigProps {
  onClose: () => void;
}

const ServerConfig: React.FC<ServerConfigProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = useState(configStore.serverUrl);
  const [serverPort, setServerPort] = useState(configStore.serverPort);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);

  const handleSave = async () => {
    updateServerConfig(serverUrl, serverPort);
    
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
        description: "Could not connect to server. Check URL and port.",
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
            placeholder="3001"
          />
        </div>
        
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
            disabled={isCheckingHealth || !serverUrl || !serverPort}
          >
            {isCheckingHealth ? 'Testing Connection...' : 'Save & Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerConfig;
