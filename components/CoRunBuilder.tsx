'use client';
import { useState } from "react";
import { CoRunGroup } from "../lib/ruleTypes";
import { ParsedSheet } from "./FileUploader";
import { validateCoRunGroup } from "../lib/ruleValidators";

interface CoRunBuilderProps {
  groups: CoRunGroup[];
  tasks: ParsedSheet;
  onUpdate: (updatedGroups: CoRunGroup[]) => void;
}

export function CoRunBuilder({ groups, tasks, onUpdate }: CoRunBuilderProps) {
  const [newGroup, setNewGroup] = useState<CoRunGroup>({ groupName: "", taskIds: [] });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Convert tasks to options for multi-select
  const taskOptions = tasks.map(task => ({
    id: task.TaskID,
    label: `${task.TaskID}: ${task.TaskName || 'Unknown Task'}`
  }));
  
  const handleAddGroup = () => {
    setIsAdding(true);
    setNewGroup({ groupName: "", taskIds: [] });
    setValidationErrors([]);
  };
  
  const handleEditGroup = (index: number) => {
    setEditingIndex(index);
    setNewGroup({ ...groups[index] });
    setValidationErrors([]);
  };
  
  const handleSaveGroup = () => {
    const validation = validateCoRunGroup(newGroup, tasks);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    let updatedGroups: CoRunGroup[];
    
    if (editingIndex !== null) {
      // Update existing group
      updatedGroups = [
        ...groups.slice(0, editingIndex),
        newGroup,
        ...groups.slice(editingIndex + 1)
      ];
    } else {
      // Add new group
      updatedGroups = [...groups, newGroup];
    }
    
    onUpdate(updatedGroups);
    setIsAdding(false);
    setEditingIndex(null);
    setNewGroup({ groupName: "", taskIds: [] });
    setValidationErrors([]);
  };
  
  const handleCancelEdit = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewGroup({ groupName: "", taskIds: [] });
    setValidationErrors([]);
  };
  
  const handleDeleteGroup = (index: number) => {
    const updatedGroups = [
      ...groups.slice(0, index),
      ...groups.slice(index + 1)
    ];
    
    onUpdate(updatedGroups);
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Co-Run Groups</h3>
        {!isAdding && editingIndex === null && (
          <button
            onClick={handleAddGroup}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Group
          </button>
        )}
      </div>
      
      {/* Group editor */}
      {(isAdding || editingIndex !== null) && (
        <div className="bg-gray-50 border rounded-md p-4 mb-4">
          <h4 className="font-medium mb-2">
            {editingIndex !== null ? 'Edit Group' : 'Add New Group'}
          </h4>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              type="text"
              value={newGroup.groupName}
              onChange={e => setNewGroup({ ...newGroup, groupName: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter a descriptive name"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Tasks</label>
            <select
              multiple
              value={newGroup.taskIds}
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                setNewGroup({ ...newGroup, taskIds: selected });
              }}
              className="w-full p-2 border rounded-md h-32"
            >
              {taskOptions.map(task => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple tasks</p>
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
              onClick={handleSaveGroup}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Group
            </button>
          </div>
        </div>
      )}
      
      {/* List of existing groups */}
      <div className="space-y-2">
        {groups.length === 0 ? (
          <div className="text-gray-500 text-sm italic">No co-run groups defined</div>
        ) : (
          groups.map((group, index) => (
            <div 
              key={index} 
              className="border rounded-md p-3 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{group.groupName}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {group.taskIds.map(taskId => (
                      <span 
                        key={taskId} 
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {taskId}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditGroup(index)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(index)}
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
