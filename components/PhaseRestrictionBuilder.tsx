'use client';
import { useState } from "react";
import { PhaseRestriction } from "../lib/ruleTypes";
import { ParsedSheet } from "./FileUploader";
import { validatePhaseRestriction } from "../lib/ruleValidators";

interface PhaseRestrictionBuilderProps {
  restrictions: PhaseRestriction[];
  tasks: ParsedSheet;
  onUpdate: (updatedRestrictions: PhaseRestriction[]) => void;
}

export function PhaseRestrictionBuilder({ 
  restrictions, 
  tasks, 
  onUpdate 
}: PhaseRestrictionBuilderProps) {
  const [newRestriction, setNewRestriction] = useState<PhaseRestriction>({ 
    taskId: "", 
    allowedPhases: [] 
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const maxPhase = 5; // Assuming maximum 5 phases for now
  const availableTasks = tasks
    .filter(task => {
      if (editingIndex === null) {
        // For new restriction, exclude tasks that already have restrictions
        return !restrictions.some(r => r.taskId === task.TaskID);
      } else {
        // For editing, exclude tasks that have restrictions other than the current one
        return !restrictions.some((r, i) => i !== editingIndex && r.taskId === task.TaskID);
      }
    })
    .map(task => ({
      id: task.TaskID,
      label: `${task.TaskID}: ${task.TaskName || 'Unknown Task'}`
    }));
  
  const handleAddRestriction = () => {
    setIsAdding(true);
    setNewRestriction({ taskId: "", allowedPhases: [] });
    setValidationErrors([]);
  };
  
  const handleEditRestriction = (index: number) => {
    setEditingIndex(index);
    setNewRestriction({ ...restrictions[index] });
    setValidationErrors([]);
  };
  
  const handleSaveRestriction = () => {
    const validation = validatePhaseRestriction(newRestriction, tasks);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    let updatedRestrictions: PhaseRestriction[];
    
    if (editingIndex !== null) {
      // Update existing restriction
      updatedRestrictions = [
        ...restrictions.slice(0, editingIndex),
        newRestriction,
        ...restrictions.slice(editingIndex + 1)
      ];
    } else {
      // Add new restriction
      updatedRestrictions = [...restrictions, newRestriction];
    }
    
    onUpdate(updatedRestrictions);
    setIsAdding(false);
    setEditingIndex(null);
    setNewRestriction({ taskId: "", allowedPhases: [] });
    setValidationErrors([]);
  };
  
  const handleCancelEdit = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewRestriction({ taskId: "", allowedPhases: [] });
    setValidationErrors([]);
  };
  
  const handleDeleteRestriction = (index: number) => {
    const updatedRestrictions = [
      ...restrictions.slice(0, index),
      ...restrictions.slice(index + 1)
    ];
    
    onUpdate(updatedRestrictions);
  };
  
  const handlePhaseToggle = (phase: number) => {
    const currentPhases = newRestriction.allowedPhases;
    
    if (currentPhases.includes(phase)) {
      // Remove phase if it's already selected
      setNewRestriction({
        ...newRestriction,
        allowedPhases: currentPhases.filter(p => p !== phase)
      });
    } else {
      // Add phase if it's not already selected
      setNewRestriction({
        ...newRestriction,
        allowedPhases: [...currentPhases, phase].sort((a, b) => a - b)
      });
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Phase Restrictions</h3>
        {!isAdding && editingIndex === null && (
          <button
            onClick={handleAddRestriction}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Restriction
          </button>
        )}
      </div>
      
      {/* Restriction editor */}
      {(isAdding || editingIndex !== null) && (
        <div className="bg-gray-50 border rounded-md p-4 mb-4">
          <h4 className="font-medium mb-2">
            {editingIndex !== null ? 'Edit Restriction' : 'Add New Restriction'}
          </h4>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Task</label>
            <select
              value={newRestriction.taskId}
              onChange={e => setNewRestriction({ 
                ...newRestriction, 
                taskId: e.target.value 
              })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a task</option>
              {availableTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Allowed Phases</label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: maxPhase }, (_, i) => i + 1).map(phase => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => handlePhaseToggle(phase)}
                  className={`w-10 h-10 rounded-md flex items-center justify-center ${
                    newRestriction.allowedPhases.includes(phase)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {phase}
                </button>
              ))}
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
              onClick={handleSaveRestriction}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Restriction
            </button>
          </div>
        </div>
      )}
      
      {/* List of existing restrictions */}
      <div className="space-y-2">
        {restrictions.length === 0 ? (
          <div className="text-gray-500 text-sm italic">No phase restrictions defined</div>
        ) : (
          restrictions.map((restriction, index) => (
            <div 
              key={index} 
              className="border rounded-md p-3 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {tasks.find(t => t.TaskID === restriction.taskId)?.TaskName || restriction.taskId}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-sm text-gray-600">Phases: </span>
                    {restriction.allowedPhases.map(phase => (
                      <span 
                        key={phase} 
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRestriction(index)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteRestriction(index)}
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
