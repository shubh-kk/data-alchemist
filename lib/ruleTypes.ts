/**
 * Type definitions for business rules
 */

export interface CoRunGroup {
  groupName: string;
  taskIds: string[];
}

export interface PhaseRestriction {
  taskId: string;
  allowedPhases: number[];
}

export interface LoadLimit {
  workerId: string;
  maxLoadPerPhase: number;
}

export interface PriorityWeights {
  clients: Record<string, number>;
  tasks: Record<string, number>;
}

export interface BusinessRules {
  coRunGroups: CoRunGroup[];
  phaseRestrictions: PhaseRestriction[];
  loadLimits: LoadLimit[];
  priorityWeights: PriorityWeights;
}

export const createEmptyRules = (): BusinessRules => ({
  coRunGroups: [],
  phaseRestrictions: [],
  loadLimits: [],
  priorityWeights: {
    clients: {},
    tasks: {}
  }
});
