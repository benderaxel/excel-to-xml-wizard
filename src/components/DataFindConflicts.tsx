import { Diff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import {
  fetchFindConflictsData,
  fetchGraphProperties,
  fetchMarketOptions,
  fetchConflictsExcel,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { ChevronDown } from "lucide-react";

export type DataChangeRequest = {
  key_properties?: string[];
  key_property_values: {
    for_market?: string;
    ["Baureihe 4"]?: string;
  };
};

export const DataFindConflicts = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();

  const [market, setMarket] = useState("");
  const [graphProperty, setGraphProperty] = useState<string[]>([]);
  const [model, setModel] = useState("");

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingFindConflictsData, setIsLoadingFindConflictsData] =
    useState(false);
  const [marketOptions, setMarketOptions] = useState<string[]>([]);
  const [modelData, setModelData] = useState<string[]>([]);
  const [graphProperties, setGraphProperties] = useState<
    { key: string; value: string }[]
  >([]);
  const [findConflictsData, setFindConflictsData] =
    useState<ComparisonItem[]>(null);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        // Fetch market options
        const marketsResponse = await fetchMarketOptions(sessionId);
        const propertiesResponse = await fetchGraphProperties(sessionId);

        const marketsModelResponse = await fetchMarketOptions(
          sessionId,
          "Baureihe 4"
        );

        if (marketsModelResponse.success && marketsModelResponse.data) {
          setModelData(
            Array.isArray(marketsModelResponse.data)
              ? marketsModelResponse.data
              : []
          );
        }

        if (marketsResponse.success && marketsResponse.data) {
          setMarketOptions(
            Array.isArray(marketsResponse.data) ? marketsResponse.data : []
          );
        }

        if (propertiesResponse.success && propertiesResponse.data) {
          const responseData = propertiesResponse.data;
          // Convert object to array of {key, value} objects
          if (typeof responseData === "object" && responseData !== null) {
            const propertyArray = Object.entries(responseData).map(
              ([key, value]) => ({
                key,
                value: String(value),
              })
            );
            setGraphProperties(propertyArray);
          } else {
            setGraphProperties([]);
          }
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
        setGraphProperties([]);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [toast, sessionId]);

  const handleSubmit = async () => {
    try {
      setIsLoadingFindConflictsData(true);
      const data = {
        key_properties: graphProperty.length > 0 ? graphProperty : undefined,
        key_property_values: {
          ...(market ? { for_market: market } : {}),
          ...(model ? { ["Baureihe 4"]: model } : {}),
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
      setFindConflictsData(null);
    } finally {
      setIsLoadingFindConflictsData(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const downloadResponse = await fetchConflictsExcel(sessionId);

      if (!downloadResponse.success) {
        throw new Error(
          downloadResponse.message || "Failed to download Excel file"
        );
      }
      const blob = new Blob([downloadResponse.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conflicts_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download Excel file.",
        variant: "destructive",
      });
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
                <Label htmlFor="model">Model</Label>
                <Select
                  value={model}
                  onValueChange={setModel}
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger
                    id="model"
                    className="w-full hover:bg-accent hover:text-white"
                  >
                    {isLoadingOptions ? (
                      <LoadingSpinner />
                    ) : (
                      <SelectValue placeholder="Select model" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={null}
                      className="focus:text-white cursor-pointer"
                    >
                      All models
                    </SelectItem>
                    {modelData && modelData.length > 0 ? (
                      modelData.map((marketOption) => (
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
                        No model available
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
                  <SelectTrigger
                    id="market"
                    className="w-full hover:bg-accent hover:text-white"
                  >
                    {isLoadingOptions ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select market" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={null}
                      className="focus:text-white cursor-pointer"
                    >
                      All markets
                    </SelectItem>
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
              <Label htmlFor="graphProperty">Properties</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between hover:text-white"
                    disabled={isLoadingOptions}
                  >
                    {isLoadingOptions ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : graphProperty.length > 0 ? (
                      <span className="text-inherit">{`${graphProperty.length} properties selected`}</span>
                    ) : (
                      <span className="">Select properties</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search properties" />
                    <CommandList>
                      <CommandEmpty>No property found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {graphProperties.map((property) => (
                          <CommandItem
                            key={property.key}
                            value={property.value}
                            className="hover:cursor-pointer "
                            onSelect={() => {
                              setGraphProperty((prev) => {
                                if (prev.includes(property.key)) {
                                  return prev.filter(
                                    (item) => item !== property.key
                                  );
                                }
                                return [...prev, property.key];
                              });
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Checkbox
                                checked={graphProperty.includes(property.key)}
                                className="mr-2"
                              />
                              <span>{property.value}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

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
          </div>
        </CardContent>
      </Card>

      {/* Only show the results card when loading or when data exists */}
      {(isLoadingFindConflictsData || findConflictsData) && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <p>
                {isLoadingFindConflictsData
                  ? "Finding Conflicts..."
                  : findConflictsData && findConflictsData.length > 0
                  ? `Conflicts Results (${findConflictsData.length})`
                  : "No Conflicts Found"}
              </p>

              {findConflictsData && findConflictsData.length > 0 && (
                <Button onClick={handleDownloadExcel}>Download excel</Button>
              )}
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
