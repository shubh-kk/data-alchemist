'use client';
import { useState } from "react";
import { LoadLimit } from "../lib/ruleTypes";
import { ParsedSheet } from "./FileUploader";
import { validateLoadLimit } from "../lib/ruleValidators";

interface LoadLimitBuilderProps {
  loadLimits: LoadLimit[];
  workers: ParsedSheet;
  onUpdate: (updatedLimits: LoadLimit[]) => void;
}

export function LoadLimitBuilder({ 
  loadLimits, 
  workers, 
  onUpdate 
}: LoadLimitBuilderProps) {
  const [newLimit, setNewLimit] = useState<LoadLimit>({ 
    workerId: "", 
    maxLoadPerPhase: 8 
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const availableWorkers = workers
    .filter(worker => {
      if (editingIndex === null) {
        // For new limit, exclude workers that already have limits
        return !loadLimits.some(limit => limit.workerId === worker.WorkerID);
      } else {
        // For editing, exclude workers that have limits other than the current one
        return !loadLimits.some((limit, i) => i !== editingIndex && limit.workerId === worker.WorkerID);
      }
    })
    .map(worker => ({
      id: worker.WorkerID,
      label: `${worker.WorkerID}: ${worker.WorkerName || 'Unknown Worker'}`
    }));
  
  const handleAddLimit = () => {
    setIsAdding(true);
    setNewLimit({ workerId: "", maxLoadPerPhase: 8 });
    setValidationErrors([]);
  };
  
  const handleEditLimit = (index: number) => {
    setEditingIndex(index);
    setNewLimit({ ...loadLimits[index] });
    setValidationErrors([]);
  };
  
  const handleSaveLimit = () => {
    const validation = validateLoadLimit(newLimit, workers);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    let updatedLimits: LoadLimit[];
    
    if (editingIndex !== null) {
      // Update existing limit
      updatedLimits = [
        ...loadLimits.slice(0, editingIndex),
        newLimit,
        ...loadLimits.slice(editingIndex + 1)
      ];
    } else {
      // Add new limit
      updatedLimits = [...loadLimits, newLimit];
    }
    
    onUpdate(updatedLimits);
    setIsAdding(false);
    setEditingIndex(null);
    setNewLimit({ workerId: "", maxLoadPerPhase: 8 });
    setValidationErrors([]);
  };
  
  const handleCancelEdit = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewLimit({ workerId: "", maxLoadPerPhase: 8 });
    setValidationErrors([]);
  };
  
  const handleDeleteLimit = (index: number) => {
    const updatedLimits = [
      ...loadLimits.slice(0, index),
      ...loadLimits.slice(index + 1)
    ];
    
    onUpdate(updatedLimits);
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Load Limits</h3>
        {!isAdding && editingIndex === null && (
          <button
            onClick={handleAddLimit}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Limit
          </button>
        )}
      </div>
      
      {/* Limit editor */}
      {(isAdding || editingIndex !== null) && (
        <div className="bg-gray-50 border rounded-md p-4 mb-4">
          <h4 className="font-medium mb-2">
            {editingIndex !== null ? 'Edit Load Limit' : 'Add New Load Limit'}
          </h4>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Worker</label>
            <select
              value={newLimit.workerId}
              onChange={e => setNewLimit({ 
                ...newLimit, 
                workerId: e.target.value 
              })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a worker</option>
              {availableWorkers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Maximum Load Per Phase: {newLimit.maxLoadPerPhase}
            </label>
            <input
              type="range"
              min="1"
              max="16"
              step="0.5"
              value={newLimit.maxLoadPerPhase}
              onChange={e => setNewLimit({
                ...newLimit,
                maxLoadPerPhase: parseFloat(e.target.value)
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>8</span>
              <span>16</span>
            </div>
          </div>
          
          {validationErrors.length > 0 && (
            <div className="mb-3 text-red-500 text-sm">
              {validationErrors.map((error, idx) => (
                <p key={idx}>{error}</p>
              ))}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLimit}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Limit
            </button>
          </div>
        </div>
      )}
      
      {/* List of existing limits */}
      <div className="space-y-2">
        {loadLimits.length === 0 ? (
          <div className="text-gray-500 text-sm italic">No load limits defined</div>
        ) : (
          loadLimits.map((limit, index) => (
            <div 
              key={index} 
              className="border rounded-md p-3 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {workers.find(w => w.WorkerID === limit.workerId)?.WorkerName || limit.workerId}
                  </h4>
                  <div className="mt-1 text-sm text-gray-600">
                    Max load per phase: <span className="font-medium">{limit.maxLoadPerPhase}</span> hours
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditLimit(index)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteLimit(index)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
