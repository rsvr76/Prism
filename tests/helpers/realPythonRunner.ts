/**
 * Real Python Execution Test Helper
 * Executes Python programs using the system Python interpreter and the actual PYTHON_TRACER_CODE script.
 * Returns the ground-truth PrismTrace.
 */

import { execSync } from "child_process";
import { PYTHON_TRACER_CODE } from "@/lib/execution/pythonTracerScript";
import { PrismTrace } from "@/types/trace";

export function runRealPythonTrace(pythonCode: string): PrismTrace {
  const runnerScript = `
${PYTHON_TRACER_CODE}

code_input = """${pythonCode.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"""
result_json = __run_prism_trace__(code_input)
print("__PRISM_REAL_RESULT__")
print(result_json)
`;

  try {
    const output = execSync("python -", {
      input: runnerScript,
      encoding: "utf-8",
      timeout: 5000,
    });

    const marker = "__PRISM_REAL_RESULT__";
    const idx = output.indexOf(marker);
    if (idx === -1) {
      throw new Error(`Python execution did not return marker: ${output}`);
    }

    const jsonStr = output.substring(idx + marker.length).trim();
    const parsed = JSON.parse(jsonStr);

    return {
      version: "1.0",
      code: pythonCode,
      language: "python",
      status: parsed.status,
      errorMessage: parsed.errorMessage,
      totalSteps: parsed.frames.length,
      frames: parsed.frames,
      detectedStructures: [],
      metrics: parsed.metrics,
    };
  } catch (err: any) {
    throw new Error(`Real Python Execution failed: ${err?.message || err}`);
  }
}
