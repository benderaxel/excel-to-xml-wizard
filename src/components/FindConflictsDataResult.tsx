import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Info, Copy, Check } from "lucide-react";
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
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

type VersionModel = {
  model_number: string;
  model_name: string;
};

type VersionItem = {
  value: string;
  models: VersionModel[];
};

export type ComparisonItem = {
  property: string;
  xml_table?: string;
  version1: VersionItem[];
  version2: VersionItem[];
};

type ComparisonResultsProps = {
  data: ComparisonItem[];
};

export const FindConflictsDataResult = ({ data }: ComparisonResultsProps) => {
  const { toast } = useToast();

  if (!data || data.length === 0) {
    return null;
  }

  // Function to copy XML table content to clipboard
  const copyToClipboard = async (xmlTable: string | undefined) => {
    if (!xmlTable) return;

    try {
      await navigator.clipboard.writeText(xmlTable);

      toast({
        title: "XML copied to clipboard!",
        variant: "default",
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

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
                <TableHead className="w-1/3">Old value(s)</TableHead>
                <TableHead className="w-1/3">New value(s)</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-muted/20" : ""}
                >
                  <TableCell className="align-top font-medium border-r">
                    <div className="flex justify-between items-start gap-2">
                      {item.property}
                    </div>
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
                                <Tooltip key={model.model_number}>
                                  <TooltipTrigger>
                                    <Badge
                                      variant="outline"
                                      className="font-mono"
                                    >
                                      {model.model_name}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{model.model_number}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          ) : (
                            <span className="italic">None</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="align-top">
                    {item.version2.map((valueObj, i) => {
                      return (
                        <div
                          key={i}
                          className={
                            i > 0
                              ? "mt-4 pt-4 border-t flex gap-2 justify-between items-start"
                              : "flex gap-2"
                          }
                        >
                          <div>
                            <div className="font-medium break-all mb-1">
                              <div className="flex items-center gap-2">
                                {valueObj.value === "" ? (
                                  <span className="text-muted-foreground italic">
                                    No updates
                                  </span>
                                ) : (
                                  <>{valueObj.value}</>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 items-center text-sm text-muted-foreground">
                              Models:{" "}
                              {valueObj.models.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {valueObj.models.map((model) => (
                                    <Tooltip key={model.model_number}>
                                      <TooltipTrigger>
                                        <Badge
                                          variant="outline"
                                          className="font-mono"
                                        >
                                          {model.model_name}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{model.model_number}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </div>
                              ) : (
                                <span className="italic">None</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TableCell>
                  <TableCell>
                    {item.xml_table && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-white"
                            onClick={() => copyToClipboard(item.xml_table)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Copy XML</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
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
