import { ExecutionLimits, PrismTrace } from '@/types/trace';
import { WorkerInMessage, WorkerOutMessage } from '@/types/worker';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';
import { validateCodePreflight } from './astValidator';
import { PYTHON_TRACER_CODE } from './pythonTracerScript';

interface PendingJob {
  resolve: (trace: PrismTrace) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
  code: string;
  limits: ExecutionLimits;
}

class TraceRunnerService {
  // Dedicated Web Worker for full sys.settrace AST visualization
  private traceWorker: Worker | null = null;
  private traceWorkerReady = false;
  private pendingTraceResolvers = new Map<string, PendingJob>();

  // Dedicated Web Worker for lightweight pure Python execution (stdout/stderr)
  private pureWorker: Worker | null = null;
  private pureWorkerReady = false;
  private pendingPureResolvers = new Map<string, PendingJob>();

  private getTraceWorker(): Worker {
    if (!this.traceWorker && typeof window !== 'undefined') {
      this.traceWorker = new Worker('/pyodideWorker.js');
      this.traceWorker.onmessage = this.handleTraceWorkerMessage.bind(this);
      this.traceWorker.onerror = (err) => {
        console.error('Pyodide Trace Worker error:', err);
      };
      this.traceWorker.postMessage({
        id: 'init_trace_' + Date.now(),
        command: 'INIT',
      });
    }
    return this.traceWorker!;
  }

  private getPureWorker(): Worker {
    if (!this.pureWorker && typeof window !== 'undefined') {
      this.pureWorker = new Worker('/pyodideWorker.js');
      this.pureWorker.onmessage = this.handlePureWorkerMessage.bind(this);
      this.pureWorker.onerror = (err) => {
        console.error('Pyodide Pure Worker error:', err);
      };
      this.pureWorker.postMessage({
        id: 'init_pure_' + Date.now(),
        command: 'INIT',
      });
    }
    return this.pureWorker!;
  }

  private handleTraceWorkerMessage(event: MessageEvent<WorkerOutMessage>) {
    const { id, type, trace, status, error } = event.data;

    if (type === 'READY') {
      this.traceWorkerReady = true;
      return;
    }

    const pending = this.pendingTraceResolvers.get(id);
    if (!pending) return;

    if (type === 'EXECUTION_STARTED') {
      clearTimeout(pending.timer);
      pending.timer = setTimeout(() => {
        this.pendingTraceResolvers.delete(id);
        if (this.traceWorker) {
          this.traceWorker.terminate();
          this.traceWorker = null;
          this.traceWorkerReady = false;
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
      }, Math.max(pending.limits.maxRuntimeMs * 3, 10000));
      return;
    }

    clearTimeout(pending.timer);
    this.pendingTraceResolvers.delete(id);

    if (type === 'EXECUTION_COMPLETE') {
      if (trace) {
        pending.resolve(trace);
      } else {
        pending.resolve({
          version: '1.0',
          code: pending.code,
          language: 'python',
          status: status || 'SUCCESS',
          errorMessage: error || undefined,
          totalSteps: 0,
          frames: [],
          detectedStructures: [],
          metrics: {
            totalOperations: 0,
            maxStackDepth: 0,
            peakHeapObjects: 0,
            executionDurationMs: 0,
          },
        });
      }
    } else if (type === 'EXECUTION_ERROR') {
      pending.resolve({
        version: '1.0',
        code: pending.code,
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
      });
    }
  }

  private handlePureWorkerMessage(event: MessageEvent<WorkerOutMessage>) {
    const { id, type, status, error } = event.data;

    if (type === 'READY') {
      this.pureWorkerReady = true;
      return;
    }

    const pending = this.pendingPureResolvers.get(id);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pendingPureResolvers.delete(id);

    if (type === 'EXECUTION_COMPLETE') {
      const pureTrace: PrismTrace = {
        version: '1.0',
        code: pending.code,
        language: 'python',
        status: status || 'SUCCESS',
        errorMessage: error || undefined,
        totalSteps: 1,
        frames: [
          {
            stepIndex: 0,
            line: 1,
            eventType: 'line',
            description: 'Execution output',
            callStack: [],
            scope: {},
            heap: {},
            activePointers: [],
            stdout: event.data.stdout || [],
          },
        ],
        detectedStructures: [],
        metrics: {
          totalOperations: 1,
          maxStackDepth: 1,
          peakHeapObjects: 0,
          executionDurationMs: event.data.durationMs || 1,
        },
      };
      pending.resolve(pureTrace);
    } else if (type === 'EXECUTION_ERROR') {
      pending.resolve({
        version: '1.0',
        code: pending.code,
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
      });
    }
  }

  /**
   * Run pure Python code without sys.settrace tracing overhead.
   * Finishes in a few milliseconds and captures stdout/stderr output.
   */
  public async runPureExecution(
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
            stdout: ['Execution complete (test environment)'],
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
    const worker = this.getPureWorker();
    const messageId = 'exec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    return new Promise<PrismTrace>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingPureResolvers.delete(messageId);
        if (this.pureWorker) {
          this.pureWorker.terminate();
          this.pureWorker = null;
          this.pureWorkerReady = false;
        }
        resolve({
          version: '1.0',
          code,
          language: 'python',
          status: 'TIMEOUT',
          errorMessage: 'Pyodide execution timed out.',
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
      }, 75000); // 75s allowance for Pyodide WASM cold start

      this.pendingPureResolvers.set(messageId, { resolve, reject, timer, code, limits });

      const message: WorkerInMessage = {
        id: messageId,
        command: 'EXECUTE_CODE',
        payload: {
          code,
          limits,
        },
      };

      worker.postMessage(message);
    });
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
    const worker = this.getTraceWorker();
    const messageId = 'trace_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    return new Promise<PrismTrace>((resolve, reject) => {
      // Initial startup/load timer (allows network download of Pyodide WASM)
      const timer = setTimeout(() => {
        this.pendingTraceResolvers.delete(messageId);
        if (this.traceWorker) {
          this.traceWorker.terminate();
          this.traceWorker = null;
          this.traceWorkerReady = false;
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
      }, 75000); // 75s allowance for Pyodide WASM cold start

      this.pendingTraceResolvers.set(messageId, { resolve, reject, timer, code, limits });

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

  public cancelTrace(): void {
    for (const [, pending] of this.pendingTraceResolvers.entries()) {
      clearTimeout(pending.timer);
      pending.resolve({
        version: '1.0',
        code: pending.code,
        language: 'python',
        status: 'TIMEOUT',
        errorMessage: 'Visualization trace was cancelled.',
        totalSteps: 0,
        frames: [],
        detectedStructures: [],
        metrics: {
          totalOperations: 0,
          maxStackDepth: 0,
          peakHeapObjects: 0,
          executionDurationMs: 0,
        },
      });
    }
    this.pendingTraceResolvers.clear();

    if (this.traceWorker) {
      this.traceWorker.terminate();
      this.traceWorker = null;
      this.traceWorkerReady = false;
    }
  }

  public cancelPureExecution(): void {
    for (const [, pending] of this.pendingPureResolvers.entries()) {
      clearTimeout(pending.timer);
      pending.resolve({
        version: '1.0',
        code: pending.code,
        language: 'python',
        status: 'TIMEOUT',
        errorMessage: 'Execution was cancelled.',
        totalSteps: 0,
        frames: [],
        detectedStructures: [],
        metrics: {
          totalOperations: 0,
          maxStackDepth: 0,
          peakHeapObjects: 0,
          executionDurationMs: 0,
        },
      });
    }
    this.pendingPureResolvers.clear();

    if (this.pureWorker) {
      this.pureWorker.terminate();
      this.pureWorker = null;
      this.pureWorkerReady = false;
    }
  }

  public cancelExecution(): void {
    this.cancelTrace();
    this.cancelPureExecution();
  }

  public isWorkerReady(): boolean {
    return this.traceWorkerReady || this.pureWorkerReady;
  }
}

export const traceRunner = new TraceRunnerService();
