'use client';
import { useState } from 'react';
import { FileUploader, ParsedSheet } from '../components/FileUploader';
import { validateData, ValidationError } from '../lib/validators';
import { RuleBuilder } from '../components/RuleBuilder';
import { SampleFilesSection } from '../components/SampleFilesSection';
import { TabsNavigation } from '../components/TabsNavigation';
import { DataView } from '../components/DataView';

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
  const [activeEntity, setActiveEntity] = useState<'clients' | 'tasks' | 'workers'>('clients');
  const [activeTab, setActiveTab] = useState<'data' | 'rules'>('data');
  
  const handleDataUploaded = (clients: ParsedSheet, tasks: ParsedSheet, workers: ParsedSheet) => {
    setClients(clients);
    setTasks(tasks);
    setWorkers(workers);
    setFilteredClients(clients);
    setFilteredTasks(tasks);
    setFilteredWorkers(workers);
    
    const validationResults = validateData(clients, tasks, workers);
    setErrors(validationResults);
  };

  const handleFilterResults = (
    entity: 'clients' | 'tasks' | 'workers',
    filteredClients: ParsedSheet,
    filteredTasks: ParsedSheet,
    filteredWorkers: ParsedSheet
  ) => {
    setActiveEntity(entity);
    setFilteredClients(filteredClients);
    setFilteredTasks(filteredTasks);
    setFilteredWorkers(filteredWorkers);
  };
  
  const handleErrorSelect = (entityType: 'clients' | 'tasks' | 'workers', row: number, column?: string) => {
    setActiveEntity(entityType);
  };
  
  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Alchemist</h1>
        <p className="text-gray-600">Upload client, task, and worker data files for validation</p>
      </header>
      
      <TabsNavigation 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
      />
      
      <section className="mb-8">
        <FileUploader onData={handleDataUploaded} />
        <SampleFilesSection />
      </section>
      
      {activeTab === 'data' && (
        <DataView
          clients={clients}
          tasks={tasks}
          workers={workers}
          filteredClients={filteredClients}
          filteredTasks={filteredTasks}
          filteredWorkers={filteredWorkers}
          errors={errors}
          activeEntity={activeEntity}
          onFilterResults={handleFilterResults}
          onErrorSelect={handleErrorSelect}
        />
      )}
      
      {activeTab === 'rules' && (
        <section>
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800">
            <p>
              <span className="font-semibold">Rule Builder:</span> Define business rules that govern how clients, tasks, and workers interact in allocation processes.
            </p>
          </div>
          <RuleBuilder 
            clients={clients} 
            tasks={tasks} 
            workers={workers} 
          />
        </section>
      )}
    </div>
  );
}

