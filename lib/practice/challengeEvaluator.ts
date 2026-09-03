/**
 * Prism Phase 8C: Deterministic Challenge Evaluator
 *
 * Evaluates student challenge submissions using ground-truth PrismTrace data.
 * Deterministic evaluation is authoritative -- AI may explain but NOT override results.
 *
 * CARDINAL RULE: Real execution -> PrismTrace -> deterministic evaluation -> AI explanation.
 */

import {
  Challenge,
  ChallengeEvaluationResult,
  ChallengeStatus,
  TestCase,
  TestCaseResult,
} from '@/types/challenge';
import { PrismTrace, ExecutionStatus } from '@/types/trace';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strip leading/trailing whitespace from output for comparison.
 */
function normalizeOutput(s: string): string {
  return s.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Extract all stdout lines from a PrismTrace into a single string.
 */
function extractStdout(trace: PrismTrace): string {
  const lines: string[] = [];
  for (const frame of trace.frames) {
    if (frame.stdout && frame.stdout.length > 0) {
      lines.push(...frame.stdout);
    }
  }
  // Deduplicate: trace captures stdout cumulatively; take last frame's full stdout
  const lastFrame = trace.frames[trace.frames.length - 1];
  if (lastFrame?.stdout && lastFrame.stdout.length > 0) {
    return normalizeOutput(lastFrame.stdout.join('\n'));
  }
  return normalizeOutput(lines.join('\n'));
}

/**
 * Build a clean deterministic status from ExecutionStatus.
 */
function isExecutionSuccess(executionStatus: ExecutionStatus | string): boolean {
  return executionStatus === 'SUCCESS';
}

// ---------------------------------------------------------------------------
// Evaluation strategies per challenge type
// ---------------------------------------------------------------------------

/**
 * Evaluate a code-completion or debugging challenge.
 * Checks submitted code output against expected outputs from test cases.
 *
 * NOTE: The test cases' inputCode is appended to the submitted code at the
 * caller level (ChallengeWorkbenchClient) before running. Here we only
 * check the resulting trace stdout.
 */
function evaluateCodeChallenge(
  challenge: Challenge,
  trace: PrismTrace,
  executionStatus: string,
  errorMessage?: string | null
): ChallengeEvaluationResult {
  if (!isExecutionSuccess(executionStatus)) {
    return {
      status: 'error',
      passed: false,
      feedback: `Execution failed: ${errorMessage || executionStatus}. Check your code for syntax or runtime errors, then try again.`,
      executionStatus,
      errorMessage: errorMessage || undefined,
      aiContext: {
        challengeType: challenge.type,
        passed: false,
        feedback: `Execution failed with status ${executionStatus}.`,
        executionStatus,
        errorMessage: errorMessage || undefined,
      },
    };
  }

  const actualOutput = extractStdout(trace);

  // If challenge has test cases, evaluate each individually
  if (challenge.testCases && challenge.testCases.length > 0) {
    // For single-run evaluation, we compare against expectedOutput of tc1
    // (multi-test-case runs require separate runs per test case; handled in the UI)
    const expected = normalizeOutput(challenge.testCases[0].expectedOutput);
    const passed = actualOutput === expected || actualOutput.startsWith(expected);

    const testResults: TestCaseResult[] = [
      {
        testCaseId: challenge.testCases[0].id,
        description: challenge.testCases[0].description,
        passed,
        expected,
        actual: actualOutput,
      },
    ];

    return {
      status: passed ? 'passed' : 'needs-retry',
      passed,
      feedback: passed
        ? 'Correct! Your solution produces the expected output.'
        : `Output mismatch. Expected:\n${expected}\n\nGot:\n${actualOutput}`,
      testResults,
      executionStatus,
      aiContext: {
        challengeType: challenge.type,
        passed,
        feedback: passed ? 'Solution is correct.' : 'Output mismatch detected.',
        executionStatus,
        testResults,
      },
    };
  }

  // Fallback: compare against expectedOutput field
  if (challenge.expectedOutput) {
    const expected = normalizeOutput(challenge.expectedOutput);
    const passed = actualOutput === expected;
    return {
      status: passed ? 'passed' : 'needs-retry',
      passed,
      feedback: passed
        ? 'Correct! Your output matches the expected result.'
        : `Output mismatch. Expected:\n${expected}\n\nGot:\n${actualOutput}`,
      executionStatus,
      aiContext: {
        challengeType: challenge.type,
        passed,
        feedback: passed ? 'Solution is correct.' : 'Output mismatch.',
        executionStatus,
      },
    };
  }

  // No expected output defined -- execution success is the pass criterion
  return {
    status: 'passed',
    passed: true,
    feedback: 'Your code ran successfully.',
    executionStatus,
    aiContext: { challengeType: challenge.type, passed: true, feedback: 'Execution succeeded.', executionStatus },
  };
}

/**
 * Evaluate a trace-prediction challenge.
 * Compares the student's chosen answer against correctTraceAnswer.
 * The correctTraceAnswer is the deterministic ground-truth value.
 */
function evaluateTracePrediction(
  challenge: Challenge,
  studentAnswer: string,
  trace: PrismTrace,
  executionStatus: string
): ChallengeEvaluationResult {
  if (!challenge.correctTraceAnswer) {
    return {
      status: 'error',
      passed: false,
      feedback: 'This challenge has no configured correct answer. Please contact support.',
      executionStatus,
      aiContext: { challengeType: challenge.type, passed: false, feedback: 'No correctTraceAnswer configured.', executionStatus },
    };
  }

  if (!isExecutionSuccess(executionStatus)) {
    return {
      status: 'error',
      passed: false,
      feedback: `The code failed to execute (${executionStatus}). Fix the code to enable trace verification.`,
      executionStatus,
      aiContext: { challengeType: challenge.type, passed: false, feedback: 'Execution failed.', executionStatus },
    };
  }

  const correct = challenge.correctTraceAnswer.trim();
  const given = studentAnswer.trim();
  const passed = given === correct;

  // Build an observation from the trace for AI context
  const traceObservation = `Execution completed in ${trace.totalSteps} steps with ${trace.frames.length} frames. ` +
    `Correct answer: ${correct}. Student answered: ${given}.`;

  return {
    status: passed ? 'passed' : 'needs-retry',
    passed,
    feedback: passed
      ? `Correct! The answer is ${correct}.`
      : `Not quite. You answered "${given}" but the correct answer is "${correct}". Run the trace and observe carefully.`,
    traceObservation,
    executionStatus,
    aiContext: {
      challengeType: challenge.type,
      passed,
      feedback: passed ? `Correct: ${correct}` : `Expected ${correct}, got ${given}.`,
      executionStatus,
    },
  };
}

/**
 * Evaluate a complexity challenge.
 * Compares the student's selected complexity class against correctComplexityClass.
 * The deterministic complexity analyzer is authoritative.
 */
function evaluateComplexityChallenge(
  challenge: Challenge,
  studentAnswer: string,
  executionStatus: string,
  observedComplexity?: string | null
): ChallengeEvaluationResult {
  if (!challenge.correctComplexityClass) {
    return {
      status: 'error',
      passed: false,
      feedback: 'This challenge has no configured complexity answer.',
      executionStatus,
      aiContext: { challengeType: challenge.type, passed: false, feedback: 'No correctComplexityClass configured.', executionStatus },
    };
  }

  const correct = challenge.correctComplexityClass.trim();
  const given = studentAnswer.trim();

  // Normalize: treat O(n^2) and O(n²) as equivalent
  function normalize(s: string): string {
    return s.replace('²', '^2').replace('³', '^3').toLowerCase().trim();
  }

  const passed = normalize(given) === normalize(correct);

  const traceNote = observedComplexity
    ? ` Prism's deterministic analysis observed: ${observedComplexity}.`
    : '';

  return {
    status: passed ? 'passed' : 'needs-retry',
    passed,
    feedback: passed
      ? `Correct! The time complexity is ${correct}.${traceNote}`
      : `Not quite. You answered "${given}" but the complexity is ${correct}.${traceNote} Study the trace and consider how many iterations occur relative to input size.`,
    executionStatus,
    aiContext: {
      challengeType: challenge.type,
      passed,
      feedback: passed ? `Correct: ${correct}` : `Expected ${correct}, got ${given}.${traceNote}`,
      executionStatus,
    },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluate a challenge submission deterministically.
 *
 * @param challenge     The challenge definition.
 * @param trace         The PrismTrace from real execution (may be null if execution failed immediately).
 * @param executionStatus The status string from the trace runner.
 * @param errorMessage  Error message if execution failed.
 * @param studentAnswer For trace-prediction and complexity challenges, the student's answer.
 * @param observedComplexityClass Observed complexity from Prism's deterministic analyzer (for complexity challenges).
 */
export function evaluateChallenge(
  challenge: Challenge,
  trace: PrismTrace | null,
  executionStatus: string,
  errorMessage?: string | null,
  studentAnswer?: string,
  observedComplexityClass?: string | null
): ChallengeEvaluationResult {
  // Guard: no trace available
  if (!trace || trace.frames.length === 0) {
    return {
      status: 'error',
      passed: false,
      feedback: errorMessage
        ? `Execution error: ${errorMessage}`
        : 'The code produced no execution trace. Check for immediate errors.',
      executionStatus,
      errorMessage: errorMessage || undefined,
      aiContext: {
        challengeType: challenge.type,
        passed: false,
        feedback: 'No trace available.',
        executionStatus,
        errorMessage: errorMessage || undefined,
      },
    };
  }

  switch (challenge.type) {
    case 'code-completion':
    case 'debugging':
      return evaluateCodeChallenge(challenge, trace, executionStatus, errorMessage);

    case 'trace-prediction':
      return evaluateTracePrediction(
        challenge,
        studentAnswer || '',
        trace,
        executionStatus
      );

    case 'complexity':
      return evaluateComplexityChallenge(
        challenge,
        studentAnswer || '',
        executionStatus,
        observedComplexityClass
      );

    default:
      return {
        status: 'error',
        passed: false,
        feedback: 'Unknown challenge type.',
        executionStatus,
        aiContext: { challengeType: challenge.type, passed: false, feedback: 'Unknown type.', executionStatus },
      };
  }
}
