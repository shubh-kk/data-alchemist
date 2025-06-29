import { ParsedSheet } from "../components/FileUploader";

// Type for validation errors
export interface ValidationError {
  row: number;
  column?: string;
  message: string;
}

// Helper to check if a field exists in an object
const fieldExists = (obj: Record<string, any>, field: string): boolean => {
  return field in obj && obj[field] !== null && obj[field] !== undefined && obj[field] !== "";
};

// Helper to check if a value is a valid number
const isValidNumber = (value: any): boolean => {
  if (value === null || value === undefined || value === "") return false;
  return !isNaN(Number(value));
};

// Helper to check if a value is an integer
const isInteger = (value: any): boolean => {
  if (!isValidNumber(value)) return false;
  const num = Number(value);
  return Number.isInteger(num);
};

// Helper to parse a comma or semicolon separated list
const parseList = (value: string): string[] => {
  if (!value) return [];
  // Handle both comma and semicolon separators
  return value.split(/[,;]/).map(item => item.trim()).filter(Boolean);
};

// 1. Required column check
export const validateRequiredColumns = (sheet: ParsedSheet, entityType: 'clients' | 'tasks' | 'workers'): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const requiredColumns: Record<string, string[]> = {
    clients: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'AttributesJSON'],
    tasks: ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'],
    workers: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel']
  };
  
  if (sheet.length === 0) {
    errors.push({ 
      row: 0, 
      message: `No data found for ${entityType} sheet` 
    });
    return errors;
  }
  
  const firstRow = sheet[0];
  const missingColumns = requiredColumns[entityType].filter(col => !(col in firstRow));
  
  if (missingColumns.length > 0) {
    errors.push({ 
      row: 0, 
      message: `Missing required columns: ${missingColumns.join(', ')}` 
    });
  }
  
  return errors;
};

// 2. Unique ID enforcement
export const validateUniqueIds = (sheet: ParsedSheet, entityType: 'clients' | 'tasks' | 'workers'): ValidationError[] => {
  const errors: ValidationError[] = [];
  const idColumn = {
    clients: 'ClientID',
    tasks: 'TaskID',
    workers: 'WorkerID'
  }[entityType];
  
  const ids = new Set<string>();
  
  sheet.forEach((row, index) => {
    const id = row[idColumn];
    if (id) {
      if (ids.has(id.toString())) {
        errors.push({ 
          row: index + 1, // +1 because of zero-indexing vs display
          column: idColumn,
          message: `Duplicate ${idColumn} found: ${id}` 
        });
      } else {
        ids.add(id.toString());
      }
    }
  });
  
  return errors;
};

// 3. Non-empty mandatory fields
export const validateMandatoryFields = (sheet: ParsedSheet, entityType: 'clients' | 'tasks' | 'workers'): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const mandatoryFields: Record<string, string[]> = {
    clients: ['ClientName'],
    tasks: ['TaskName'],
    workers: ['WorkerName']
  };
  
  sheet.forEach((row, index) => {
    mandatoryFields[entityType].forEach(field => {
      if (!fieldExists(row, field)) {
        errors.push({ 
          row: index + 1,
          column: field,
          message: `${field} cannot be empty` 
        });
      }
    });
  });
  
  return errors;
};

// 4. Numeric range validation
export const validateNumericRanges = (sheet: ParsedSheet, entityType: 'clients' | 'tasks' | 'workers'): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  sheet.forEach((row, index) => {
    // Check PriorityLevel for clients (1-5)
    if (entityType === 'clients' && fieldExists(row, 'PriorityLevel')) {
      const priority = Number(row.PriorityLevel);
      if (isNaN(priority) || priority < 1 || priority > 5 || !isInteger(priority)) {
        errors.push({ 
          row: index + 1,
          column: 'PriorityLevel',
          message: 'PriorityLevel must be an integer between 1 and 5' 
        });
      }
    }
    
    // Check Duration for tasks (≥ 1)
    if (entityType === 'tasks' && fieldExists(row, 'Duration')) {
      const duration = Number(row.Duration);
      if (isNaN(duration) || duration < 1) {
        errors.push({ 
          row: index + 1,
          column: 'Duration',
          message: 'Duration must be a number greater than or equal to 1' 
        });
      }
    }
  });
  
  return errors;
};

// 5. Non-negative integers
export const validateNonNegativeIntegers = (sheet: ParsedSheet, entityType: 'clients' | 'tasks' | 'workers'): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (entityType === 'workers') {
    sheet.forEach((row, index) => {
      // Check AvailableSlots
      if (fieldExists(row, 'AvailableSlots')) {
        const slots = Number(row.AvailableSlots);
        if (isNaN(slots) || slots < 0 || !isInteger(slots)) {
          errors.push({ 
            row: index + 1,
            column: 'AvailableSlots',
            message: 'AvailableSlots must be a non-negative integer' 
          });
        }
      }
      
      // Check MaxLoadPerPhase
      if (fieldExists(row, 'MaxLoadPerPhase')) {
        const load = Number(row.MaxLoadPerPhase);
        if (isNaN(load) || load < 0 || !isInteger(load)) {
          errors.push({ 
            row: index + 1,
            column: 'MaxLoadPerPhase',
            message: 'MaxLoadPerPhase must be a non-negative integer' 
          });
        }
      }
    });
  }
  
  return errors;
};

// 6. JSON syntax check
export const validateJsonSyntax = (sheet: ParsedSheet, entityType: 'clients' | 'tasks' | 'workers'): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (entityType === 'clients') {
    sheet.forEach((row, index) => {
      if (fieldExists(row, 'AttributesJSON')) {
        try {
          JSON.parse(row.AttributesJSON);
        } catch (e) {
          errors.push({ 
            row: index + 1,
            column: 'AttributesJSON',
            message: 'Invalid JSON syntax in AttributesJSON' 
          });
        }
      }
    });
  }
  
  return errors;
};

// 7. Cross-reference integrity
export const validateCrossReferences = (clients: ParsedSheet, tasks: ParsedSheet): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Create a set of all task IDs for quick lookup
  const taskIds = new Set<string>();
  tasks.forEach(task => {
    if (task.TaskID) {
      taskIds.add(task.TaskID.toString());
    }
  });
  
  clients.forEach((client, index) => {
    if (fieldExists(client, 'RequestedTaskIDs')) {
      const requestedTasks = parseList(client.RequestedTaskIDs);
      
      requestedTasks.forEach(taskId => {
        if (!taskIds.has(taskId)) {
          errors.push({ 
            row: index + 1,
            column: 'RequestedTaskIDs',
            message: `TaskID '${taskId}' referenced in RequestedTaskIDs does not exist in tasks sheet` 
          });
        }
      });
    }
  });
  
  return errors;
};

// 8. MaxConcurrent ≥ 1
export const validateMaxConcurrent = (sheet: ParsedSheet, entityType: 'clients' | 'tasks' | 'workers'): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (entityType === 'tasks') {
    sheet.forEach((row, index) => {
      if (fieldExists(row, 'MaxConcurrent')) {
        const maxConcurrent = Number(row.MaxConcurrent);
        if (isNaN(maxConcurrent) || maxConcurrent < 1 || !isInteger(maxConcurrent)) {
          errors.push({ 
            row: index + 1,
            column: 'MaxConcurrent',
            message: 'MaxConcurrent must be an integer greater than or equal to 1' 
          });
        }
      } else {
        errors.push({ 
          row: index + 1,
          column: 'MaxConcurrent',
          message: 'MaxConcurrent is required' 
        });
      }
    });
  }
  
  return errors;
};

// Main validation function that runs all validations
export const validateData = (
  clients: ParsedSheet, 
  tasks: ParsedSheet, 
  workers: ParsedSheet
): Record<'clients' | 'tasks' | 'workers', ValidationError[]> => {
  const validationResults = {
    clients: [
      ...validateRequiredColumns(clients, 'clients'),
      ...validateUniqueIds(clients, 'clients'),
      ...validateMandatoryFields(clients, 'clients'),
      ...validateNumericRanges(clients, 'clients'),
      ...validateJsonSyntax(clients, 'clients'),
    ],
    tasks: [
      ...validateRequiredColumns(tasks, 'tasks'),
      ...validateUniqueIds(tasks, 'tasks'),
      ...validateMandatoryFields(tasks, 'tasks'),
      ...validateNumericRanges(tasks, 'tasks'),
      ...validateMaxConcurrent(tasks, 'tasks'),
    ],
    workers: [
      ...validateRequiredColumns(workers, 'workers'),
      ...validateUniqueIds(workers, 'workers'),
      ...validateMandatoryFields(workers, 'workers'),
      ...validateNonNegativeIntegers(workers, 'workers'),
    ]
  };

  // Add cross-reference validation separately since it involves multiple sheets
  if (clients.length > 0 && tasks.length > 0) {
    validationResults.clients.push(...validateCrossReferences(clients, tasks));
  }
  
  return validationResults;
};
