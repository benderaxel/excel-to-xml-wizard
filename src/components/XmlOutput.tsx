
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check, ClipboardCheck } from 'lucide-react';
import { ExcelData } from '../utils/excelParser';
import { generateRowXml, generateXml } from '../utils/xmlGenerator';

interface XmlOutputProps {
  data: ExcelData;
  selectedParameters: string[];
}

const XmlOutput: React.FC<XmlOutputProps> = ({ data, selectedParameters }) => {
  const { toast } = useToast();
  const xmlRef = useRef<HTMLPreElement>(null);
  const [copiedRow, setCopiedRow] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
  const completeXml = generateXml(data.rows, selectedParameters);
  
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: message,
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive"
        });
      }
    );
  };
  
  const handleCopyAll = () => {
    copyToClipboard(completeXml, "All XML copied to clipboard");
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };
  
  const handleCopyRow = (row: Record<string, string | number>, index: number) => {
    const rowXml = generateRowXml(row, selectedParameters);
    copyToClipboard(rowXml, `Row ${index + 1} copied to clipboard`);
    setCopiedRow(index);
    setTimeout(() => setCopiedRow(null), 2000);
  };
  
  // If no parameters selected, show prompt
  if (selectedParameters.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Generated XML</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Select parameters to generate XML</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Generated XML</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAll}
          className="flex items-center space-x-1"
          disabled={data.rows.length === 0}
        >
          {copiedAll ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              <span>Copy All</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {data.rows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="rounded bg-gray-50 p-1 overflow-auto max-h-[500px]">
            <pre ref={xmlRef} className="text-xs sm:text-sm whitespace-pre overflow-auto p-3">
              {'<?xml version="1.0" encoding="UTF-8"?>\n<rows>'}
              
              {data.rows.map((row, index) => {
                const rowXml = generateRowXml(row, selectedParameters);
                return (
                  <div
                    key={index}
                    className="group relative hover:bg-blue-50 border-l-2 border-transparent hover:border-blue-300 pl-2"
                  >
                    {rowXml.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex}>{line}</div>
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopyRow(row, index)}
                    >
                      {copiedRow === index ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                );
              })}
              
              {'</rows>'}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default XmlOutput;
