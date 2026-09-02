/**
 * Test Suite: AST Validator (Preflight Validation)
 * 10 acceptance-criteria test cases for Phase 2.
 */

import { describe, it, expect } from 'vitest';
import { validateCodePreflight } from '@/lib/execution/astValidator';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';

// TC-01: Simple variable assignment
describe('TC-01: Simple variable assignment', () => {
  it('passes preflight for valid assignment code', () => {
    const code = "x = 42\ny = 'hello'\nprint(y)";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-02: For loop with counter
describe('TC-02: For loop with counter', () => {
  it('passes preflight for loop code', () => {
    const code = "total = 0\nfor i in range(10):\n    total += i\nprint(total)";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-03: Function call
describe('TC-03: Function call', () => {
  it('passes preflight for function definition and call', () => {
    const code = "def add(a, b):\n    return a + b\nresult = add(3, 4)\nprint(result)";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-04: Recursive function
describe('TC-04: Recursive function', () => {
  it('passes preflight for recursive factorial', () => {
    const code = "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-05: Linked objects / class instances
describe('TC-05: Linked objects / class instances', () => {
  it('passes preflight for class-based linked list code', () => {
    const code = "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nhead = Node(1)\nhead.next = Node(2)";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-06: Runtime error code passes preflight (runtime errors are Pyodide-side)
describe('TC-06: Runtime error code passes preflight', () => {
  it('passes preflight for division by zero (runtime error, not syntax)', () => {
    const code = "x = 10 / 0\nprint(x)";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-07: Syntax error code passes preflight (Pyodide catches it)
describe('TC-07: Syntax error code is not caught at preflight stage', () => {
  it('passes preflight (Python syntax errors surface during Pyodide execution)', () => {
    const code = "def broken(\nprint('unclosed'";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-08: Infinite loop passes preflight (caught by watchdog at runtime)
describe('TC-08: Infinite loop not caught at preflight', () => {
  it('passes preflight — 3000ms watchdog in traceRunner handles it', () => {
    const code = "while True:\n    pass";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});

// TC-09: Disallowed module imports
describe('TC-09: Disallowed module import rejected at preflight', () => {
  it('blocks "import os"', () => {
    const code = "import os\nprint(os.getcwd())";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('UNSUPPORTED');
    expect(result.errorMessage).toContain("'os'");
  });

  it('blocks "from subprocess import run"', () => {
    const code = "from subprocess import run\nrun(['ls'])";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('UNSUPPORTED');
  });

  it('blocks "import sys"', () => {
    const code = "import sys\nprint(sys.path)";
    const result = validateCodePreflight(code, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('UNSUPPORTED');
  });
});

// TC-10: Source code exceeds line limit
describe('TC-10: Source code exceeds line limit', () => {
  it('rejects code exceeding maxSourceLines with TRACE_LIMIT', () => {
    const { maxSourceLines } = DEFAULT_EXECUTION_LIMITS;
    const tooLargeCode = Array(maxSourceLines + 5).fill('x = 1').join('\n');
    const result = validateCodePreflight(tooLargeCode, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('TRACE_LIMIT');
    expect(result.errorMessage).toContain(String(maxSourceLines));
  });

  it('accepts code exactly at the line limit', () => {
    const { maxSourceLines } = DEFAULT_EXECUTION_LIMITS;
    const edgeCaseCode = Array(maxSourceLines).fill('x = 1').join('\n');
    const result = validateCodePreflight(edgeCaseCode, DEFAULT_EXECUTION_LIMITS);
    expect(result.isValid).toBe(true);
  });
});
