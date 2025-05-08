
import * as XLSX from 'xlsx';

export interface ExcelData {
  headers: string[];
  rows: Record<string, string | number>[];
  previewRows: Record<string, string | number>[];
}

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Extract headers
        const headers = Object.keys(jsonData[0] || {});
        
        // Create preview (first 5 rows)
        const previewRows = jsonData.slice(0, 5);
        
        resolve({
          headers,
          rows: jsonData as Record<string, string | number>[],
          previewRows: previewRows as Record<string, string | number>[]
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
