import { Diff, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import {
  fetchGraphProperties,
  fetchMarketOptions,
} from "@/services/apiService";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";

import { Badge } from "./ui/badge";
import { Command, CommandGroup, CommandItem } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

export const DataChanges = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();

  const [selectedGraphProperties, setSelectedGraphProperties] = useState<
    string[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [marketOptions, setMarketOptions] = useState<string[]>([]);
  const [graphProperties, setGraphProperties] = useState<
    Record<string, string>
  >({});
  const [open, setOpen] = useState(false);

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
          // Make sure we're storing an object
          const props =
            typeof propertiesResponse.data === "object"
              ? propertiesResponse.data
              : {};
          setGraphProperties(props);
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

  // Use a safe version of Object.entries that handles null/undefined
  const safeObjectEntries = (
    obj: Record<string, string> | null | undefined
  ) => {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Diff className="h-5 w-5" />
          View changes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="graphProperty">Graph Properties</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div
                id="graphProperty"
                className={cn(
                  "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                  isLoadingOptions && "cursor-not-allowed opacity-50"
                )}
              >
                {isLoadingOptions ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : selectedGraphProperties.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedGraphProperties.map((property) => (
                      <Badge
                        key={property}
                        variant="secondary"
                        className="mr-1 mb-1"
                      >
                        {property}
                        <button
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => {
                            setSelectedGraphProperties(
                              selectedGraphProperties.filter(
                                (p) => p !== property
                              )
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Select graph properties
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandGroup>
                  {safeObjectEntries(graphProperties).length > 0 ? (
                    safeObjectEntries(graphProperties).map(([key, value]) => {
                      const isSelected =
                        selectedGraphProperties.includes(value);
                      return (
                        <CommandItem
                          key={key}
                          onSelect={() => {
                            setSelectedGraphProperties(
                              isSelected
                                ? selectedGraphProperties.filter(
                                    (p) => p !== value
                                  )
                                : [...selectedGraphProperties, value]
                            );
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </div>
                          {value}
                        </CommandItem>
                      );
                    })
                  ) : (
                    <CommandItem disabled>No properties available</CommandItem>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};
