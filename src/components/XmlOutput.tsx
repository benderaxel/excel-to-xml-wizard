
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check, ClipboardCheck, Table } from 'lucide-react';
import { ExcelData } from '../utils/excelParser';
import { generateRowXml, generateXml } from '../utils/xmlGenerator';
import { 
  Table as UITable, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <CardTitle className="text-xl flex items-center gap-2">
          <Table className="h-5 w-5" />
          Generated XML
        </CardTitle>
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
          <ScrollArea className="h-[400px] rounded border">
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>XML Content</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, index) => {
                  const rowXml = generateRowXml(row, selectedParameters);
                  return (
                    <TableRow key={index} className="group">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded overflow-auto max-h-[120px]">
                          {rowXml}
                        </pre>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyRow(row, index)}
                        >
                          {copiedRow === index ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </UITable>
          </ScrollArea>
        )}
        
        {/* Hidden pre element containing complete XML for "Copy All" functionality */}
        <pre ref={xmlRef} className="hidden">{completeXml}</pre>
      </CardContent>
    </Card>
  );
};

export default XmlOutput;
