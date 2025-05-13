
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface CorsProxyTabProps {
  serverUrl: string;
  setServerUrl: (url: string) => void;
  serverPort: string;
  setServerPort: (port: string) => void;
  corsProxy: string;
  setCorsProxy: (url: string) => void;
}

const CorsProxyTab: React.FC<CorsProxyTabProps> = ({
  serverUrl,
  setServerUrl,
  serverPort,
  setServerPort,
  corsProxy,
  setCorsProxy
}) => {
  return (
    <>
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
    </>
  );
};

export default CorsProxyTab;
