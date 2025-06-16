import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import DataQuery from "@/components/DataQuery";
import { Database, Diff, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataFindConflicts } from "@/components/DataFindConflicts";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"excel" | "query" | "conflicts">(
    "excel"
  );

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
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 flex-grow">
        <div className="mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "excel" | "query" | "conflicts")
            }
            className="flex flex-col w-full gap-6"
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

            <TabsContent value="excel">
              <FileUpload />
            </TabsContent>

            <TabsContent value="query">
              <DataQuery />
            </TabsContent>

            <TabsContent value="conflicts">
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
