import React, { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  ArrowRight,
  Check,
  Settings,
  X,
  Server,
  Database,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExcelData } from "../utils/excelParser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadFile, ingestLocalData } from "../services/apiService";
import { configStore } from "../utils/configStore";
import { useSession } from "@/hooks/useSession";

interface FileUploadProps {
  onFileProcessed: (data: ExcelData) => void;
  onInitiateProcessing: () => void;
  onShowConfig: () => void;
}

interface FileStatus {
  file: File;
  name: string;
  isProcessing: boolean;
  uploadSuccess: boolean;
  uploadError: string | null;
  parsedData: ExcelData | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileProcessed,
  onInitiateProcessing,
  onShowConfig,
}) => {
  const { sessionId } = useSession();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          title: "Invalid file format",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }

      setFileStatuses((prev) =>
        prev.map((status) => ({ ...status, isProcessing: false }))
      );

      setFileStatuses((prev) => [
        ...prev,
        {
          file,
          name: file.name,
          isProcessing: true,
          uploadSuccess: false,
          uploadError: null,
          parsedData: null,
        },
      ]);

      try {
        // Upload file to server
        const response = await uploadFile(file, sessionId);
        console.log("Upload response:", response);

        if (!response.success) {
          throw new Error(response.message);
        }

        setFileStatuses((prev) =>
          prev.map((status) =>
            status.file.name === file.name
              ? {
                  ...status,
                  isProcessing: false,
                  uploadSuccess: true,
                  parsedData: response.data.excelData,
                }
              : status
          )
        );

        toast({
          title: "File uploaded successfully",
          description: `Processed ${response.data.excelData.rows.length} rows with ${response.data.excelData.headers.length} columns`,
        });

        // After successful upload (200 OK), move to state 2
        if (response.statusCode === 200) {
          onFileProcessed(response.data.excelData);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        setFileStatuses((prev) =>
          prev.map((status) =>
            status.file.name === file.name
              ? {
                  ...status,
                  isProcessing: false,
                  uploadError:
                    error instanceof Error
                      ? error.message
                      : "Unknown error occurred",
                }
              : status
          )
        );
        toast({
          title: "Error processing file",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      }
    },
    [toast, onFileProcessed, sessionId]
  );

  const handleProcessData = async () => {
    setIsIngesting(true);

    try {
      const response = await ingestLocalData();

      if (!response.success) {
        throw new Error(response.message);
      }

      toast({
        title: "Data processed successfully",
        description: response.message,
      });

      // After successful processing (200 OK), move to state 3
      if (response.statusCode === 200) {
        onInitiateProcessing();
      }
    } catch (error) {
      console.error("Error processing data:", error);
      toast({
        title: "Error processing data",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(
        (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
      );

      if (validFiles.length < files.length) {
        toast({
          title: "Invalid file format",
          description:
            "Some files were skipped. Only Excel files (.xlsx or .xls) are supported",
          variant: "destructive",
        });
      }

      if (validFiles.length === 0) return;

      // Add new files to state
      const newFileStatuses = validFiles.map((file) => ({
        file,
        name: file.name,
        isProcessing: true,
        uploadSuccess: false,
        uploadError: null,
        parsedData: null,
      }));

      setFileStatuses((prev) => [...prev, ...newFileStatuses]);

      // Process each file
      for (let i = 0; i < newFileStatuses.length; i++) {
        const fileStatus = newFileStatuses[i];

        try {
          // Upload file to server
          const response = await uploadFile(fileStatus.file, sessionId);
          console.log("Upload response for", fileStatus.name, ":", response);

          if (!response.success) {
            throw new Error(response.message);
          }

          // Update state for this file
          setFileStatuses((prev) =>
            prev.map((fs) =>
              fs.name === fileStatus.name
                ? {
                    ...fs,
                    isProcessing: false,
                    uploadSuccess: true,
                    parsedData: response.data.excelData,
                    uploadError: null,
                  }
                : fs
            )
          );

          toast({
            title: `File ${fileStatus.name} uploaded successfully`,
            description: `Processed ${response.data.excelData.rows.length} rows with ${response.data.excelData.headers.length} columns`,
          });

          // Send data to parent component for the first successful file
          if (response.statusCode === 200 && i === 0) {
            onFileProcessed(response.data.excelData);
          }
        } catch (error) {
          console.error("Error processing file:", fileStatus.name, error);

          setFileStatuses((prev) =>
            prev.map((fs) =>
              fs.name === fileStatus.name
                ? {
                    ...fs,
                    isProcessing: false,
                    uploadError:
                      error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
                  }
                : fs
            )
          );

          toast({
            title: `Error processing ${fileStatus.name}`,
            description:
              error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive",
          });
        }
      }
    },
    [toast, onFileProcessed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(Array.from(e.target.files));
      }
    },
    [handleFiles]
  );

  // Helper function to get connection type description
  const getConnectionText = () => {
    if (configStore.ngrokUrl) {
      return `ngrok forwarding: ${configStore.ngrokUrl}/upload`;
    } else if (configStore.corsProxy) {
      return `CORS proxy: ${configStore.getApiUrl()}/upload`;
    } else {
      return `${configStore.getApiUrl()}/upload`;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowConfig}
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            Server Config
          </Button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
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
            multiple
            onChange={handleFileChange}
          />

          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center space-y-4">
              {fileStatuses.length > 0 ? (
                <>
                  <FileText className="h-12 w-12 text-blue-500" />
                  <p className="font-medium text-gray-900">
                    {fileStatuses.length} file(s) selected
                  </p>
                  <div className="text-sm">
                    {fileStatuses.some((f) => f.isProcessing) && (
                      <p className="text-gray-500">Processing files...</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      Drag and drop Excel files here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400">
                      (Supported formats: .xlsx, .xls)
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-xs text-gray-400 mt-2">
                    <Server className="h-3 w-3 mr-1" />
                    <span>Server: {getConnectionText()}</span>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>

        {/* File list */}
        {fileStatuses.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Files</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {fileStatuses.map((fileStatus, index) => (
                <div
                  key={fileStatus.name + index}
                  className="border rounded-md p-3 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{fileStatus.name}</p>
                      <p className="text-xs text-gray-500">
                        {fileStatus.isProcessing
                          ? "Processing..."
                          : fileStatus.uploadSuccess
                          ? "Uploaded successfully"
                          : fileStatus.uploadError
                          ? `Error: ${fileStatus.uploadError}`
                          : "Ready"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {fileStatus.uploadSuccess && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {fileStatus.uploadError && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={handleProcessData}
            disabled={
              isIngesting ||
              fileStatuses.length === 0 ||
              !fileStatuses.some((f) => f.uploadSuccess)
            }
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 mb-4"
          >
            <Database className="h-4 w-4" />
            {isIngesting ? "Processing..." : "Process Data"}
          </Button>
        </div>

        {fileStatuses.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setFileStatuses([]);
                const fileInput = document.getElementById(
                  "file-upload"
                ) as HTMLInputElement;
                if (fileInput) {
                  fileInput.value = "";
                }
              }}
            >
              Upload more files
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
