'use client';
import React from 'react';
import { ValidationError } from '../lib/validators';

interface ErrorDisplayProps {
  errors: Record<'clients' | 'tasks' | 'workers', ValidationError[]>;
  onErrorSelect: (entityType: 'clients' | 'tasks' | 'workers', row: number, column?: string) => void;
}

export function ErrorDisplay({ errors, onErrorSelect }: ErrorDisplayProps) {
  const totalErrors = Object.values(errors).reduce((acc, val) => acc + val.length, 0);
  
  if (totalErrors === 0) {
    return (
      <div className="border rounded-lg p-4 bg-green-50 text-green-700 mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span>All validations passed successfully!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div className="bg-red-600 text-white p-3 font-semibold">
        {totalErrors} Validation {totalErrors === 1 ? 'Error' : 'Errors'} Found
      </div>
      <div className="p-4 bg-red-50 max-h-96 overflow-y-auto">
        {(Object.entries(errors) as Array<[keyof typeof errors, ValidationError[]]>).map(([entityType, entityErrors]) => {
          if (entityErrors.length === 0) return null;
          
          return (
            <div key={entityType} className="mb-4 last:mb-0">
              <h3 className="font-semibold text-gray-800 mb-2 capitalize">{entityType}</h3>
              <ul className="space-y-2">
                {entityErrors.map((error, index) => (
                  <li 
                    key={`${entityType}-${index}`} 
                    className="flex items-start p-2 hover:bg-red-100 rounded cursor-pointer"
                    onClick={() => onErrorSelect(entityType as 'clients' | 'tasks' | 'workers', error.row, error.column)}
                  >
                    <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <div>
                      <div className="font-medium text-red-700">
                        {error.row > 0 ? `Row ${error.row}` : 'Sheet'}{error.column ? `, Column ${error.column}` : ''}
                      </div>
                      <div className="text-sm text-red-600">{error.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
