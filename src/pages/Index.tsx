import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import DataQuery from "@/components/DataQuery";
import { Cog, Database, Diff, Upload } from "lucide-react";
import { checkServerHealth } from "@/services/apiService";
import { configStore } from "@/utils/configStore";
import ServerConfig from "@/components/ServerConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataFindConflicts } from "@/components/DataFindConflicts";

const Index = () => {
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"excel" | "query" | "conflicts">(
    "excel"
  );

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
    <div className="flex flex-col min-h-screen bg-gray-50">
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

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "excel" | "query" | "conflicts")
            }
            className="w-full mb-8"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload excel file(s)
              </TabsTrigger>
              <TabsTrigger value="query" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Query Data
              </TabsTrigger>
              <TabsTrigger
                value="conflicts"
                className="flex items-center gap-2"
              >
                <Diff className="h-4 w-4" />
                Find conflicts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="excel" className="mt-6">
              <FileUpload onShowConfig={() => setShowConfigModal(true)} />
            </TabsContent>

            <TabsContent value="query" className="mt-6">
              <DataQuery />
            </TabsContent>

            <TabsContent value="conflicts" className="mt-6">
              <DataFindConflicts />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Aleido - Mercedes Data Navigator &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
