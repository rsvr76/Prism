import { ExecutionLimits, ExecutionStatus } from '@/types/trace';

export interface PreflightResult {
  isValid: boolean;
  status: ExecutionStatus;
  errorMessage?: string;
}

const DISALLOWED_MODULES = [
  'os',
  'subprocess',
  'socket',
  'sys',
  'shutil',
  'ctypes',
  'pathlib',
  'urllib',
  'requests',
  'http',
  'threading',
  'multiprocessing',
];

/**
 * Preflight AST & Safety Validator
 * Fast initial checks before sending code to the Pyodide Web Worker.
 */
export function validateCodePreflight(code: string, limits: ExecutionLimits): PreflightResult {
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      status: 'UNSUPPORTED',
      errorMessage: 'Code is empty. Please enter Python code to execute.',
    };
  }

  const lines = code.split('\n');
  if (lines.length > limits.maxSourceLines) {
    return {
      isValid: false,
      status: 'TRACE_LIMIT',
      errorMessage: `Source code exceeds maximum line limit (${lines.length} / ${limits.maxSourceLines} lines).`,
    };
  }

  // Check for disallowed system modules
  for (const mod of DISALLOWED_MODULES) {
    const importRegex = new RegExp(`\\b(import\\s+${mod}\\b|from\\s+${mod}\\s+import)`, 'i');
    if (importRegex.test(code)) {
      return {
        isValid: false,
        status: 'UNSUPPORTED',
        errorMessage: `Module '${mod}' is disallowed in the Prism sandbox. Prism provides a pure algorithmic learning environment.`,
      };
    }
  }

  return {
    isValid: true,
    status: 'SUCCESS',
  };
}
