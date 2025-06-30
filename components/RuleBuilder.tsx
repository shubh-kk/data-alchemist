'use client';
import { useState, useEffect } from "react";
import { BusinessRules, createEmptyRules } from "../lib/ruleTypes";
import { ParsedSheet } from "./FileUploader";
import { validateRules, ValidationResult } from "../lib/ruleValidators";
import { CoRunBuilder } from "./CoRunBuilder";
import { PhaseRestrictionBuilder } from "./PhaseRestrictionBuilder";
import { LoadLimitBuilder } from "./LoadLimitBuilder";
import { PriorityWeightsBuilder } from "./PriorityWeightsBuilder";
import { JsonPreview } from "./JsonPreview";

interface RuleBuilderProps {
  clients: ParsedSheet;
  tasks: ParsedSheet;
  workers: ParsedSheet;
}

export function RuleBuilder({ clients, tasks, workers }: RuleBuilderProps) {
  const [rules, setRules] = useState<BusinessRules>(createEmptyRules());
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });

  useEffect(() => {
    const result = validateRules(rules, clients, tasks, workers);
    setValidation(result);
  }, [rules, clients, tasks, workers]);
  const handleDownloadRules = () => {
    const jsonString = JSON.stringify(rules, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rules.json';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border p-5">
            <CoRunBuilder
              groups={rules.coRunGroups}
              tasks={tasks}
              onUpdate={coRunGroups => setRules({ ...rules, coRunGroups })}
            />
          </div>
          
          <div className="bg-white shadow-sm rounded-lg border p-5">
            <PhaseRestrictionBuilder
              restrictions={rules.phaseRestrictions}
              tasks={tasks}
              onUpdate={phaseRestrictions => setRules({ ...rules, phaseRestrictions })}
            />
          </div>
          
          <div className="bg-white shadow-sm rounded-lg border p-5">
            <LoadLimitBuilder
              loadLimits={rules.loadLimits}
              workers={workers}
              onUpdate={loadLimits => setRules({ ...rules, loadLimits })}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow-sm rounded-lg border p-5 mb-6">
            <h3 className="text-lg font-semibold mb-3">Preview</h3>
            <JsonPreview rules={rules} />
          </div>
          
          <div className="bg-white shadow-sm rounded-lg border p-5">
            <PriorityWeightsBuilder
              weights={rules.priorityWeights}
              clients={clients}
              tasks={tasks}
              onUpdate={priorityWeights => setRules({ ...rules, priorityWeights })}
            />
          </div>
        </div>
      </div>
      
      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h4 className="font-medium mb-2">Validation Errors</h4>
          <ul className="list-disc pl-5 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-center">
        <button
          onClick={handleDownloadRules}
          disabled={validation.errors.length > 0}
          className={`px-6 py-2 rounded-md flex items-center gap-2 cursor-pointer ${
            validation.errors.length > 0
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download rules.json
        </button>
      </div>
    </div>
  );
}
