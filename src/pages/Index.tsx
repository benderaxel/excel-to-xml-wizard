import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import DataPreview from "@/components/DataPreview";
import ParameterSelection from "@/components/ParameterSelection";
import XmlOutput from "@/components/XmlOutput";
import DataQuery from "@/components/DataQuery";
import { ExcelData } from "@/utils/excelParser";
import { ArrowDown, Server, Cog, Database, Diff } from "lucide-react";
import { checkServerHealth } from "@/services/apiService";
import { configStore } from "@/utils/configStore";
import ServerConfig from "@/components/ServerConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { DataChanges } from "@/components/DataChanges";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"excel" | "query" | "changes">(
    "excel"
  );
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

      <main className="container mx-auto px-4 py-8 h-full">
        <div className="max-w-4xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "excel" | "query" | "changes")
            }
            className="w-full mb-8"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Excel Processing
              </TabsTrigger>
              <TabsTrigger value="query" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Select Data
              </TabsTrigger>
              <TabsTrigger value="changes" className="flex items-center gap-2">
                <Diff className="h-4 w-4" />
                View changes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="excel" className="mt-6">
              <section
                className={`mb-8 ${currentStep === 1 ? "block" : "hidden"}`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Upload Excel Files
                </h2>
                <FileUpload
                  onFileProcessed={handleFileProcessed}
                  onShowConfig={() => setShowConfigModal(true)}
                />
              </section>

              {excelData && (
                <>
                  <section
                    className={`mb-8 ${currentStep === 2 ? "block" : "hidden"}`}
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      Step 2: XML Output
                    </h2>
                    <div className="space-y-6">
                      <XmlOutput
                        data={excelData}
                        selectedParameters={selectedParameters}
                      />

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
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

            <TabsContent value="changes" className="mt-6">
              <DataChanges />
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
