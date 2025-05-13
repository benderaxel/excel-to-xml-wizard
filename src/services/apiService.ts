
import { configStore } from "../utils/configStore";
import { ExcelData, parseExcelFile } from "../utils/excelParser";

export type ServerResponse = {
  success: boolean;
  message: string;
  data?: any;
  statusCode?: number;
};

export const uploadFile = async (file: File): Promise<ServerResponse> => {
  try {
    const apiUrl = `${configStore.getApiUrl()}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    
    console.log(`Uploading file to ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      // Important: Don't set Content-Type header when sending FormData
      // The browser will automatically set it with the correct boundary
      mode: 'cors',
      credentials: 'include',
    });
    
    console.log('Upload response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    
    // Parse the server response
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.log('Response is not JSON:', text);
      result = { message: text };
    }
    
    // Also parse the Excel file locally for preview
    const data = await parseExcelFile(file);
    
    return {
      success: true,
      message: "File uploaded successfully",
      data: { serverResponse: result, excelData: data },
      statusCode: response.status
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred during upload"
    };
  }
};

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    // First check our proxy health
    const proxyHealthUrl = window.location.port === '8080' 
      ? 'http://localhost:8081/proxy-health'
      : `${configStore.serverUrl}:${configStore.serverPort}/proxy-health`;
      
    try {
      const proxyResponse = await fetch(proxyHealthUrl, {
        mode: 'cors',
        credentials: 'include',
      });
      
      if (proxyResponse.ok) {
        console.log('API Proxy is healthy');
      } else {
        console.warn('API Proxy health check failed');
      }
    } catch (proxyError) {
      console.warn('Could not reach API proxy:', proxyError);
    }
    
    // Now check the actual Mercedes API health
    const apiUrl = `${configStore.getApiUrl()}/health`;
    console.log(`Checking server health at: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      // Add CORS mode and credentials
      mode: 'cors',
      credentials: 'include',
    });
    
    console.log(`Health check response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Health check failed with status: ${response.status}`);
      return false;
    }
    
    const result = await response.json();
    console.log('Health check result:', result);
    return result.health === true;
  } catch (error) {
    console.error('Health check error:', error);
    return false;
  }
};

export const ingestLocalData = async (): Promise<ServerResponse> => {
  try {
    const apiUrl = `${configStore.getApiUrl()}/ingest`;
    console.log(`Ingesting local data from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      message: "Local data ingested successfully",
      data: result,
      statusCode: response.status
    };
  } catch (error) {
    console.error('Ingest error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred during ingestion"
    };
  }
};

export const queryDataGraph = async (query: string): Promise<ServerResponse> => {
  try {
    const apiUrl = `${configStore.getApiUrl()}/query?${query}`;
    console.log(`Querying data graph at: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      message: "Query executed successfully",
      data: result,
      statusCode: response.status
    };
  } catch (error) {
    console.error('Query error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred during query"
    };
  }
};
