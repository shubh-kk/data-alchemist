'use client';
import React, { useMemo } from 'react';
import { DataGrid, Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { ParsedSheet } from './FileUploader';
import { ValidationError } from '../lib/validators';
import { useState } from 'react';

const customStyles = {
  cell: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

interface DataGridViewProps {
  data: ParsedSheet;
  errors: ValidationError[];
  title: string;
}

export function DataGridView({ data, errors, title }: DataGridViewProps) {
  const [selectedCell, setSelectedCell] = useState<{content: string; isOpen: boolean}>({
    content: '',
    isOpen: false
  });

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

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const columns = useMemo<Column<any>[]>(() => {
    if (data.length === 0) return [];
    
    const sample = data[0];
    return Object.keys(sample).map(key => ({
      key,
      name: key,
      width: columnWidths[key] || Math.max(100, key.length * 10),
      resizable: true,
      cellClass: (row: any) => {
        const rowIndex = data.indexOf(row) + 1;
        const hasError = errorMap.has(rowIndex) && errorMap.get(rowIndex)!.has(key);
        return hasError ? 'bg-red-100' : '';
      },
      renderCell: ({ row }: { row: any }) => {
        const rowIndex = data.indexOf(row) + 1;
        const hasError = errorMap.has(rowIndex) && errorMap.get(rowIndex)!.has(key);
        let cellContent = row[key] || '';
        
        if (key === 'AttributesJSON' && cellContent) {
          try {
            const parsedJson = JSON.parse(cellContent);
            cellContent = JSON.stringify(parsedJson, null, 2);
          } catch {
            
          }
        }
        const isTruncated = typeof cellContent === 'string' && cellContent.length > 100;
        const displayContent = isTruncated 
          ? `${cellContent.substring(0, 100)}...` 
          : cellContent;
        
        return (
          <div
            className={`w-full h-full p-2 ${hasError ? 'text-red-700' : ''} overflow-hidden text-ellipsis`}
            title={hasError 
              ? errorMap.get(rowIndex)!.get(key)!.join(', ') 
              : typeof cellContent === 'string' ? cellContent : undefined}
          >
            {displayContent}
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
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-xs text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          Tip: Drag column edges to resize
        </span>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <DataGrid
          columns={columns}
          rows={data}
          className="rdg-light"
          style={{ height: 400 }}
          rowHeight={40}
          defaultColumnOptions={{
            sortable: true,
            resizable: true
          }}
          onColumnResize={(column, width) => {
            const key = String(column.key);
            setColumnWidths(prev => ({
              ...prev,
              [key]: width
            }));
          }}
          onCellClick={({ row, column }) => {
            const key = String(column.key);
            const content = row[key];
            if (content && typeof content === 'string' && content.length > 100) {
              setSelectedCell({
                content: content,
                isOpen: true
              });
            }
          }}
        />
      </div>

      {/* Modal for viewing large cell content */}
      {selectedCell.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCell({ content: '', isOpen: false })}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cell Content</h3>
              <button 
                onClick={() => setSelectedCell({ content: '', isOpen: false })}
                className="text-gray-500 hover:text-gray-700 "
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border">
              {selectedCell.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
