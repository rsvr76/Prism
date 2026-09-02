// Pyodide Web Worker for Prism Python Execution Sandbox
importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.js');

let pyodideReadyPromise = null;

async function initPyodideWorker() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      self.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/'
      });
      return self.pyodide;
    })();
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const { id, command, payload } = event.data;

  if (command === 'PING') {
    self.postMessage({ id, type: 'PONG' });
    return;
  }

  if (command === 'INIT') {
    try {
      await initPyodideWorker();
      self.postMessage({ id, type: 'READY' });
    } catch (err) {
      self.postMessage({ id, type: 'EXECUTION_ERROR', error: err.message });
    }
    return;
  }

  if (command === 'RUN_CODE') {
    const startTime = performance.now();
    try {
      const pyodide = await initPyodideWorker();
      self.postMessage({ id, type: 'EXECUTION_STARTED' });

      const { code, limits, tracerCode } = payload;
      
      // Inject tracer parameters into pyodide global namespace
      pyodide.globals.set('__USER_CODE__', code);
      pyodide.globals.set('__MAX_FRAMES__', limits.maxTraceFrames);
      pyodide.globals.set('__MAX_OPS__', limits.maxOperations);
      pyodide.globals.set('__MAX_STACK__', limits.maxCallStackDepth);
      pyodide.globals.set('__MAX_STDOUT__', limits.maxStdoutLines);

      const runnerCode = tracerCode + `
__PRISM_RESULT_JSON__ = __run_prism_trace__(
    __USER_CODE__,
    max_frames=__MAX_FRAMES__,
    max_ops=__MAX_OPS__,
    max_stack_depth=__MAX_STACK__,
    max_stdout_lines=__MAX_STDOUT__
)
`;
      await pyodide.runPythonAsync(runnerCode);
      const resultJsonStr = pyodide.globals.get('__PRISM_RESULT_JSON__');
      const parsed = JSON.parse(resultJsonStr);
      const duration = performance.now() - startTime;

      parsed.metrics.executionDurationMs = Math.round(duration);
      parsed.code = code;
      parsed.language = 'python';
      parsed.version = '1.0';
      parsed.totalSteps = parsed.frames ? parsed.frames.length : 0;
      parsed.detectedStructures = [];

      self.postMessage({
        id,
        type: 'EXECUTION_COMPLETE',
        status: parsed.status,
        trace: parsed,
        error: parsed.errorMessage
      });
    } catch (err) {
      self.postMessage({
        id,
        type: 'EXECUTION_ERROR',
        status: 'RUNTIME_ERROR',
        error: err.message
      });
    }
  }
};
