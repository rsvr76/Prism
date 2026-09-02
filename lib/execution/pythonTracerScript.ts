/**
 * Embedded Python Tracer Script
 * Executed inside Pyodide via sys.settrace to capture ground-truth execution snapshots.
 */
export const PYTHON_TRACER_CODE = `
import sys
import io
import json
import inspect

class PrismPythonTracer:
    def __init__(self, max_frames=1000, max_ops=5000, max_stack_depth=50, max_stdout_lines=100):
        self.frames = []
        self.max_frames = max_frames
        self.max_ops = max_ops
        self.max_stack_depth = max_stack_depth
        self.max_stdout_lines = max_stdout_lines
        self.step_count = 0
        self.stdout_buffer = io.StringIO()
        self.last_snapshot = None
        self.status = 'SUCCESS'
        self.error_message = None

    def trace_calls(self, frame, event, arg):
        self.step_count += 1
        
        # Check operation count limit
        if self.step_count > self.max_ops:
            self.status = 'TRACE_LIMIT'
            self.error_message = f"Operation limit exceeded ({self.max_ops} operations). Possible infinite loop."
            sys.settrace(None)
            raise RuntimeError(self.error_message)

        # Check frame count limit
        if len(self.frames) >= self.max_frames:
            self.status = 'TRACE_LIMIT'
            self.error_message = f"Trace frame limit reached ({self.max_frames} frames)."
            sys.settrace(None)
            raise RuntimeError(self.error_message)

        # Filter out internal or library frames
        if frame.f_code.co_filename != '<user_code>':
            return self.trace_calls

        if event in ('line', 'call', 'return', 'exception'):
            self.capture_frame(frame, event, arg)

        return self.trace_calls

    def capture_frame(self, frame, event, arg):
        line = frame.f_lineno
        func_name = frame.f_code.co_name
        locals_map = frame.f_locals

        # Build Call Stack
        stack = []
        curr = frame
        depth = 0
        while curr and curr.f_code.co_filename == '<user_code>':
            depth += 1
            stack.append({
                'frameId': f"{curr.f_code.co_name}_{id(curr)}",
                'functionName': curr.f_code.co_name,
                'line': curr.f_lineno,
                'localVariables': {k: self.serialize_val(v) for k, v in curr.f_locals.items() if not k.startswith('__')}
            })
            curr = curr.f_back
        stack.reverse()

        if depth > self.max_stack_depth:
            self.status = 'RECURSION_LIMIT'
            self.error_message = f"Max call stack depth exceeded ({self.max_stack_depth} frames). Infinite recursion detected."
            sys.settrace(None)
            raise RecursionError(self.error_message)

        # Capture Scope & Heap Graph
        scope = {}
        heap = {}
        visited_objects = set()
        for k, v in locals_map.items():
            if k.startswith('__'): continue
            scope[k] = self.serialize_val(v)
            self.extract_heap_objects(v, heap, visited_objects, depth=0)

        # Truncate stdout if needed
        stdout_lines = self.stdout_buffer.getvalue().splitlines()
        if len(stdout_lines) > self.max_stdout_lines:
            stdout_lines = stdout_lines[:self.max_stdout_lines] + ['... [stdout truncated]']

        snapshot = {
            'stepIndex': len(self.frames),
            'line': line,
            'eventType': event,
            'description': f"{event.upper()}: line {line} in {func_name}",
            'callStack': stack,
            'scope': scope,
            'heap': heap,
            'activePointers': [],
            'stdout': stdout_lines,
            'exception': {'type': type(arg).__name__, 'message': str(arg)} if event == 'exception' else None
        }

        # Deduplication: avoid recording consecutive identical frames
        if not self.is_duplicate(snapshot):
            self.frames.append(snapshot)
            self.last_snapshot = snapshot

    def serialize_val(self, val):
        if val is None: return None
        if isinstance(val, (int, float, str, bool)): return val
        if isinstance(val, (list, tuple)): return [self.serialize_val(x) for x in val[:50]]
        if isinstance(val, dict): return {str(k): self.serialize_val(v) for k, v in list(val.items())[:50]}
        if isinstance(val, set): return [self.serialize_val(x) for x in list(val)[:50]]
        # Custom classes and user defined objects
        return {
            '__type__': 'object_ref',
            'id': f"obj_{id(val)}",
            'className': type(val).__name__,
            'repr': repr(val)[:50]
        }

    def extract_heap_objects(self, obj, heap_map, visited, depth=0):
        if depth > 10 or obj is None: return
        obj_id = f"obj_{id(obj)}"
        if obj_id in visited or isinstance(obj, (int, float, str, bool)): return
        visited.add(obj_id)

        # Collections
        if isinstance(obj, (list, tuple, set)):
            for item in obj:
                self.extract_heap_objects(item, heap_map, visited, depth + 1)
            return
        if isinstance(obj, dict):
            for v in obj.values():
                self.extract_heap_objects(v, heap_map, visited, depth + 1)
            return

        # User-defined class instance with __dict__
        if hasattr(obj, '__dict__'):
            heap_map[obj_id] = {
                'id': obj_id,
                'className': type(obj).__name__,
                'fields': {},
                'references': {}
            }
            for attr, val in vars(obj).items():
                if attr.startswith('__'): continue
                if hasattr(val, '__dict__'):
                    ref_id = f"obj_{id(val)}"
                    heap_map[obj_id]['references'][attr] = ref_id
                    self.extract_heap_objects(val, heap_map, visited, depth + 1)
                else:
                    heap_map[obj_id]['fields'][attr] = self.serialize_val(val)

    def is_duplicate(self, current):
        if not self.last_snapshot: return False
        return (self.last_snapshot['line'] == current['line'] and
                self.last_snapshot['eventType'] == current['eventType'] and
                self.last_snapshot['scope'] == current['scope'] and
                len(self.last_snapshot['stdout']) == len(current['stdout']))

def __run_prism_trace__(code_str, max_frames=1000, max_ops=5000, max_stack_depth=50, max_stdout_lines=100):
    tracer = PrismPythonTracer(
        max_frames=max_frames,
        max_ops=max_ops,
        max_stack_depth=max_stack_depth,
        max_stdout_lines=max_stdout_lines
    )
    
    old_stdout = sys.stdout
    sys.stdout = tracer.stdout_buffer
    user_globals = {}
    
    try:
        compiled = compile(code_str, '<user_code>', 'exec')
    except SyntaxError as e:
        sys.stdout = old_stdout
        return json.dumps({
            'status': 'SYNTAX_ERROR',
            'errorMessage': f"SyntaxError at line {e.lineno}: {e.msg}",
            'frames': [],
            'metrics': {'totalOperations': 0, 'maxStackDepth': 0, 'peakHeapObjects': 0, 'executionDurationMs': 0}
        })
    except Exception as e:
        sys.stdout = old_stdout
        return json.dumps({
            'status': 'SYNTAX_ERROR',
            'errorMessage': str(e),
            'frames': [],
            'metrics': {'totalOperations': 0, 'maxStackDepth': 0, 'peakHeapObjects': 0, 'executionDurationMs': 0}
        })

    sys.settrace(tracer.trace_calls)
    exec_status = 'SUCCESS'
    error_msg = None
    
    try:
        exec(compiled, user_globals)
    except Exception as e:
        if tracer.status != 'SUCCESS':
            exec_status = tracer.status
            error_msg = tracer.error_message
        else:
            exec_status = 'RUNTIME_ERROR'
            error_msg = f"{type(e).__name__}: {str(e)}"
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    max_stack = 0
    peak_heap = 0
    for f in tracer.frames:
        if len(f['callStack']) > max_stack:
            max_stack = len(f['callStack'])
        if len(f['heap']) > peak_heap:
            peak_heap = len(f['heap'])

    return json.dumps({
        'status': exec_status,
        'errorMessage': error_msg,
        'frames': tracer.frames,
        'metrics': {
            'totalOperations': tracer.step_count,
            'maxStackDepth': max_stack,
            'peakHeapObjects': peak_heap,
            'executionDurationMs': 0
        }
    })
`;
