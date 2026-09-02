/**
 * Canonical PrismTrace Data Contract
 * Ground-truth representation of program execution state.
 */

export type ExecutionStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'SUCCESS'
  | 'SYNTAX_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'TRACE_LIMIT'
  | 'RECURSION_LIMIT'
  | 'OUTPUT_LIMIT'
  | 'UNSUPPORTED';

export type EventType = 'line' | 'call' | 'return' | 'exception';

export type PrimitiveValue =
  | number
  | string
  | boolean
  | null
  | undefined
  | PrimitiveValue[]
  | { [key: string]: PrimitiveValue };

export interface ObjectReference {
  __type__: 'object_ref';
  id: string;          // e.g. 'obj_14023948'
  className: string;   // e.g. 'Node', 'LinkedList', 'CustomClass'
  repr: string;        // e.g. 'Node(val=10)'
}

export type SerializedValue = PrimitiveValue | ObjectReference;

export interface HeapObject {
  id: string;
  className: string;
  fields: Record<string, SerializedValue>;
  references: Record<string, string>; // pointer attribute name -> target heap object id (e.g. { next: 'obj_456' })
}

export interface StackFrame {
  frameId: string;
  functionName: string;
  line: number;
  localVariables: Record<string, SerializedValue>;
}

export interface PointerMarker {
  name: string;              // e.g. 'head', 'curr', 'prev', 'slow', 'fast'
  targetHeapId?: string;     // Pointer to a heap object
  targetArrayIndex?: number; // Pointer to an array index
}

export interface DetectedStructure {
  variableName: string;
  structureType: 'singly_linked_list' | 'doubly_linked_list' | 'binary_tree' | '1d_array' | '2d_matrix' | 'graph';
  rootHeapId?: string;
  confidence: number;
}

export interface PrismFrame {
  stepIndex: number;
  line: number;
  column?: number;
  eventType: EventType;
  description: string;
  callStack: StackFrame[];
  scope: Record<string, SerializedValue>;
  heap: Record<string, HeapObject>;
  activePointers: PointerMarker[];
  stdout: string[];
  exception?: {
    type: string;
    message: string;
  } | null;
}

export interface TraceMetrics {
  totalOperations: number;
  maxStackDepth: number;
  peakHeapObjects: number;
  executionDurationMs: number;
}

export interface ExecutionLimits {
  maxSourceLines: number;
  maxTraceFrames: number;
  maxOperations: number;
  maxRuntimeMs: number;
  maxCallStackDepth: number;
  maxStdoutLines: number;
}

export interface PrismTrace {
  version: '1.0';
  code: string;
  language: 'python';
  status: ExecutionStatus;
  errorMessage?: string;
  totalSteps: number;
  frames: PrismFrame[];
  detectedStructures: DetectedStructure[];
  metrics: TraceMetrics;
}

export type ExecutionType = 'original' | 'branch';

export interface ExecutionRecord {
  executionId: string;
  type: ExecutionType;
  label: string;
  code: string;
  trace: PrismTrace | null;
  parentExecutionId?: string;
  parentStepIndex?: number;
  createdAt: number;
}
