import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  queryDataGraph,
  fetchMarketOptions,
  fetchGraphProperties,
} from "../services/apiService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/hooks/useSession";

const DEFAULT_BUILD_LINE = "254";
const DEFAULT_MARKET = "USA/CND";
const DEFAULT_GRAPH_PROPERTY = "H101 Fahrzeughöhe (M1 ~ ff) (mm)";

interface TableData {
  headers: string[];
  rows: Record<string, string>[];
}

const DataQuery: React.FC = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();
  const [buildLine, setBuildLine] = useState(DEFAULT_BUILD_LINE);
  const [market, setMarket] = useState(DEFAULT_MARKET);
  const [graphProperty, setGraphProperty] = useState(DEFAULT_GRAPH_PROPERTY);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<TableData | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const [marketOptions, setMarketOptions] = useState<string[]>([]);
  const [graphProperties, setGraphProperties] = useState<
    Record<string, string>
  >({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Fetch dropdown options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        // Fetch market options
        const marketsResponse = await fetchMarketOptions(sessionId);
        const propertiesResponse = await fetchGraphProperties(sessionId);
        if (marketsResponse.success) {
          setMarketOptions(marketsResponse.data);
        }

        if (propertiesResponse.success) {
          setGraphProperties(propertiesResponse.data);
        }
      } catch (error) {
        toast({
          title: "Warning",
          description:
            "Failed to load options from server. Using default values.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast, sessionId]);

  const parseXmlTable = (xmlString: string): TableData => {
    // Create a simple XML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Extract headers
    const headers: string[] = [];
    const headerEntries = xmlDoc.querySelectorAll("thead entry");
    headerEntries.forEach((entry) => {
      headers.push(entry.textContent || "");
    });

    // Extract rows
    const rows: Record<string, string>[] = [];
    const rowElements = xmlDoc.querySelectorAll("tbody row");

    rowElements.forEach((rowElement) => {
      const row: Record<string, string> = {};
      const entries = rowElement.querySelectorAll("entry");

      entries.forEach((entry, index) => {
        if (index < headers.length) {
          row[headers[index]] = entry.textContent || "";
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
      // const query = `build_line=${encodeURIComponent(
      //   buildLine
      // )}&market=${encodeURIComponent(
      //   market
      // )}&graph_property=${encodeURIComponent(graphProperty)}`;
      const body = {
        build_line: buildLine,
        market: market,
        graph_property: graphProperty,
      };

      const response = await queryDataGraph(body, sessionId);

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
      console.error("Query error:", error);
      setQueryError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      toast({
        title: "Query failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
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
              disabled={isLoadingOptions}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="market">Market</Label>
            <Select
              value={market}
              onValueChange={setMarket}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="market" className="w-full">
                {isLoadingOptions ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a market" />
                )}
              </SelectTrigger>
              <SelectContent>
                {marketOptions.map((marketOption) => (
                  <SelectItem key={marketOption} value={marketOption}>
                    {marketOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="graphProperty">Graph Property</Label>
          <Select
            value={graphProperty}
            onValueChange={setGraphProperty}
            disabled={isLoadingOptions}
          >
            <SelectTrigger id="graphProperty" className="w-full">
              {isLoadingOptions ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select a graph property" />
              )}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(graphProperties).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={isLoadingOptions}
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleQuery}
            disabled={
              isQuerying ||
              isLoadingOptions ||
              !buildLine ||
              !market ||
              !graphProperty
            }
            className="flex items-center gap-2"
          >
            {isQuerying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Execute Query
              </>
            )}
          </Button>
        </div>

        {queryError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{queryError}</AlertDescription>
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
