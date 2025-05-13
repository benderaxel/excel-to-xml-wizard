
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DirectConnectionTabProps {
  serverUrl: string;
  setServerUrl: (url: string) => void;
  serverPort: string;
  setServerPort: (port: string) => void;
}

const DirectConnectionTab: React.FC<DirectConnectionTabProps> = ({
  serverUrl,
  setServerUrl,
  serverPort,
  setServerPort
}) => {
  return (
    <>
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
    </>
  );
};

export default DirectConnectionTab;
