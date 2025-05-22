import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import DataPreview from "@/components/DataPreview";
import ParameterSelection from "@/components/ParameterSelection";
import XmlOutput from "@/components/XmlOutput";
import DataQuery from "@/components/DataQuery";
import { ExcelData } from "@/utils/excelParser";
import { ArrowDown, Server, Cog, Database } from "lucide-react";
import { checkServerHealth, ingestLocalData } from "@/services/apiService";
import { configStore } from "@/utils/configStore";
import ServerConfig from "@/components/ServerConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"excel" | "query">("excel");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Check server status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkServerHealth();
      setServerStatus(status);
    };

    checkStatus();

    // Recheck server status every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleFileProcessed = (data: ExcelData) => {
    setExcelData(data);
    setSelectedParameters([]); // Reset selected parameters
    setCurrentStep(2); // Move to step 2 after successful upload
  };

  const handleProcessData = async () => {
    setIsProcessing(true);
    try {
      const response = await ingestLocalData();
      if (response.success) {
        setCurrentStep(3); // Move to step 3 after successful processing
        toast({
          title: "Success",
          description: "Data processed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to process data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Process data error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const proceedToXmlGeneration = () => {
    if (selectedParameters.length > 0) {
      setCurrentStep(3);
    }
  };

  const getConnectionInfo = () => {
    if (configStore.ngrokUrl) {
      return `Connected to ngrok: ${configStore.ngrokUrl}`;
    } else if (configStore.corsProxy) {
      return `Connected via CORS proxy: ${configStore.getApiUrl()}`;
    } else {
      return `Connected to ${configStore.getApiUrl()}`;
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <img
                src="/lovable-uploads/162cfaf1-3a46-452c-85b7-6f1cebe1c4e3.png"
                alt="Aleido Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Aleido - Mercedes Data Navigator
                </h1>
                <p className="text-gray-500 mt-1">
                  Convert Excel data to structured XML format
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm mr-2 hidden sm:inline">Server:</span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    serverStatus === null
                      ? "bg-gray-400"
                      : serverStatus
                      ? "bg-primary"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="ml-2 text-sm text-gray-600 hidden sm:inline">
                  {serverStatus === null
                    ? "Checking..."
                    : serverStatus
                    ? getConnectionInfo()
                    : "Disconnected"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 hover:text-white"
                onClick={() => setShowConfigModal(true)}
              >
                <Cog className="h-4 w-4" />
                <span className="hidden sm:inline">Server Config</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showConfigModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ServerConfig onClose={() => setShowConfigModal(false)} />
          </div>
        </div>
      ) : null}

      <main className="container mx-auto px-4 py-8 h-[680px]">
        <div className="max-w-4xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "excel" | "query")}
            className="w-full mb-8"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Excel Processing
              </TabsTrigger>
              <TabsTrigger value="query" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Select Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="excel" className="mt-6">
              <div className="flex items-center mb-8">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                    currentStep >= 1 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-0.5 flex-1 ${
                    currentStep > 1 ? "bg-primary" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                    currentStep >= 2 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  2
                </div>
                <div
                  className={`h-0.5 flex-1 ${
                    currentStep > 2 ? "bg-primary" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                    currentStep >= 3 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  3
                </div>
              </div>

              <section
                className={`mb-8 ${currentStep === 1 ? "block" : "hidden"}`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Step 1: Upload Excel File
                </h2>
                <FileUpload
                  onFileProcessed={handleFileProcessed}
                  onInitiateProcessing={handleProcessData}
                  onShowConfig={() => setShowConfigModal(true)}
                />
              </section>

              {excelData && (
                <>
                  <section
                    className={`mb-8 ${currentStep === 2 ? "block" : "hidden"}`}
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      Step 2: Process Data
                    </h2>
                    <div className="space-y-6">
                      <DataPreview data={excelData} />

                      <div className="flex justify-center">
                        <ArrowDown className="text-gray-400" />
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="mr-2"
                        >
                          Back to Upload
                        </Button>
                        <Button
                          onClick={handleProcessData}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : "Process Data"}
                        </Button>
                      </div>
                    </div>
                  </section>

                  <section
                    className={`mb-8 ${currentStep === 3 ? "block" : "hidden"}`}
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      Step 3: XML Output
                    </h2>
                    <div className="space-y-6">
                      <XmlOutput
                        data={excelData}
                        selectedParameters={selectedParameters}
                      />

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                        >
                          Back to Process Data
                        </Button>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </TabsContent>

            <TabsContent value="query" className="mt-6">
              <DataQuery />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Aleido - Mercedes Data Navigator &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
