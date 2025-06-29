'use client';
import { useRef } from 'react';
import { DataGridView } from './DataGridView';
import { ParsedSheet } from './FileUploader';
import { ValidationError } from '../lib/validators';

interface DataGridsSectionProps {
  clients: ParsedSheet;
  tasks: ParsedSheet;
  workers: ParsedSheet;
  filteredClients: ParsedSheet;
  filteredTasks: ParsedSheet;
  filteredWorkers: ParsedSheet;
  errors: Record<'clients' | 'tasks' | 'workers', ValidationError[]>;
  activeEntity: 'clients' | 'tasks' | 'workers';
}

export function DataGridsSection({ 
  clients, 
  tasks, 
  workers,
  filteredClients,
  filteredTasks,
  filteredWorkers,
  errors,
  activeEntity
}: DataGridsSectionProps) {
  const clientsRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);
  const workersRef = useRef<HTMLDivElement>(null);

  return (
    <section className="space-y-8">
      <div ref={clientsRef}>
        <DataGridView 
          data={filteredClients} 
          errors={errors.clients} 
          title={`Clients ${
            activeEntity === 'clients' && filteredClients.length !== clients.length 
              ? `(Filtered: ${filteredClients.length}/${clients.length})` 
              : ''
          }`}
        />
      </div>
      
      <div ref={tasksRef}>
        <DataGridView 
          data={filteredTasks} 
          errors={errors.tasks} 
          title={`Tasks ${
            activeEntity === 'tasks' && filteredTasks.length !== tasks.length 
              ? `(Filtered: ${filteredTasks.length}/${tasks.length})` 
              : ''
          }`}
        />
      </div>
      
      <div ref={workersRef}>
        <DataGridView 
          data={filteredWorkers} 
          errors={errors.workers} 
          title={`Workers ${
            activeEntity === 'workers' && filteredWorkers.length !== workers.length 
              ? `(Filtered: ${filteredWorkers.length}/${workers.length})` 
              : ''
          }`}
        />
      </div>
    </section>
  );
}
