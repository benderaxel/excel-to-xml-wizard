
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useServerConfig } from './useServerConfig';
import DirectConnectionTab from './DirectConnectionTab';
import NgrokForwardingTab from './NgrokForwardingTab';
import CorsProxyTab from './CorsProxyTab';
import ServerHealthStatus from './ServerHealthStatus';

interface ServerConfigProps {
  onClose: () => void;
}

const ServerConfigModal: React.FC<ServerConfigProps> = ({ onClose }) => {
  const { 
    activeTab, 
    setActiveTab, 
    serverUrl, 
    setServerUrl,
    serverPort, 
    setServerPort,
    ngrokUrl, 
    setNgrokUrl,
    corsProxy, 
    setCorsProxy,
    isCheckingHealth,
    healthStatus,
    handleSave
  } = useServerConfig(onClose);

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
            <DirectConnectionTab 
              serverUrl={serverUrl}
              setServerUrl={setServerUrl}
              serverPort={serverPort}
              setServerPort={setServerPort}
            />
          </TabsContent>
          
          <TabsContent value="ngrok" className="space-y-4">
            <NgrokForwardingTab 
              ngrokUrl={ngrokUrl}
              setNgrokUrl={setNgrokUrl}
            />
          </TabsContent>
          
          <TabsContent value="cors" className="space-y-4">
            <CorsProxyTab 
              serverUrl={serverUrl}
              setServerUrl={setServerUrl}
              serverPort={serverPort}
              setServerPort={setServerPort}
              corsProxy={corsProxy}
              setCorsProxy={setCorsProxy}
            />
          </TabsContent>
        </Tabs>
        
        <ServerHealthStatus healthStatus={healthStatus} />
        
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

export default ServerConfigModal;
