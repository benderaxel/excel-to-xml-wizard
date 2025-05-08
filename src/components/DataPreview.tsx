
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExcelData } from '../utils/excelParser';

interface DataPreviewProps {
  data: ExcelData;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const { headers, previewRows } = data;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Data Preview</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewRows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`}>
                    {row[header] !== undefined ? String(row[header]) : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.rows.length > 5 && (
          <div className="mt-2 text-sm text-gray-500 text-right">
            Showing 5 of {data.rows.length} rows
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview;
