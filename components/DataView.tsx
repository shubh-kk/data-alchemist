'use client';
import { ErrorDisplay } from './ErrorDisplay';
import { NLFilterSection } from './NLFilterSection';
import { DataGridsSection } from './DataGridsSection';
import { ParsedSheet } from './FileUploader';
import { ValidationError } from '../lib/validators';

interface DataViewProps {
  clients: ParsedSheet;
  tasks: ParsedSheet;
  workers: ParsedSheet;
  filteredClients: ParsedSheet;
  filteredTasks: ParsedSheet;
  filteredWorkers: ParsedSheet;
  errors: Record<'clients' | 'tasks' | 'workers', ValidationError[]>;
  activeEntity: 'clients' | 'tasks' | 'workers';
  onFilterResults: (
    entity: 'clients' | 'tasks' | 'workers',
    filteredClients: ParsedSheet,
    filteredTasks: ParsedSheet,
    filteredWorkers: ParsedSheet
  ) => void;
  onErrorSelect: (entityType: 'clients' | 'tasks' | 'workers', row: number, column?: string) => void;
}

export function DataView({
  clients,
  tasks,
  workers,
  filteredClients,
  filteredTasks,
  filteredWorkers,
  errors,
  activeEntity,
  onFilterResults,
  onErrorSelect
}: DataViewProps) {
  return (
    <>
      <section className="mb-8">
        <ErrorDisplay errors={errors} onErrorSelect={onErrorSelect} />
      </section>
      
      <NLFilterSection
        clients={clients}
        tasks={tasks}
        workers={workers}
        onFilterResults={onFilterResults}
      />
      
      <DataGridsSection
        clients={clients}
        tasks={tasks}
        workers={workers}
        filteredClients={filteredClients}
        filteredTasks={filteredTasks}
        filteredWorkers={filteredWorkers}
        errors={errors}
        activeEntity={activeEntity}
      />
    </>
  );
}
