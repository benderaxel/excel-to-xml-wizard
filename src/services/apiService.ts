
import { configStore } from "../utils/configStore";
import { ExcelData, parseExcelFile } from "../utils/excelParser";

export type ServerResponse = {
  success: boolean;
  message: string;
  data?: any;
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
      // No need to set Content-Type as it's automatically set for FormData
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
      data: { serverResponse: result, excelData: data }
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
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.health === true;
  } catch (error) {
    console.error('Health check error:', error);
    return false;
  }
};
