'use client';
import { BusinessRules } from "../lib/ruleTypes";

interface JsonPreviewProps {
  rules: BusinessRules;
}

export function JsonPreview({ rules }: JsonPreviewProps) {
  const formattedJson = JSON.stringify(rules, null, 2);

  return (
    <div className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto max-h-[500px]">
      <pre className="font-mono text-sm whitespace-pre-wrap">{formattedJson}</pre>
    </div>
  );
}
