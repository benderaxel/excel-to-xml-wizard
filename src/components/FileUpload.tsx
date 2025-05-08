import React, { useCallback, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ArrowRight, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { parseExcelFile, ExcelData } from '../utils/excelParser';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadProps {
  onFileProcessed: (data: ExcelData) => void;
  onInitiateProcessing: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, onInitiateProcessing }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<ExcelData | null>(null);
  
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid file format",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }
    
    setFileName(file.name);
    setIsProcessing(true);
    setUploadSuccess(false);
    
    try {
      const data = await parseExcelFile(file);
      setParsedData(data);
      setUploadSuccess(true);
      toast({
        title: "File uploaded successfully",
        description: `Processed ${data.rows.length} rows with ${data.headers.length} columns`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: "There was an error reading the Excel file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);
  
  const handleProcessData = () => {
    if (parsedData) {
      onFileProcessed(parsedData);
      onInitiateProcessing();
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange} 
          />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center space-y-4">
              {fileName ? (
                <>
                  <FileText className="h-12 w-12 text-blue-500" />
                  <p className="font-medium text-gray-900">{fileName}</p>
                  {isProcessing ? (
                    <p className="text-sm text-gray-500">Processing file...</p>
                  ) : (
                    <p className="text-sm text-green-500">File uploaded</p>
                  )}
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">Drag and drop your Excel file here</p>
                    <p className="text-sm text-gray-500">or click to browse files</p>
                    <p className="text-xs text-gray-400">(Supported formats: .xlsx, .xls)</p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
        
        {uploadSuccess && (
          <div className="mt-4 space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Excel file successfully uploaded and parsed! {parsedData?.rows.length} rows are ready for processing.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleProcessData}
                className="gap-2"
              >
                Process <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {fileName && !isProcessing && !uploadSuccess && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline"
              onClick={() => {
                setFileName(null);
                setUploadSuccess(false);
                setParsedData(null);
                document.getElementById('file-upload') && ((document.getElementById('file-upload') as HTMLInputElement).value = '');
              }}
            >
              Upload another file
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
