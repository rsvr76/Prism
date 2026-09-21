// Pyodide Web Worker for Prism Python Execution Sandbox

// Prioritize local Pyodide assets for sub-millisecond offline loading, fallback to CDN if unavailable
let isLocal = false;
try {
  importScripts('/pyodide/pyodide.js');
  if (typeof loadPyodide === 'function') {
    isLocal = true;
  }
} catch (e) {
  // Local pyodide assets not found, will load from CDN
}

if (!isLocal) {
  try {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.js');
  } catch (err) {
    console.error('Failed to load Pyodide from CDN:', err);
  }
}

let pyodideReadyPromise = null;
let tracerLoaded = false;

async function initPyodideWorker() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      const indexURL = isLocal ? '/pyodide/' : 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/';
      self.pyodide = await loadPyodide({
        indexURL
      });

      // Pre-compile the lightweight runner function for pure Python execution
      await self.pyodide.runPythonAsync(`
import sys
import io
import json

def __prism_pure_exec__(user_code):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    orig_stdout = sys.stdout
    orig_stderr = sys.stderr
    exec_status = "SUCCESS"
    exec_error = None
    try:
        sys.stdout = stdout_buf
        sys.stderr = stderr_buf
        exec_ns = {}
        exec(user_code, exec_ns)
    except Exception as e:
        exec_status = "RUNTIME_ERROR"
        exec_error = f"{type(e).__name__}: {str(e)}"
    finally:
        sys.stdout = orig_stdout
        sys.stderr = orig_stderr

    raw_stdout = stdout_buf.getvalue()
    raw_stderr = stderr_buf.getvalue()
    comb = raw_stdout + (("\\n" + raw_stderr) if raw_stderr and raw_stdout else raw_stderr)
    lines = comb.split('\\n')
    if len(lines) > 1 and lines[-1] == '':
        lines.pop()

    return json.dumps({
        "status": exec_status,
        "stdout": lines,
        "error": exec_error
    })
`);

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

  if (command === 'EXECUTE_CODE') {
    const startTime = performance.now();
    try {
      const pyodide = await initPyodideWorker();
      self.postMessage({ id, type: 'EXECUTION_STARTED' });

      const { code } = payload;
      pyodide.globals.set('__USER_EXEC_CODE__', code);

      const resJson = await pyodide.runPythonAsync('__prism_pure_exec__(__USER_EXEC_CODE__)');
      const res = JSON.parse(resJson);
      const durationMs = Math.round(performance.now() - startTime);

      self.postMessage({
        id,
        type: 'EXECUTION_COMPLETE',
        status: res.status,
        stdout: res.stdout,
        durationMs,
        error: res.error || undefined,
      });
    } catch (err) {
      self.postMessage({
        id,
        type: 'EXECUTION_ERROR',
        status: 'RUNTIME_ERROR',
        error: err.message,
      });
    }
    return;
  }

  if (command === 'RUN_CODE') {
    const startTime = performance.now();
    try {
      const pyodide = await initPyodideWorker();
      self.postMessage({ id, type: 'EXECUTION_STARTED' });

      const { code, limits, tracerCode } = payload;

      // Load tracer definitions into Python once
      if (!tracerLoaded && tracerCode) {
        await pyodide.runPythonAsync(tracerCode);
        tracerLoaded = true;
      }
      
      // Inject tracer parameters into pyodide global namespace
      pyodide.globals.set('__USER_CODE__', code);
      pyodide.globals.set('__MAX_FRAMES__', limits.maxTraceFrames);
      pyodide.globals.set('__MAX_OPS__', limits.maxOperations);
      pyodide.globals.set('__MAX_STACK__', limits.maxCallStackDepth);
      pyodide.globals.set('__MAX_STDOUT__', limits.maxStdoutLines);

      const runnerCode = `
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
