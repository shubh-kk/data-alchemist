'use client';
import { useState } from "react";
import { PriorityWeights } from "../lib/ruleTypes";
import { ParsedSheet } from "./FileUploader";

interface PriorityWeightsBuilderProps {
  weights: PriorityWeights;
  clients: ParsedSheet;
  tasks: ParsedSheet;
  onUpdate: (updatedWeights: PriorityWeights) => void;
}

export function PriorityWeightsBuilder({ 
  weights, 
  clients, 
  tasks, 
  onUpdate 
}: PriorityWeightsBuilderProps) {
  const [activeTab, setActiveTab] = useState<'clients' | 'tasks'>('clients');
  
  // Function to handle client weight update
  const handleClientWeightChange = (clientId: string, value: number) => {
    const newWeights: PriorityWeights = {
      ...weights,
      clients: {
        ...weights.clients,
        [clientId]: value
      }
    };
    
    onUpdate(newWeights);
  };
  
  // Function to handle task weight update
  const handleTaskWeightChange = (taskId: string, value: number) => {
    const newWeights: PriorityWeights = {
      ...weights,
      tasks: {
        ...weights.tasks,
        [taskId]: value
      }
    };
    
    onUpdate(newWeights);
  };
  
  // Get default weight or existing weight for a client
  const getClientWeight = (clientId: string) => {
    return weights.clients[clientId] !== undefined
      ? weights.clients[clientId]
      : 0.1; // Default weight of 0.1
  };
  
  // Get default weight or existing weight for a task
  const getTaskWeight = (taskId: string) => {
    return weights.tasks[taskId] !== undefined
      ? weights.tasks[taskId]
      : 0.1; // Default weight of 0.1
  };
  
  // Reset all client weights to 0.1
  const handleResetClientWeights = () => {
    const resetWeights: PriorityWeights = {
      ...weights,
      clients: {}
    };
    onUpdate(resetWeights);
  };
  
  // Reset all task weights to 0.1
  const handleResetTaskWeights = () => {
    const resetWeights: PriorityWeights = {
      ...weights,
      tasks: {}
    };
    onUpdate(resetWeights);
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Priority Weights</h3>
      
      <div className="mb-4 border-b">
        <div className="flex justify-between">
          <div className="flex">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'clients'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('clients')}
            >
              Client Weights
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              Task Weights
            </button>
          </div>
          <button
            onClick={activeTab === 'clients' ? handleResetClientWeights : handleResetTaskWeights}
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Reset to 0.1
          </button>
        </div>
      </div>
      
      {/* Client Weights Panel */}
      {activeTab === 'clients' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {clients.length === 0 ? (
            <div className="text-gray-500 text-sm italic">No clients available</div>
          ) : (
            clients.map(client => (
              <div key={client.ClientID} className="border rounded-md p-3 bg-white">
                <div className="flex justify-between mb-1">
                  <label htmlFor={`client-${client.ClientID}`} className="font-medium text-sm">
                    {client.ClientName || client.ClientID}
                  </label>
                  <span className="text-sm font-medium text-blue-600">
                    {getClientWeight(client.ClientID).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">0.1</span>
                  <input
                    id={`client-${client.ClientID}`}
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={getClientWeight(client.ClientID)}
                    onChange={e => handleClientWeightChange(
                      client.ClientID,
                      parseFloat(e.target.value)
                    )}
                    className="flex-grow"
                  />
                  <span className="text-xs">1.0</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Task Weights Panel */}
      {activeTab === 'tasks' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {tasks.length === 0 ? (
            <div className="text-gray-500 text-sm italic">No tasks available</div>
          ) : (
            tasks.map(task => (
              <div key={task.TaskID} className="border rounded-md p-3 bg-white">
                <div className="flex justify-between mb-1">
                  <label htmlFor={`task-${task.TaskID}`} className="font-medium text-sm">
                    {task.TaskName || task.TaskID}
                  </label>
                  <span className="text-sm font-medium text-blue-600">
                    {getTaskWeight(task.TaskID).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">0.1</span>
                  <input
                    id={`task-${task.TaskID}`}
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={getTaskWeight(task.TaskID)}
                    onChange={e => handleTaskWeightChange(
                      task.TaskID,
                      parseFloat(e.target.value)
                    )}
                    className="flex-grow"
                  />
                  <span className="text-xs">1.0</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
