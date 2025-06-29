'use client';

export function SampleFilesSection() {
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-sm font-semibold text-blue-800 mb-2">Sample Files</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        <SampleFileLink filename="clients.csv" />
        <SampleFileLink filename="tasks.csv" />
        <SampleFileLink filename="workers.csv" />
      </div>
      
      <h3 className="text-sm font-semibold text-blue-800 mb-2">Raw Sample Files</h3>
      <div className="flex flex-wrap gap-2">
        <SampleFileLink filename="sample data v1.xlsx" variant="green" />
        <SampleFileLink filename="sample data v2.xlsx" variant="green" />
        <SampleFileLink filename="[V1] Data Alchemist - Sample Data.xlsx" variant="green" />
      </div>
      
      <p className="text-xs text-blue-700 mt-2">
        The formatted sample files (clients, tasks, workers) contain intentional errors to demonstrate validation features. 
        The raw sample files are the original data files.
      </p>
    </div>
  );
}

interface SampleFileLinkProps {
  filename: string;
  variant?: 'blue' | 'green';
}

function SampleFileLink({ filename, variant = 'blue' }: SampleFileLinkProps) {
  const colorClass = variant === 'blue' 
    ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' 
    : 'bg-green-100 hover:bg-green-200 text-green-800';
  
  return (
    <a
      href={`/samples/${filename}`}
      download
      className={`text-xs ${colorClass} py-1 px-2 rounded inline-flex items-center`}
    >
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
      </svg>
      {filename}
    </a>
  );
}
