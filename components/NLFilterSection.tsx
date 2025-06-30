'use client';
import { useState } from 'react';
import { ParsedSheet } from './FileUploader';
import { createFilterFromNL } from '../lib/nlFilter';

type EntityType = 'clients' | 'tasks' | 'workers';

interface NLFilterSectionProps {
  clients: ParsedSheet;
  tasks: ParsedSheet;
  workers: ParsedSheet;
  onFilterResults: (
    entity: EntityType,
    filteredClients: ParsedSheet,
    filteredTasks: ParsedSheet,
    filteredWorkers: ParsedSheet
  ) => void;
}

export function NLFilterSection({ 
  clients, tasks, workers, onFilterResults 
}: NLFilterSectionProps) {
  const [nlFilter, setNlFilter] = useState<string>('');
  const [activeEntity, setActiveEntity] = useState<EntityType>('clients');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  
  const handleApplyFilter = async () => {
    if (!nlFilter.trim()) {
      onFilterResults(activeEntity, clients, tasks, workers);
      return;
    }
    
    setIsFiltering(true);
    try {
      const filterFn = await createFilterFromNL(nlFilter, activeEntity);
      
      let filteredClients = clients;
      let filteredTasks = tasks;
      let filteredWorkers = workers;
      
      switch (activeEntity) {
        case 'clients':
          filteredClients = clients.filter(filterFn);
          break;
        case 'tasks':
          filteredTasks = tasks.filter(filterFn);
          break;
        case 'workers':
          filteredWorkers = workers.filter(filterFn);
          break;
      }
      
      onFilterResults(activeEntity, filteredClients, filteredTasks, filteredWorkers);
    } catch (error) {
      onFilterResults(activeEntity, clients, tasks, workers);
    } finally {
      setIsFiltering(false);
    }
  };
  
  const getFilterResultCount = (entity: EntityType) => {
    switch (entity) {
      case 'clients': 
        return {
          current: activeEntity === 'clients' ? clients.filter((c) => true).length : clients.length,
          total: clients.length
        };
      case 'tasks': 
        return {
          current: activeEntity === 'tasks' ? tasks.filter((t) => true).length : tasks.length,
          total: tasks.length
        };
      case 'workers': 
        return {
          current: activeEntity === 'workers' ? workers.filter((w) => true).length : workers.length,
          total: workers.length
        };
    }
  };
  
  return (
    <section className="mb-8 border rounded-lg p-4 bg-gray-50">
      <h3 className="text-xl font-semibold mb-3">Natural Language Filter</h3>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-3">
            <label className="font-medium">Filter Entity:</label>
            <div className="flex gap-2">
              {(['clients', 'tasks', 'workers'] as const).map((entity) => (
                <button
                  key={entity}
                  className={`px-3 py-1 rounded-lg text-sm capitalize cursor-pointer ${
                    activeEntity === entity 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveEntity(entity)}
                >
                  {entity}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={nlFilter}
            onChange={(e) => setNlFilter(e.target.value)}
            placeholder="Enter a natural language filter (e.g., 'priority >= 3')"
            className="w-full p-2 border rounded-md"
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
          />
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer"
          onClick={handleApplyFilter}
          disabled={isFiltering}
        >
          {isFiltering ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Apply NL Filter'
          )}
        </button>
      </div>
      
      {/* Filter results summary */}
      {(['clients', 'tasks', 'workers'] as const).map(entity => {
        const counts = getFilterResultCount(entity);
        return counts.current !== counts.total && activeEntity === entity ? (
          <div key={entity} className="mt-3 text-sm text-blue-600">
            Showing {counts.current} of {counts.total} {entity}
          </div>
        ) : null;
      })}
    </section>
  );
}
