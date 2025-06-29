'use client';
import { useState, useRef } from 'react';
import { FileUploader, ParsedSheet } from '../components/FileUploader';
import { DataGridView } from '../components/DataGridView';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { validateData, ValidationError } from '../lib/validators';

export default function Home() {
  const [clients, setClients] = useState<ParsedSheet>([]);
  const [tasks, setTasks] = useState<ParsedSheet>([]);
  const [workers, setWorkers] = useState<ParsedSheet>([]);
  const [errors, setErrors] = useState<Record<'clients' | 'tasks' | 'workers', ValidationError[]>>({
    clients: [],
    tasks: [],
    workers: []
  });
  
  // Refs to the grid sections for scrolling
  const clientsRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);
  const workersRef = useRef<HTMLDivElement>(null);
  
  const handleDataUploaded = (clients: ParsedSheet, tasks: ParsedSheet, workers: ParsedSheet) => {
    setClients(clients);
    setTasks(tasks);
    setWorkers(workers);
    
    // Run validations
    const validationResults = validateData(clients, tasks, workers);
    setErrors(validationResults);
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
      
      <section className="space-y-8">
        <div ref={clientsRef}>
          <DataGridView 
            data={clients} 
            errors={errors.clients} 
            title="Clients"
          />
        </div>
        
        <div ref={tasksRef}>
          <DataGridView 
            data={tasks} 
            errors={errors.tasks} 
            title="Tasks"
          />
        </div>
        
        <div ref={workersRef}>
          <DataGridView 
            data={workers} 
            errors={errors.workers} 
            title="Workers"
          />
        </div>
      </section>
    </div>
  );
}

