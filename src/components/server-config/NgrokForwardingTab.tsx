
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NgrokForwardingTabProps {
  ngrokUrl: string;
  setNgrokUrl: (url: string) => void;
}

const NgrokForwardingTab: React.FC<NgrokForwardingTabProps> = ({
  ngrokUrl,
  setNgrokUrl
}) => {
  return (
    <>
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
    </>
  );
};

export default NgrokForwardingTab;
