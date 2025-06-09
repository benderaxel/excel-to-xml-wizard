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

type VersionItem = {
  value: string;
  models: string[];
};

export type ComparisonItem = {
  property: string;
  version1: VersionItem[];
  version2: VersionItem[];
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
        Found {data.length} properties with conflicts between versions
      </p>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>Property Conflicts</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Property</TableHead>
                <TableHead className="w-1/3">Version 1</TableHead>
                <TableHead className="w-1/3">Version 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-muted/20" : ""}
                >
                  <TableCell className="align-top font-medium border-r">
                    {item.property}
                  </TableCell>
                  <TableCell className="align-top border-r">
                    {item.version1.map((valueObj, i) => (
                      <div
                        key={i}
                        className={i > 0 ? "mt-4 pt-4 border-t" : ""}
                      >
                        <div className="font-medium break-all mb-1">
                          <div className="flex items-center gap-2">
                            {valueObj.value === "" ? (
                              <span className="text-muted-foreground italic">
                                No value
                              </span>
                            ) : (
                              <>
                                {valueObj.value}
                                {valueObj.value.includes("LCR:") && (
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
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          Models:{" "}
                          {valueObj.models.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {valueObj.models.map((model) => (
                                <Badge
                                  variant="outline"
                                  key={model}
                                  className="font-mono"
                                >
                                  {model}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="italic">None</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="flex flex-col gap-4">
                    {item.version2.map((valueObj, i) => (
                      <div key={i} className={i > 0 ? "pt-4 border-t" : ""}>
                        <div className="font-medium break-all mb-1">
                          <div className="flex items-center gap-2">
                            {valueObj.value === "" ? (
                              <span className="text-muted-foreground italic">
                                No value
                              </span>
                            ) : (
                              <>
                                {valueObj.value}
                                {valueObj.value.includes("LCR:") && (
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
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                          Models:{" "}
                          {valueObj.models.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {valueObj.models.map((model) => (
                                <Badge
                                  variant="outline"
                                  key={model}
                                  className="font-mono"
                                >
                                  {model}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="italic">None</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
