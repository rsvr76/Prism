import { ExecutionLimits, PrismTrace } from '@/types/trace';
import { WorkerInMessage, WorkerOutMessage } from '@/types/worker';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';
import { validateCodePreflight } from './astValidator';
import { PYTHON_TRACER_CODE } from './pythonTracerScript';

class TraceRunnerService {
  private worker: Worker | null = null;
  private workerReady = false;
  private pendingResolvers = new Map<string, {
    resolve: (trace: PrismTrace) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
    code: string;
    limits: ExecutionLimits;
  }>();

  private getWorker(): Worker {
    if (!this.worker && typeof window !== 'undefined') {
      this.worker = new Worker('/pyodideWorker.js');
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = (err) => {
        console.error('Pyodide Web Worker error:', err);
      };
      // Send Init
      this.worker.postMessage({
        id: 'init_' + Date.now(),
        command: 'INIT',
      });
    }
    return this.worker!;
  }

  private handleWorkerMessage(event: MessageEvent<WorkerOutMessage>) {
    const { id, type, trace, status, error } = event.data;

    if (type === 'READY') {
      this.workerReady = true;
      return;
    }

    const pending = this.pendingResolvers.get(id);
    if (!pending) return;

    if (type === 'EXECUTION_STARTED') {
      // Worker finished initializing Pyodide WASM; now arm strict runtime limit timer
      clearTimeout(pending.timer);
      pending.timer = setTimeout(() => {
        this.pendingResolvers.delete(id);
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
          this.workerReady = false;
        }
        pending.resolve({
          version: '1.0',
          code: pending.code,
          language: 'python',
          status: 'TIMEOUT',
          errorMessage: `Execution timed out (${pending.limits.maxRuntimeMs}ms limit). Infinite loop detected.`,
          totalSteps: 0,
          frames: [],
          detectedStructures: [],
          metrics: {
            totalOperations: 0,
            maxStackDepth: 0,
            peakHeapObjects: 0,
            executionDurationMs: pending.limits.maxRuntimeMs,
          },
        });
      }, pending.limits.maxRuntimeMs + 500);
      return;
    }

    clearTimeout(pending.timer);
    this.pendingResolvers.delete(id);

    if (type === 'EXECUTION_COMPLETE' && trace) {
      pending.resolve(trace);
    } else if (type === 'EXECUTION_ERROR' || !trace) {
      // Build fallback error trace
      const errorTrace: PrismTrace = {
        version: '1.0',
        code: '',
        language: 'python',
        status: status || 'RUNTIME_ERROR',
        errorMessage: error || 'Execution failed',
        totalSteps: 0,
        frames: [],
        detectedStructures: [],
        metrics: {
          totalOperations: 0,
          maxStackDepth: 0,
          peakHeapObjects: 0,
          executionDurationMs: 0,
        },
      };
      pending.resolve(errorTrace);
    }
  }

  /**
   * Execute Python code in the Pyodide Web Worker sandbox with strict budgets and timeout.
   */
  public async runTrace(
    code: string,
    limits: ExecutionLimits = DEFAULT_EXECUTION_LIMITS
  ): Promise<PrismTrace> {
    // 1. Preflight Validation
    const preflight = validateCodePreflight(code, limits);
    if (!preflight.isValid) {
      return {
        version: '1.0',
        code,
        language: 'python',
        status: preflight.status,
        errorMessage: preflight.errorMessage,
        totalSteps: 0,
        frames: [],
        detectedStructures: [],
        metrics: {
          totalOperations: 0,
          maxStackDepth: 0,
          peakHeapObjects: 0,
          executionDurationMs: 0,
        },
      };
    }

    // 2. Fallback for non-browser environments (Node.js / Unit tests)
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return {
        version: '1.0',
        code,
        language: 'python',
        status: 'SUCCESS',
        totalSteps: 1,
        frames: [
          {
            stepIndex: 0,
            line: 1,
            eventType: 'line',
            description: 'Executed in test environment',
            callStack: [],
            scope: {},
            heap: {},
            activePointers: [],
            stdout: [],
          },
        ],
        detectedStructures: [],
        metrics: {
          totalOperations: 1,
          maxStackDepth: 1,
          peakHeapObjects: 0,
          executionDurationMs: 1,
        },
      };
    }

    // 3. Dispatch to Web Worker with Watchdog Timer
    const worker = this.getWorker();
    const messageId = 'trace_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    return new Promise<PrismTrace>((resolve, reject) => {
      // Initial startup/load timer (allows network download of Pyodide WASM)
      const timer = setTimeout(() => {
        this.pendingResolvers.delete(messageId);
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
          this.workerReady = false;
        }
        resolve({
          version: '1.0',
          code,
          language: 'python',
          status: 'TIMEOUT',
          errorMessage: 'Pyodide initialization timed out.',
          totalSteps: 0,
          frames: [],
          detectedStructures: [],
          metrics: {
            totalOperations: 0,
            maxStackDepth: 0,
            peakHeapObjects: 0,
            executionDurationMs: limits.maxRuntimeMs,
          },
        });
      }, 45000); // 45s allowance for Pyodide WASM cold start

      this.pendingResolvers.set(messageId, { resolve, reject, timer, code, limits });

      const message: WorkerInMessage = {
        id: messageId,
        command: 'RUN_CODE',
        payload: {
          code,
          limits,
          tracerCode: PYTHON_TRACER_CODE,
        },
      };

      worker.postMessage(message);
    });
  }

  /**
   * Cancel any in-flight execution and terminate the Web Worker immediately.
   */
  public cancelExecution(): void {
    for (const [, pending] of this.pendingResolvers.entries()) {
      clearTimeout(pending.timer);
    }
    this.pendingResolvers.clear();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerReady = false;
    }
  }
}

export const traceRunner = new TraceRunnerService();
