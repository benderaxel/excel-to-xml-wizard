
// Configuration store for server settings
type ConfigStore = {
  serverUrl: string;
  serverPort: string;
  getApiUrl: () => string;
  corsProxy?: string;
}

// Default configuration
const defaultConfig: ConfigStore = {
  serverUrl: 'http://localhost',
  serverPort: '3001',
  corsProxy: '',
  getApiUrl: function() {
    // If corsProxy is set, use it as a prefix
    return this.corsProxy 
      ? `${this.corsProxy}${this.serverUrl}:${this.serverPort}`
      : `${this.serverUrl}:${this.serverPort}`;
  }
};

// Create a singleton config store
export const configStore: ConfigStore = {
  ...defaultConfig
};

// Update server configuration
export const updateServerConfig = (url: string, port: string, corsProxy?: string) => {
  configStore.serverUrl = url;
  configStore.serverPort = port;
  configStore.corsProxy = corsProxy || '';
};
