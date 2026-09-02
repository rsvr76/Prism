import { ExecutionLimits } from '@/types/trace';

/**
 * Default Execution Limits & Safety Budgets
 * All execution limits are centralized here in one place.
 */
export const DEFAULT_EXECUTION_LIMITS: ExecutionLimits = {
  maxSourceLines: 300,
  maxTraceFrames: 1000,
  maxOperations: 5000,
  maxRuntimeMs: 3000,
  maxCallStackDepth: 50,
  maxStdoutLines: 100,
} as const;
