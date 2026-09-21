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
  // Shared persistent Web Worker for both pure execution and trace visualization
  private worker: Worker | null = null;
  private workerReady = false;
  private pendingResolvers = new Map<string, PendingJob>();

  /**
   * Pre-warm / initialize the Pyodide Web Worker in the background.
   * Safe to call on page mount so Pyodide is fully ready before the user clicks Execute.
   */
  public init(): void {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      this.getWorker();
    }
  }

  public prewarm(): void {
    this.init();
  }

  private getWorker(): Worker {
    if (!this.worker && typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      this.worker = new Worker('/pyodideWorker.js');
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = (err) => {
        console.error('Pyodide Worker error:', err);
      };
      this.worker.postMessage({
        id: 'init_' + Date.now(),
        command: 'INIT',
      });
    }
    return this.worker!;
  }

  private handleWorkerMessage(event: MessageEvent<WorkerOutMessage>) {
    const { id, type, trace, status, error, stdout, durationMs } = event.data;

    if (type === 'READY') {
      this.workerReady = true;
      return;
    }

    const pending = this.pendingResolvers.get(id);
    if (!pending) return;

    if (type === 'EXECUTION_STARTED') {
      clearTimeout(pending.timer);
      pending.timer = setTimeout(() => {
        this.pendingResolvers.delete(id);
        this.terminateAndRestartWorker();
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
    this.pendingResolvers.delete(id);

    if (type === 'EXECUTION_COMPLETE') {
      if (trace) {
        pending.resolve(trace);
      } else {
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
              stdout: stdout || [],
            },
          ],
          detectedStructures: [],
          metrics: {
            totalOperations: 1,
            maxStackDepth: 1,
            peakHeapObjects: 0,
            executionDurationMs: durationMs || 1,
          },
        };
        pending.resolve(pureTrace);
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

  private terminateAndRestartWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerReady = false;
    }
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      this.init();
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
    const worker = this.getWorker();
    const messageId = 'exec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    return new Promise<PrismTrace>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingResolvers.delete(messageId);
        this.terminateAndRestartWorker();
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
      }, 75000); // 75s allowance for initial Pyodide WASM cold start

      this.pendingResolvers.set(messageId, { resolve, reject, timer, code, limits });

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
    const worker = this.getWorker();
    const messageId = 'trace_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    return new Promise<PrismTrace>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingResolvers.delete(messageId);
        this.terminateAndRestartWorker();
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
   * Cancel all executions. If the worker is idle, keeps it warm and alive.
   * Only terminates and restarts if there was an active in-flight job that might be looping.
   */
  public cancelExecution(): void {
    if (this.pendingResolvers.size === 0) {
      // Worker is idle and healthy. Preserve it for instant execution!
      return;
    }

    for (const [, pending] of this.pendingResolvers.entries()) {
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
    this.pendingResolvers.clear();
    this.terminateAndRestartWorker();
  }

  public cancelTrace(): void {
    let hadInFlightTrace = false;
    for (const [id, pending] of this.pendingResolvers.entries()) {
      if (id.startsWith('trace_')) {
        hadInFlightTrace = true;
        clearTimeout(pending.timer);
        this.pendingResolvers.delete(id);
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
    }

    if (hadInFlightTrace) {
      this.terminateAndRestartWorker();
    }
  }

  public cancelPureExecution(): void {
    let hadInFlightPure = false;
    for (const [id, pending] of this.pendingResolvers.entries()) {
      if (id.startsWith('exec_')) {
        hadInFlightPure = true;
        clearTimeout(pending.timer);
        this.pendingResolvers.delete(id);
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
    }

    if (hadInFlightPure) {
      this.terminateAndRestartWorker();
    }
  }

  public isWorkerReady(): boolean {
    return this.workerReady;
  }
}

export const traceRunner = new TraceRunnerService();

