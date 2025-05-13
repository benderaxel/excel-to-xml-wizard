
import React from 'react';
import { Check, X } from 'lucide-react';

interface ServerHealthStatusProps {
  healthStatus: boolean | null;
}

const ServerHealthStatus: React.FC<ServerHealthStatusProps> = ({ healthStatus }) => {
  if (healthStatus === null) return null;
  
  return (
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
  );
};

export default ServerHealthStatus;
