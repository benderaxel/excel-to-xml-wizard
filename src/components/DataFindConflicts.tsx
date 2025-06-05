import { Diff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import {
  fetchFindConflictsData,
  fetchGraphProperties,
  fetchMarketOptions,
} from "@/services/apiService";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  FindConflictsDataResult,
  type ComparisonItem,
} from "./FindConflictsDataResult";
import { LoadingSpinner } from "./LoadingSpinner";

export type DataChangeRequest = {
  key_properties: string[];
  key_property_values: {
    for_market: string;
    [key: string]: string;
  };
};

export const DataFindConflicts = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();

  const [market, setMarket] = useState("");
  const [graphProperty, setGraphProperty] = useState("");
  const [maker, setMaker] = useState("");

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingFindConflictsData, setIsLoadingFindConflictsData] =
    useState(false);
  const [marketOptions, setMarketOptions] = useState<string[]>([]);
  const [makerData, setMakerData] = useState<string[]>([]);
  const [graphProperties, setGraphProperties] = useState<
    Record<string, string>
  >({});
  const [findConflictsData, setFindConflictsData] =
    useState<ComparisonItem[]>(null);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        // Fetch market options
        const marketsResponse = await fetchMarketOptions(sessionId);
        const propertiesResponse = await fetchGraphProperties(sessionId);

        if (marketsResponse.success && marketsResponse.data) {
          setMarketOptions(
            Array.isArray(marketsResponse.data) ? marketsResponse.data : []
          );
        }

        if (propertiesResponse.success && propertiesResponse.data) {
          const data =
            typeof propertiesResponse.data === "object"
              ? propertiesResponse.data
              : {};
          setGraphProperties(data);
        }
      } catch (error) {
        toast({
          title: "Warning",
          description:
            "Failed to load options from server. Using default values.",
          variant: "destructive",
        });
        // Ensure we have valid default states in case of error
        setMarketOptions([]);
        setGraphProperties({});
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast, sessionId]);

  const handleSetGraphProperty = (value: string) => {
    setGraphProperty(value);
    getMakerData(value);
  };

  const getMakerData = async (value: string) => {
    const marketsResponse = await fetchMarketOptions(sessionId, value);

    if (marketsResponse.success && marketsResponse.data) {
      setMakerData(
        Array.isArray(marketsResponse.data) ? marketsResponse.data : []
      );
    }
  };

  const handleSubmit = async () => {
    if (!graphProperty && !market && !maker) {
      toast({
        title: "Error",
        description: "Please select both a graph property and a market.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingFindConflictsData(true); // Set loading state to true before fetch
      const data = {
        key_properties: [graphProperty, "for_market"],
        key_property_values: {
          for_market: market,
          ...(maker ? { [graphProperty]: maker } : {}),
        },
      };

      const compareResponse = await fetchFindConflictsData(sessionId, data);

      if (compareResponse.success && compareResponse.data) {
        setFindConflictsData(compareResponse.data);
      }
    } catch (error) {
      toast({
        title: "Warning",
        description: "Failed to load comparison data. Please try again.",
        variant: "destructive",
      });
      setFindConflictsData(null); // Reset data on error
    } finally {
      setIsLoadingFindConflictsData(false); // Set loading state to false after fetch completes
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Diff className="h-5 w-5" />
            Find conflicts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="w-full space-y-2">
                <Label htmlFor="graphProperty">Graph Property</Label>
                <Select
                  value={graphProperty}
                  onValueChange={(e) => handleSetGraphProperty(e)}
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
                    {Object.entries(graphProperties || {})?.length > 0 ? (
                      Object.entries(graphProperties || {}).map(
                        ([key, value]) => (
                          <SelectItem
                            key={key}
                            value={value}
                            className="focus:text-white cursor-pointer"
                          >
                            {value}
                          </SelectItem>
                        )
                      )
                    ) : (
                      <SelectItem value="no-properties" disabled>
                        No properties available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full space-y-2">
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
                    {marketOptions && marketOptions.length > 0 ? (
                      marketOptions.map((marketOption) => (
                        <SelectItem
                          key={marketOption}
                          value={marketOption}
                          className="focus:text-white cursor-pointer"
                        >
                          {marketOption}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-markets" disabled>
                        No markets available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="maker">Maker</Label>
              <Select
                value={maker}
                onValueChange={setMaker}
                disabled={!graphProperty && isLoadingOptions}
              >
                <SelectTrigger id="maker" className="w-full">
                  {isLoadingOptions ? (
                    <LoadingSpinner />
                  ) : (
                    <SelectValue placeholder="Select a maker" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {makerData && makerData.length > 0 ? (
                    makerData.map((marketOption) => (
                      <SelectItem
                        key={marketOption}
                        value={marketOption}
                        className="focus:text-white cursor-pointer"
                      >
                        {marketOption}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-marker" disabled>
                      No maker available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-fit self-end min-w-28"
              onClick={handleSubmit}
              disabled={isLoadingOptions}
            >
              {isLoadingOptions ? (
                <LoadingSpinner showText={false} />
              ) : (
                "Find conflicts"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Only show the results card when loading or when data exists */}
      {(isLoadingFindConflictsData || findConflictsData) && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {isLoadingFindConflictsData
                ? "Finding Conflicts..."
                : findConflictsData && findConflictsData.length > 0
                ? `Conflicts Results (${findConflictsData.length})`
                : "No Conflicts Found"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingFindConflictsData ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner showText={false} />
                <p className="text-sm text-muted-foreground">
                  Finding conflicts...
                </p>
              </div>
            ) : findConflictsData && findConflictsData.length > 0 ? (
              <FindConflictsDataResult data={findConflictsData} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No conflicts found for the selected criteria.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
