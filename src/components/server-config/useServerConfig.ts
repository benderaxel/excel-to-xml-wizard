
import { useState, useEffect } from 'react';
import { configStore, updateServerConfig } from '@/utils/configStore';
import { checkServerHealth } from '@/services/apiService';
import { useToast } from "@/hooks/use-toast";

export const useServerConfig = (onClose: () => void) => {
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

  return {
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
    activeTab,
    setActiveTab,
    handleSave
  };
};
