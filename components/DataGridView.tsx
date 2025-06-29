'use client';
import React, { useMemo } from 'react';
import { DataGrid, Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { ParsedSheet } from './FileUploader';
import { ValidationError } from '../lib/validators';

interface DataGridViewProps {
  data: ParsedSheet;
  errors: ValidationError[];
  title: string;
}

export function DataGridView({ data, errors, title }: DataGridViewProps) {
  // Create a map of rows with errors for quick lookup
  const errorMap = useMemo(() => {
    const map = new Map<number, Map<string, string[]>>();
    
    errors.forEach(error => {
      if (!map.has(error.row)) {
        map.set(error.row, new Map<string, string[]>());
      }
      
      const rowErrors = map.get(error.row)!;
      
      if (error.column) {
        if (!rowErrors.has(error.column)) {
          rowErrors.set(error.column, []);
        }
        rowErrors.get(error.column)!.push(error.message);
      }
    });
    
    return map;
  }, [errors]);

  // Generate columns from the first row or default set
  const columns = useMemo<Column<any>[]>(() => {
    if (data.length === 0) return [];
    
    const sample = data[0];
    return Object.keys(sample).map(key => ({
      key,
      name: key,
      width: Math.max(100, key.length * 10),
      cellClass: (row: any) => {
        const rowIndex = data.indexOf(row) + 1;
        const hasError = errorMap.has(rowIndex) && errorMap.get(rowIndex)!.has(key);
        return hasError ? 'bg-red-100' : '';
      },
      renderCell: ({ row }: { row: any }) => {
        const rowIndex = data.indexOf(row) + 1;
        const hasError = errorMap.has(rowIndex) && errorMap.get(rowIndex)!.has(key);
        let cellContent = row[key] || '';
        
        // Format certain types of data for better display
        if (key === 'AttributesJSON' && cellContent) {
          try {
            const parsedJson = JSON.parse(cellContent);
            cellContent = JSON.stringify(parsedJson, null, 2);
          } catch {
            // If parsing fails, display as-is
          }
        }
        
        return (
          <div
            className={`w-full h-full p-2 ${hasError ? 'text-red-700' : ''}`}
            title={hasError ? errorMap.get(rowIndex)!.get(key)!.join(', ') : undefined}
          >
            {cellContent}
          </div>
        );
      }
    }));
  }, [data, errorMap]);

  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-6 mb-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-500">No data uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="border rounded-lg overflow-hidden">
        <DataGrid
          columns={columns}
          rows={data}
          className="rdg-light"
          style={{ height: 400 }}
          rowHeight={40}
          onCellClick={(args: any) => {
            // You can add cell click handling here if needed
          }}
        />
      </div>
    </div>
  );
}
