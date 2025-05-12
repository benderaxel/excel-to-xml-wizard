
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
  serverPort: '8081', // Point to our proxy server instead of Mercedes directly
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
    // When running in Docker, we connect to the API proxy container
    const isDockerEnvironment = window.location.hostname === 'localhost' && 
                               window.location.port === '8080';
                               
    if (isDockerEnvironment) {
      return `http://localhost:8081/api`;
    }
    
    return `${this.serverUrl}:${this.serverPort}/api`;
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
