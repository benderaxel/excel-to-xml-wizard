
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { queryDataGraph } from '../services/apiService';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const DEFAULT_BUILD_LINE = "254";
const DEFAULT_MARKET = "USA/CND";
const DEFAULT_GRAPH_PROPERTY = "H101 Fahrzeughöhe (M1 ~ ff) (mm)";

interface TableData {
  headers: string[];
  rows: Record<string, string>[];
}

const DataQuery: React.FC = () => {
  const { toast } = useToast();
  const [buildLine, setBuildLine] = useState(DEFAULT_BUILD_LINE);
  const [market, setMarket] = useState(DEFAULT_MARKET);
  const [graphProperty, setGraphProperty] = useState(DEFAULT_GRAPH_PROPERTY);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<TableData | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  
  const parseXmlTable = (xmlString: string): TableData => {
    // Create a simple XML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Extract headers
    const headers: string[] = [];
    const headerEntries = xmlDoc.querySelectorAll('thead entry');
    headerEntries.forEach(entry => {
      headers.push(entry.textContent || '');
    });
    
    // Extract rows
    const rows: Record<string, string>[] = [];
    const rowElements = xmlDoc.querySelectorAll('tbody row');
    
    rowElements.forEach(rowElement => {
      const row: Record<string, string> = {};
      const entries = rowElement.querySelectorAll('entry');
      
      entries.forEach((entry, index) => {
        if (index < headers.length) {
          row[headers[index]] = entry.textContent || '';
        }
      });
      
      rows.push(row);
    });
    
    return { headers, rows };
  };
  
  const handleQuery = async () => {
    setIsQuerying(true);
    setQueryResult(null);
    setQueryError(null);
    
    try {
      const query = `build_line=${encodeURIComponent(buildLine)}&market=${encodeURIComponent(market)}&graph_property=${encodeURIComponent(graphProperty)}`;
      const response = await queryDataGraph(query);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      // Parse the XML table data
      const tableData = parseXmlTable(response.data);
      setQueryResult(tableData);
      
      toast({
        title: "Query executed successfully",
        description: `Retrieved ${tableData.rows.length} rows from the database`,
      });
    } catch (error) {
      console.error('Query error:', error);
      setQueryError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Query failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsQuerying(false);
    }
  };
  
  const resetForm = () => {
    setBuildLine(DEFAULT_BUILD_LINE);
    setMarket(DEFAULT_MARKET);
    setGraphProperty(DEFAULT_GRAPH_PROPERTY);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> 
          Select Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="buildLine">Build Line</Label>
            <Input
              id="buildLine"
              value={buildLine}
              onChange={(e) => setBuildLine(e.target.value)}
              placeholder="Enter build line"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="market">Market</Label>
            <Input
              id="market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="Enter market"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="graphProperty">Graph Property</Label>
          <Input
            id="graphProperty"
            value={graphProperty}
            onChange={(e) => setGraphProperty(e.target.value)}
            placeholder="Enter graph property"
          />
        </div>
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline"
            onClick={resetForm}
          >
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleQuery}
            disabled={isQuerying || !buildLine || !market || !graphProperty}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {isQuerying ? "Querying..." : "Execute Query"}
          </Button>
        </div>
        
        {queryError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {queryError}
            </AlertDescription>
          </Alert>
        )}
        
        {queryResult && queryResult.rows.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h3 className="text-lg font-medium mb-2">Query Results</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {queryResult.headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResult.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {queryResult.headers.map((header, cellIndex) => (
                      <TableCell key={cellIndex}>{row[header]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {queryResult && queryResult.rows.length === 0 && (
          <Alert className="mt-4">
            <AlertDescription>
              No results found for the given query parameters.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataQuery;
