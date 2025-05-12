
// Configuration store for server settings
type ConfigStore = {
  serverUrl: string;
  serverPort: string;
  ngrokUrl: string;
  getApiUrl: () => string;
  corsProxy?: string;
}

// Default configuration
const defaultConfig: ConfigStore = {
  serverUrl: 'http://localhost',
  serverPort: '3001',
  ngrokUrl: '',
  corsProxy: '',
  getApiUrl: function() {
    // First priority: If ngrokUrl is set, use it directly
    if (this.ngrokUrl) {
      return this.ngrokUrl;
    }
    
    // Second priority: If corsProxy is set, use it as a prefix for the regular URL
    if (this.corsProxy) {
      return `${this.corsProxy}${this.serverUrl}:${this.serverPort}`;
    }
    
    // Default: use direct server URL with port
    return `${this.serverUrl}:${this.serverPort}`;
  }
};

// Create a singleton config store
export const configStore: ConfigStore = {
  ...defaultConfig
};

// Update server configuration
export const updateServerConfig = (
  url: string, 
  port: string, 
  ngrokUrl: string = '', 
  corsProxy?: string
) => {
  configStore.serverUrl = url;
  configStore.serverPort = port;
  configStore.ngrokUrl = ngrokUrl;
  configStore.corsProxy = corsProxy || '';
};
