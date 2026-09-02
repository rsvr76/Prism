/**
 * Test Suite: Python Tracer Script Structure
 * Verifies the embedded Python tracer contains the required mechanisms.
 */

import { describe, it, expect } from 'vitest';
import { PYTHON_TRACER_CODE } from '@/lib/execution/pythonTracerScript';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';

describe('Python Tracer Script: Structure Validation', () => {
  it('contains the PrismPythonTracer class definition', () => {
    expect(PYTHON_TRACER_CODE).toContain('class PrismPythonTracer');
  });

  it('uses sys.settrace for execution tracing', () => {
    expect(PYTHON_TRACER_CODE).toContain('sys.settrace');
  });

  it('captures line events', () => {
    expect(PYTHON_TRACER_CODE).toContain("'line'");
  });

  it('captures call events', () => {
    expect(PYTHON_TRACER_CODE).toContain("'call'");
  });

  it('captures return events', () => {
    expect(PYTHON_TRACER_CODE).toContain("'return'");
  });

  it('captures exception events', () => {
    expect(PYTHON_TRACER_CODE).toContain("'exception'");
  });

  it('uses io.StringIO for stdout capture', () => {
    expect(PYTHON_TRACER_CODE).toContain('io.StringIO');
  });

  it('handles circular references via visited_objects tracking', () => {
    expect(PYTHON_TRACER_CODE).toContain('visited_objects');
  });

  it('uses id() for object identity / heap object tracking', () => {
    expect(PYTHON_TRACER_CODE).toContain('id(obj)');
  });

  it('outputs __PRISM_RESULT_JSON__ sentinel marker', () => {
    expect(PYTHON_TRACER_CODE).toContain('json.dumps');
  });

  it('contains serialization for heap objects', () => {
    expect(PYTHON_TRACER_CODE).toContain('extract_heap_objects');
  });

  it('stores call stack / stack frames', () => {
    expect(PYTHON_TRACER_CODE).toContain('callStack');
  });
});

describe('Execution Limits: Default Values', () => {
  it('has maxSourceLines = 300', () => {
    expect(DEFAULT_EXECUTION_LIMITS.maxSourceLines).toBe(300);
  });

  it('has maxTraceFrames = 1000', () => {
    expect(DEFAULT_EXECUTION_LIMITS.maxTraceFrames).toBe(1000);
  });

  it('has maxRuntimeMs = 3000', () => {
    expect(DEFAULT_EXECUTION_LIMITS.maxRuntimeMs).toBe(3000);
  });

  it('has maxCallStackDepth = 50', () => {
    expect(DEFAULT_EXECUTION_LIMITS.maxCallStackDepth).toBe(50);
  });

  it('has maxStdoutLines = 100', () => {
    expect(DEFAULT_EXECUTION_LIMITS.maxStdoutLines).toBe(100);
  });

  it('has maxOperations = 5000', () => {
    expect(DEFAULT_EXECUTION_LIMITS.maxOperations).toBe(5000);
  });
});

