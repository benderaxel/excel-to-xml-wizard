
// Configuration store for server settings
type ConfigStore = {
  serverUrl: string;
  serverPort: string;
  getApiUrl: () => string;
}

// Default configuration
const defaultConfig: ConfigStore = {
  serverUrl: 'http://localhost',
  serverPort: '3001',
  getApiUrl: function() {
    return `${this.serverUrl}:${this.serverPort}`;
  }
};

// Create a singleton config store
export const configStore: ConfigStore = {
  ...defaultConfig
};

// Update server configuration
export const updateServerConfig = (url: string, port: string) => {
  configStore.serverUrl = url;
  configStore.serverPort = port;
};
