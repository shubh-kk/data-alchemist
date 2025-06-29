'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';

export type ParsedSheet = Record<string, any>[];

interface FileUploaderProps {
  onData: (clients: ParsedSheet, tasks: ParsedSheet, workers: ParsedSheet) => void;
}

export function FileUploader({ onData }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setUploading(true);
    setUploadStatus('Processing files...');
    
    const sheets: Record<string, ParsedSheet> = { clients: [], tasks: [], workers: [] };

    try {
      for (let file of Array.from(files)) {
        setUploadStatus(`Processing ${file.name}...`);
        const name = file.name.toLowerCase();
        
        if (name.endsWith('.csv')) {
          const text = await file.text();
          const { data } = Papa.parse<any>(text, { header: true });
          if (name.includes('client')) sheets.clients = data;
          else if (name.includes('task')) sheets.tasks = data;
          else if (name.includes('worker')) sheets.workers = data;
          console.log(`Parsed ${name}: ${data.length} rows`);
        } else if (name.endsWith('.xlsx')) {
          const buf = await file.arrayBuffer();
          const wb = new ExcelJS.Workbook();
          await wb.xlsx.load(buf);
          
          wb.eachSheet((ws) => {
            const headers: string[] = [];
            ws.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
                headers.push(String(cell.value));
            });

            const json: ParsedSheet = [];
            ws.eachRow((row, rowNumber) => {
              if (rowNumber > 1) { // Skip header row
                const rowData: Record<string, any> = {};
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                  const header = headers[colNumber - 1];
                  if (header) {
                    rowData[header] = cell.value;
                  }
                });
                if (Object.values(rowData).some(v => v !== null && v !== undefined && v !== '')) {
                    json.push(rowData);
                }
              }
            });

            const sheetName = ws.name.toLowerCase();
            if (name.includes('client') || sheetName.includes('client')) {
                sheets.clients = sheets.clients.concat(json);
            } else if (name.includes('task') || sheetName.includes('task')) {
                sheets.tasks = sheets.tasks.concat(json);
            } else if (name.includes('worker') || sheetName.includes('worker')) {
                sheets.workers = sheets.workers.concat(json);
            }
          });
        }
      }

      setUploadStatus('Files processed successfully!');
      console.log('🏷️ Parsed sheets:', sheets);
      console.log('🏷️ onData clients', sheets.clients, 'tasks', sheets.tasks, 'workers', sheets.workers);
      onData(sheets.clients, sheets.tasks, sheets.workers);
      
      setTimeout(() => {
        setUploadStatus('');
      }, 2000);
    } catch (error) {
      setUploadStatus('Error processing files. Please check file format.');
      console.error('File processing error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV or Excel files only</p>
          </div>
          <input
            type="file"
            multiple
            accept=".csv,.xlsx"
            onChange={handleFiles}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      
      {uploadStatus && (
        <div className={`text-sm p-2 rounded ${
          uploadStatus.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : uploadStatus.includes('successfully') 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {uploading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {uploadStatus}
        </div>
      )}
    </div>
  );
}
