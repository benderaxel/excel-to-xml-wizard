import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

// Define interfaces for the comparison data
type SharedKeyProperties = {
  [key: string]: string;
};

type ConflictingProperty = {
  [key: string]: string[];
};

export type ComparisonItem = {
  shared_key_properties: SharedKeyProperties;
  conflicting_properties: ConflictingProperty;
};

type ComparisonResultsProps = {
  data: ComparisonItem[];
};

export const FindConflictsDataResult = ({ data }: ComparisonResultsProps) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Found {data.length} items with conflicting properties
      </p>

      {data.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              Conflicts for{" "}
              {Object.entries(item.shared_key_properties).map(
                ([key, value], i, arr) => (
                  <div key={key} className="flex items-center gap-1">
                    <Badge variant="outline" className="font-mono bg-white">
                      {key}: {value}
                    </Badge>
                  </div>
                )
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Property</TableHead>
                  <TableHead>Value 1</TableHead>
                  <TableHead>Value 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(item.conflicting_properties).map(
                  ([property, values]) => (
                    <TableRow key={property}>
                      <TableCell className="font-medium break-all">
                        <div className="flex items-center gap-2">
                          {property}
                          {values.some((v) => v.includes("LCR:")) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  This property contains conditional logic
                                  expressions (LCR)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      {values.map((value, i) => (
                        <TableCell
                          key={i}
                          className={cn(
                            value === "" && "text-muted-foreground italic",
                            values[0] !== values[1] && "relative break-all"
                          )}
                        >
                          {value === "" ? "No change" : value}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
