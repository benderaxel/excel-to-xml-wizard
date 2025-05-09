
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
      // Add CORS mode and credentials
      mode: 'cors',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
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
