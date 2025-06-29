'use client';

import { generateContent } from "./gemini";

/**
 * Creates a JavaScript filter function from a natural language query
 * 
 * @param nlQuery The natural language query (e.g. "priority >= 3")
 * @param entity The entity type being filtered ('clients', 'tasks', 'workers')
 * @returns A function that can be used to filter data rows
 */
export async function createFilterFromNL(
  nlQuery: string, 
  entity: 'clients' | 'tasks' | 'workers'
): Promise<(row: any) => boolean> {
  try {
    // Quick path for common simple queries to avoid API call
    if (nlQuery.toLowerCase().includes('priority') && nlQuery.includes('>=')) {
      const match = nlQuery.match(/priority\s*>=\s*(\d+)/i);
      if (match && match[1]) {
        const priorityValue = parseInt(match[1]);
        return (row) => row.PriorityLevel >= priorityValue;
      }
    }
    
    // Proceed with API call for more complex queries
    const prompt = `
    Create a JavaScript filter function (as a string that can be passed to 'new Function()') 
    that filters ${entity} based on this criteria: "${nlQuery}".
    
    The filter should take a single parameter "row" representing a single data row.
    
    For example:
    Query: "priority >= 3"
    Response: "return row.PriorityLevel >= 3"
    
    Query: "tasks with high duration"
    Response: "return row.Duration >= 4"
    
    Only return the raw JavaScript code, with no explanation, comments, or other text.
    `;
    
    // Call the Gemini API
    const response = await generateContent({ 
      contents: [prompt]
    } as any);
    
    const filterCode = response.text.trim();
    
    // Safety validation - ensure we don't execute harmful code
    // Check for typical allowed terms
    if (!filterCode.match(/^(return|if|switch|for|while|\(|\)|row|\.|>=|<=|>|<|===|==|!=|!==|\+|-|\*|\/|\?|\:|\|\||&&|true|false|null|undefined|typeof|\[|\]|\"|\')/) ||
        filterCode.includes('fetch') || filterCode.includes('eval') || filterCode.includes('window') || 
        filterCode.includes('document') || filterCode.includes('localStorage')) {
      throw new Error('Potentially unsafe filter code generated');
    }
    
    // Create a function from the code
    try {
      // Make sure we have a proper "return" statement
      let finalCode = filterCode;
      if (!filterCode.trim().startsWith('return')) {
        finalCode = `return ${filterCode.trim()}`;
      }
      
      // Explicitly define the function return type
      const filterFn = new Function('row', finalCode) as (row: any) => boolean;
      
      // Validate the function with a test object to ensure it doesn't throw
      try {
        const testRow = { 
          PriorityLevel: 3, 
          Duration: 2,
          ClientName: 'Test',
          WorkerName: 'Test',
          TaskName: 'Test'
        };
        const result = filterFn(testRow);
      } catch (testError) {
        console.error('Filter function threw on test data:', testError);
        // The filter doesn't work properly, return a function that passes all rows
        return () => true;
      }
      
      return filterFn;
    } catch (e) {
      console.error('Failed to create filter function:', e);
      // Return a function that passes all rows
      return () => true;
    }
  } catch (error) {
    console.error('Error creating filter:', error);
    // Return a function that passes all rows in case of error
    return () => true;
  }
}
