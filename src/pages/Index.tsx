
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import ParameterSelection from '@/components/ParameterSelection';
import XmlOutput from '@/components/XmlOutput';
import { ExcelData } from '@/utils/excelParser';
import { ArrowDown } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  
  const handleFileProcessed = (data: ExcelData) => {
    setExcelData(data);
    setSelectedParameters([]); // Reset selected parameters
  };
  
  const initiateProcessing = () => {
    setCurrentStep(2);
  };
  
  const proceedToXmlGeneration = () => {
    if (selectedParameters.length > 0) {
      setCurrentStep(3);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Excel to XML Wizard</h1>
          <p className="text-gray-500 mt-1">Convert Excel data to structured XML format</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              1
            </div>
            <div className={`h-0.5 flex-1 ${currentStep > 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              2
            </div>
            <div className={`h-0.5 flex-1 ${currentStep > 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}>
              3
            </div>
          </div>
          
          <section className={`mb-8 ${currentStep === 1 ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-4">Step 1: Upload Excel File</h2>
            <FileUpload 
              onFileProcessed={handleFileProcessed} 
              onInitiateProcessing={initiateProcessing}
            />
          </section>
          
          {excelData && (
            <>
              <section className={`mb-8 ${currentStep === 2 ? 'block' : 'hidden'}`}>
                <h2 className="text-xl font-semibold mb-4">Step 2: Select Parameters</h2>
                <div className="space-y-6">
                  <DataPreview data={excelData} />
                  
                  <div className="flex justify-center">
                    <ArrowDown className="text-gray-400" />
                  </div>
                  
                  <ParameterSelection
                    headers={excelData.headers}
                    selectedParameters={selectedParameters}
                    setSelectedParameters={setSelectedParameters}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Upload
                    </Button>
                    <Button 
                      onClick={proceedToXmlGeneration}
                      disabled={selectedParameters.length === 0}
                    >
                      Generate XML
                    </Button>
                  </div>
                </div>
              </section>
              
              <section className={`mb-8 ${currentStep === 3 ? 'block' : 'hidden'}`}>
                <h2 className="text-xl font-semibold mb-4">Step 3: XML Output</h2>
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
                      Back to Parameters
                    </Button>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Excel to XML Wizard &copy; 2023
        </div>
      </footer>
    </div>
  );
};

export default Index;
