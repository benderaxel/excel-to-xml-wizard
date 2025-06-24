import { SquareChartGantt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import { fetchOverviewData } from "@/services/apiService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

type PropertyModel = {
  model_number: string;
  model_name: string;
};

type OverviewDataType = {
  new: PropertyModel[];
  removed: PropertyModel[];
};

export const DataOverview = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<OverviewDataType | null>(
    null
  );

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const overviewDataResponse = await fetchOverviewData(sessionId);
        if (overviewDataResponse.success) {
          setOverviewData(
            overviewDataResponse.data
              ? overviewDataResponse.data
              : { new: [], removed: [] }
          );
        }
      } catch (error) {
        toast({
          title: "Warning",
          description: "Failed to get overview data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [toast, sessionId]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SquareChartGantt className="h-5 w-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading overview data...</p>
        </CardContent>
      </Card>
    );
  }

  if (
    !overviewData ||
    (overviewData.new.length === 0 && overviewData.removed.length === 0)
  ) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SquareChartGantt className="h-5 w-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No changes detected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SquareChartGantt className="h-5 w-5" />
          Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            New and removed car models
          </h2>

          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Found {overviewData.new.length} new cars and{" "}
              {overviewData.removed.length} removed cars
            </p>

            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Model Number</TableHead>
                  <TableHead className="w-2/5">Model Name</TableHead>
                  <TableHead className="w-1/5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overviewData.new.map((model, index) => (
                  <TableRow
                    key={`new-${index}`}
                    className={index % 2 === 0 ? "bg-muted/20" : ""}
                  >
                    <TableCell className="font-mono">
                      {model.model_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {model.model_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        New
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {overviewData.removed.map((model, index) => (
                  <TableRow
                    key={`removed-${index}`}
                    className={
                      (overviewData.new.length + index) % 2 === 0
                        ? "bg-muted/20"
                        : ""
                    }
                  >
                    <TableCell className="font-mono">
                      {model.model_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {model.model_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="destructive"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Removed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
