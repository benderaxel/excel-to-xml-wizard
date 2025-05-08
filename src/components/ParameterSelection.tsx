
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

interface ParameterSelectionProps {
  headers: string[];
  selectedParameters: string[];
  setSelectedParameters: React.Dispatch<React.SetStateAction<string[]>>;
}

const ParameterSelection: React.FC<ParameterSelectionProps> = ({ 
  headers, 
  selectedParameters, 
  setSelectedParameters 
}) => {
  const toggleParameter = (parameter: string) => {
    setSelectedParameters(prev => 
      prev.includes(parameter)
        ? prev.filter(p => p !== parameter)
        : [...prev, parameter]
    );
  };

  const selectAll = () => {
    setSelectedParameters([...headers]);
  };

  const deselectAll = () => {
    setSelectedParameters([]);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Select Parameters</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAll}
            className="text-xs"
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={deselectAll}
            className="text-xs"
          >
            Deselect All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
          {headers.map((header) => (
            <div 
              key={header} 
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleParameter(header)}
            >
              <Checkbox 
                id={header}
                checked={selectedParameters.includes(header)}
                onCheckedChange={() => toggleParameter(header)}
              />
              <label 
                htmlFor={header} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {header}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Selected Parameters:</p>
          {selectedParameters.length === 0 ? (
            <p className="text-sm text-gray-500">No parameters selected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedParameters.map(param => (
                <Badge 
                  key={param} 
                  variant="secondary"
                  className="flex items-center space-x-1 px-2 py-1 cursor-pointer"
                  onClick={() => toggleParameter(param)}
                >
                  <span>{param}</span>
                  <Check className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParameterSelection;
