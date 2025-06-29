'use client';
export async function createFilterFromNL(
  nlQuery: string, 
  entity: 'clients' | 'tasks' | 'workers'
): Promise<(row: any) => boolean> {
  try {
    // Convert query to lowercase for case-insensitive matching
    const query = nlQuery.toLowerCase().trim();
    
    // Handle priority filters
    if (query.includes('priority')) {
      // Handle greater than or equal
      if (query.includes('>=') || query.includes('greater than or equal') || query.includes('at least')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.PriorityLevel >= value;
        }
      }
      // Handle less than or equal
      else if (query.includes('<=') || query.includes('less than or equal') || query.includes('at most')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.PriorityLevel <= value;
        }
      }
      // Handle greater than
      else if (query.includes('>') || query.includes('greater than') || query.includes('more than')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.PriorityLevel > value;
        }
      }
      // Handle less than
      else if (query.includes('<') || query.includes('less than')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.PriorityLevel < value;
        }
      }
      // Handle equal to
      else if (query.includes('=') || query.includes('equal') || query.includes('is')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.PriorityLevel === value;
        }
      }
      // Handle high priority as a concept
      else if (query.includes('high')) {
        return (row) => row.PriorityLevel >= 4;
      }
      // Handle medium priority as a concept
      else if (query.includes('medium')) {
        return (row) => row.PriorityLevel >= 2 && row.PriorityLevel <= 3;
      }
      // Handle low priority as a concept
      else if (query.includes('low')) {
        return (row) => row.PriorityLevel <= 1;
      }
    }
    
    // Handle duration filters (for tasks)
    if (query.includes('duration') && entity === 'tasks') {
      // Handle greater than or equal
      if (query.includes('>=') || query.includes('greater than or equal') || query.includes('at least')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.Duration >= value;
        }
      }
      // Handle less than or equal
      else if (query.includes('<=') || query.includes('less than or equal') || query.includes('at most')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.Duration <= value;
        }
      }
      // Handle greater than
      else if (query.includes('>') || query.includes('greater than') || query.includes('more than')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.Duration > value;
        }
      }
      // Handle less than
      else if (query.includes('<') || query.includes('less than')) {
        const match = query.match(/(\d+)/);
        if (match && match[1]) {
          const value = parseInt(match[1]);
          return (row) => row.Duration < value;
        }
      }
      // Handle long duration as a concept
      else if (query.includes('long')) {
        return (row) => row.Duration >= 4;
      }
      // Handle short duration as a concept
      else if (query.includes('short')) {
        return (row) => row.Duration <= 2;
      }
    }
    
    // Handle name-based searches
    if (query.includes('name') || query.includes('called')) {
      const nameTerms = query.replace(/name|called|contains|is|with|having/g, '').trim().split(' ').filter(t => t.length > 2);
      
      if (nameTerms.length > 0) {
        return (row) => {
          const nameField = entity === 'clients' ? 'ClientName' :
                           entity === 'tasks' ? 'TaskName' : 'WorkerName';
          
          if (!row[nameField]) return false;
          
          const rowName = row[nameField].toLowerCase();
          return nameTerms.some(term => rowName.includes(term));
        };
      }
    }

    // Default to returning all rows if no pattern matched
    return () => true;
  } catch (error) {
    return () => true;
  }
}
