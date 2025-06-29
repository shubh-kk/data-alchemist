'use client';
import { useState, useRef } from 'react';
import { FileUploader, ParsedSheet } from '../components/FileUploader';
import { DataGridView } from '../components/DataGridView';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { validateData, ValidationError } from '../lib/validators';
import { createFilterFromNL } from '../lib/nlFilter';

export default function Home() {
  const [clients, setClients] = useState<ParsedSheet>([]);
  const [tasks, setTasks] = useState<ParsedSheet>([]);
  const [workers, setWorkers] = useState<ParsedSheet>([]);
  const [filteredClients, setFilteredClients] = useState<ParsedSheet>([]);
  const [filteredTasks, setFilteredTasks] = useState<ParsedSheet>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<ParsedSheet>([]);
  const [errors, setErrors] = useState<Record<'clients' | 'tasks' | 'workers', ValidationError[]>>({
    clients: [],
    tasks: [],
    workers: []
  });
  const [nlFilter, setNlFilter] = useState<string>('');
  const [activeEntity, setActiveEntity] = useState<'clients' | 'tasks' | 'workers'>('clients');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  
  // Refs to the grid sections for scrolling
  const clientsRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);
  const workersRef = useRef<HTMLDivElement>(null);
  
  const handleDataUploaded = (clients: ParsedSheet, tasks: ParsedSheet, workers: ParsedSheet) => {
    setClients(clients);
    setTasks(tasks);
    setWorkers(workers);
    setFilteredClients(clients);
    setFilteredTasks(tasks);
    setFilteredWorkers(workers);
    
    // Run validations
    const validationResults = validateData(clients, tasks, workers);
    setErrors(validationResults);
  };
  
  const handleApplyFilter = async () => {
    if (!nlFilter.trim()) {
      // If filter is empty, reset to original data
      setFilteredClients(clients);
      setFilteredTasks(tasks);
      setFilteredWorkers(workers);
      console.log('⚠️ Empty filter, resetting to original data');
      return;
    }
    
    setIsFiltering(true);
    try {
      console.log(`🔎 Applying filter "${nlFilter}" to ${activeEntity}`);
      
      const filterFn = await createFilterFromNL(nlFilter, activeEntity);
      
      switch (activeEntity) {
        case 'clients':
          console.log(`📊 Filtering ${clients.length} clients`);
          const filteredClientResults = clients.filter(filterFn);
          console.log(`📊 Filter result: ${filteredClientResults.length} clients matched`);
          setFilteredClients(filteredClientResults);
          break;
        case 'tasks':
          console.log(`📊 Filtering ${tasks.length} tasks`);
          const filteredTaskResults = tasks.filter(filterFn);
          console.log(`📊 Filter result: ${filteredTaskResults.length} tasks matched`);
          setFilteredTasks(filteredTaskResults);
          break;
        case 'workers':
          console.log(`📊 Filtering ${workers.length} workers`);
          const filteredWorkerResults = workers.filter(filterFn);
          console.log(`📊 Filter result: ${filteredWorkerResults.length} workers matched`);
          setFilteredWorkers(filteredWorkerResults);
          break;
      }
    } catch (error) {
      console.error('Filter application error:', error);
      // In case of error, reset to the original data to avoid empty results
      switch (activeEntity) {
        case 'clients': setFilteredClients(clients); break;
        case 'tasks': setFilteredTasks(tasks); break;
        case 'workers': setFilteredWorkers(workers); break;
      }
    } finally {
      setIsFiltering(false);
    }
  };
  
  const handleErrorSelect = (entityType: 'clients' | 'tasks' | 'workers', row: number, column?: string) => {
    // Scroll to the appropriate section
    if (entityType === 'clients' && clientsRef.current) {
      clientsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (entityType === 'tasks' && tasksRef.current) {
      tasksRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (entityType === 'workers' && workersRef.current) {
      workersRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Alchemist</h1>
        <p className="text-gray-600">Upload client, task, and worker data files for validation</p>
      </header>
      
      <section className="mb-8">
        <FileUploader onData={handleDataUploaded} />
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Sample Files</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <a
              href="/samples/clients.csv"
              download
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded inline-flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              clients.csv
            </a>
            <a
              href="/samples/tasks.csv"
              download
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded inline-flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              tasks.csv
            </a>
            <a
              href="/samples/workers.csv"
              download
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded inline-flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              workers.csv
            </a>
          </div>
          
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Raw Sample Files</h3>
          <div className="flex flex-wrap gap-2">
            <a
              href="/samples/sample-v1.csv"
              download
              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 py-1 px-2 rounded inline-flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              sample-v1.csv
            </a>
            <a
              href="/samples/sample-v2.csv"
              download
              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 py-1 px-2 rounded inline-flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              sample-v2.csv
            </a>
          </div>
          
          <p className="text-xs text-blue-700 mt-2">
            The formatted sample files (clients, tasks, workers) contain intentional errors to demonstrate validation features. The raw sample files are the original data files.
          </p>
        </div>
      </section>
      
      <section className="mb-8">
        <ErrorDisplay errors={errors} onErrorSelect={handleErrorSelect} />
      </section>
      
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
                    className={`px-3 py-1 rounded-lg text-sm capitalize ${
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
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
        {activeEntity === 'clients' && filteredClients.length !== clients.length && (
          <div className="mt-3 text-sm text-blue-600">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        )}
        {activeEntity === 'tasks' && filteredTasks.length !== tasks.length && (
          <div className="mt-3 text-sm text-blue-600">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        )}
        {activeEntity === 'workers' && filteredWorkers.length !== workers.length && (
          <div className="mt-3 text-sm text-blue-600">
            Showing {filteredWorkers.length} of {workers.length} workers
          </div>
        )}
      </section>
      
      <section className="space-y-8">
        <div ref={clientsRef}>
          <DataGridView 
            data={filteredClients} 
            errors={errors.clients} 
            title={`Clients ${activeEntity === 'clients' && filteredClients.length !== clients.length ? `(Filtered: ${filteredClients.length}/${clients.length})` : ''}`}
          />
        </div>
        
        <div ref={tasksRef}>
          <DataGridView 
            data={filteredTasks} 
            errors={errors.tasks} 
            title={`Tasks ${activeEntity === 'tasks' && filteredTasks.length !== tasks.length ? `(Filtered: ${filteredTasks.length}/${tasks.length})` : ''}`}
          />
        </div>
        
        <div ref={workersRef}>
          <DataGridView 
            data={filteredWorkers} 
            errors={errors.workers} 
            title={`Workers ${activeEntity === 'workers' && filteredWorkers.length !== workers.length ? `(Filtered: ${filteredWorkers.length}/${workers.length})` : ''}`}
          />
        </div>
      </section>
    </div>
  );
}

