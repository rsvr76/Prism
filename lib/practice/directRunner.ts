/**
 * Prism Phase 8C: Direct Runner Wrapper
 *
 * Provides a simple async interface for challenge code to run through
 * the EXISTING Prism execution pipeline (Pyodide Web Worker + sys.settrace).
 *
 * IMPORTANT: This does NOT create a second execution engine.
 * It wraps the existing traceRunner service that the Workbench already uses.
 */

import { PrismTrace } from "@/types/trace";
import { traceRunner } from "@/lib/execution/traceRunner";
import { DEFAULT_EXECUTION_LIMITS } from "@/lib/config/executionLimits";

export interface DirectRunResult {
  trace: PrismTrace | null;
  status: string;
  error?: string;
}

/**
 * Run Python code through the existing Prism execution pipeline.
 * Returns the PrismTrace and status for downstream evaluation.
 *
 * Uses the same Web Worker, AST validation, sandbox limits, and
 * sys.settrace mechanism as the Workbench.
 */
export async function runCodeDirect(code: string): Promise<DirectRunResult> {
  try {
    const trace = await traceRunner.runTrace(code, DEFAULT_EXECUTION_LIMITS);
    return {
      trace,
      status: trace.status,
      error: trace.errorMessage || undefined,
    };
  } catch (err: any) {
    return {
      trace: null,
      status: "RUNTIME_ERROR",
      error: err?.message || "Execution failed",
    };
  }
}
