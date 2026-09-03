/**
 * Prism Phase 8C: Practice & Challenges Type Definitions
 * Strict TypeScript models for the interactive practice system.
 *
 * IMPORTANT: Challenge submissions ALWAYS run through the existing Prism execution pipeline.
 * No alternate execution engine is created or used for challenges.
 */

export type ChallengeType =
  | 'code-completion'   // Student completes partially written code
  | 'debugging'         // Student finds and fixes a logical error
  | 'trace-prediction'  // Student answers a question about execution before/during trace
  | 'complexity';       // Student identifies time/space complexity

export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ChallengeTopic =
  | 'arrays'
  | 'linked-lists'
  | 'searching'
  | 'sorting'
  | 'trees'
  | 'complexity';

export type ChallengeStatus =
  | 'not-attempted'
  | 'running'
  | 'passed'
  | 'needs-retry'
  | 'error';

/**
 * A single deterministic test case for code/debugging challenges.
 * inputCode is appended to submitted code; expectedOutput is matched against stdout.
 */
export interface TestCase {
  id: string;
  description: string;
  inputCode: string;      // Extra Python code appended to submission to exercise the function
  expectedOutput: string; // Expected stdout output (stripped)
}

/**
 * Progressive hint — higher level = more revealing.
 */
export interface ChallengeHint {
  level: number;    // 1 = subtle nudge, 2 = more specific, 3 = near-solution
  text: string;
}

/**
 * Core challenge definition. Stored in the challenge registry (not in React components).
 */
export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;    // Short 1-2 sentence overview
  topic: ChallengeTopic;
  difficulty: ChallengeDifficulty;
  type: ChallengeType;

  // Optional Phase 8B linkage
  learningPathId?: string;
  lessonId?: string;

  instructions: string;    // Full problem statement shown to the student
  starterCode: string;     // Initial code placed in the editor

  hints: ChallengeHint[];
  solutionExplanation: string;  // Shown only after passing or explicit reveal

  // For code-completion and debugging challenges
  testCases?: TestCase[];
  expectedOutput?: string;  // For single-case output matching

  // For trace-prediction challenges
  traceQuestion?: string;        // Question asked before/during execution
  traceAnswerOptions?: string[];  // Multiple-choice options
  correctTraceAnswer?: string;   // The correct answer (matches actual trace)

  // For complexity challenges
  complexityQuestion?: string;
  correctComplexityClass?: string;  // Matches DeterministicComplexityMetrics.observedTimeHeuristic

  // Metadata
  timeComplexity?: string;
  spaceComplexity?: string;
}

/**
 * Record of a single challenge attempt by the student.
 */
export interface ChallengeAttempt {
  attemptedAt: number;    // Unix timestamp
  passed: boolean;
  attemptCount: number;
  lastCode?: string;      // Last submitted code (for reference only)
  lastAnswer?: string;    // For MC challenges
}

/**
 * Full challenge progress state persisted to localStorage.
 */
export interface ChallengeProgressState {
  attempts: Record<string, ChallengeAttempt>;  // keyed by challenge.id
  lastUpdated: number;
}

/**
 * Result of evaluating a single test case deterministically.
 */
export interface TestCaseResult {
  testCaseId: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
}

/**
 * The output of the deterministic challenge evaluator.
 * AI may explain this result but CANNOT change passed/status.
 */
export interface ChallengeEvaluationResult {
  status: ChallengeStatus;
  passed: boolean;
  feedback: string;               // Deterministic summary message
  testResults?: TestCaseResult[]; // Per-test-case results for code challenges
  traceObservation?: string;      // Trace-derived info for trace-prediction challenges
  executionStatus?: string;       // Raw execution status from PrismTrace
  errorMessage?: string;          // Execution error if any
  // Grounded context for AI -- AI explains this, does not change it
  aiContext?: {
    challengeType: ChallengeType;
    passed: boolean;
    feedback: string;
    executionStatus?: string;
    errorMessage?: string;
    testResults?: TestCaseResult[];
  };
}
