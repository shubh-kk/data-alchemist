import { BusinessRules, CoRunGroup, LoadLimit, PhaseRestriction } from './ruleTypes';
import { ParsedSheet } from '../components/FileUploader';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that all task IDs in a co-run group exist in the tasks data
 */
export const validateCoRunGroup = (group: CoRunGroup, tasks: ParsedSheet): ValidationResult => {
  const errors: string[] = [];
  
  if (!group.groupName || group.groupName.trim() === '') {
    errors.push('Group name cannot be empty');
  }
  
  if (group.taskIds.length === 0) {
    errors.push('Group must contain at least one task');
  }
  
  // Check if all task IDs exist in the tasks data
  const taskIds = new Set(tasks.map(task => task.TaskID));
  const missingTaskIds = group.taskIds.filter(id => !taskIds.has(id));
  
  if (missingTaskIds.length > 0) {
    errors.push(`Task IDs not found: ${missingTaskIds.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates that the task ID in a phase restriction exists in the tasks data
 */
export const validatePhaseRestriction = (restriction: PhaseRestriction, tasks: ParsedSheet): ValidationResult => {
  const errors: string[] = [];
  
  if (!restriction.taskId || restriction.taskId.trim() === '') {
    errors.push('Task ID cannot be empty');
  } else {
    // Check if the task ID exists in the tasks data
    const taskIds = new Set(tasks.map(task => task.TaskID));
    if (!taskIds.has(restriction.taskId)) {
      errors.push(`Task ID "${restriction.taskId}" not found`);
    }
  }
  
  if (restriction.allowedPhases.length === 0) {
    errors.push('At least one phase must be allowed');
  }
  
  // Check that all phases are positive integers
  const invalidPhases = restriction.allowedPhases.filter(phase => !Number.isInteger(phase) || phase <= 0);
  if (invalidPhases.length > 0) {
    errors.push(`Phases must be positive integers: ${invalidPhases.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates that the worker ID in a load limit exists in the workers data
 */
export const validateLoadLimit = (limit: LoadLimit, workers: ParsedSheet): ValidationResult => {
  const errors: string[] = [];
  
  if (!limit.workerId || limit.workerId.trim() === '') {
    errors.push('Worker ID cannot be empty');
  } else {
    // Check if the worker ID exists in the workers data
    const workerIds = new Set(workers.map(worker => worker.WorkerID));
    if (!workerIds.has(limit.workerId)) {
      errors.push(`Worker ID "${limit.workerId}" not found`);
    }
  }
  
  if (limit.maxLoadPerPhase <= 0) {
    errors.push('Maximum load per phase must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates an entire set of business rules
 */
export const validateRules = (
  rules: BusinessRules,
  clients: ParsedSheet,
  tasks: ParsedSheet,
  workers: ParsedSheet
): ValidationResult => {
  const errors: string[] = [];
  
  // Validate co-run groups
  for (const group of rules.coRunGroups) {
    const result = validateCoRunGroup(group, tasks);
    if (!result.isValid) {
      errors.push(`Co-run group "${group.groupName}": ${result.errors.join(', ')}`);
    }
  }
  
  // Validate phase restrictions
  for (const restriction of rules.phaseRestrictions) {
    const result = validatePhaseRestriction(restriction, tasks);
    if (!result.isValid) {
      errors.push(`Phase restriction for task "${restriction.taskId}": ${result.errors.join(', ')}`);
    }
  }
  
  // Validate load limits
  for (const limit of rules.loadLimits) {
    const result = validateLoadLimit(limit, workers);
    if (!result.isValid) {
      errors.push(`Load limit for worker "${limit.workerId}": ${result.errors.join(', ')}`);
    }
  }
  
  // Check for duplicate entries
  const groupNames = new Set<string>();
  for (const group of rules.coRunGroups) {
    if (groupNames.has(group.groupName)) {
      errors.push(`Duplicate co-run group name: "${group.groupName}"`);
    }
    groupNames.add(group.groupName);
  }
  
  const taskPhaseRestrictions = new Set<string>();
  for (const restriction of rules.phaseRestrictions) {
    if (taskPhaseRestrictions.has(restriction.taskId)) {
      errors.push(`Duplicate phase restriction for task: "${restriction.taskId}"`);
    }
    taskPhaseRestrictions.add(restriction.taskId);
  }
  
  const workerLoadLimits = new Set<string>();
  for (const limit of rules.loadLimits) {
    if (workerLoadLimits.has(limit.workerId)) {
      errors.push(`Duplicate load limit for worker: "${limit.workerId}"`);
    }
    workerLoadLimits.add(limit.workerId);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
