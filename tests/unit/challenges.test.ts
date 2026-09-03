/**
 * Prism Phase 8C: Challenge & Practice System Test Suite
 * Validates challenge registry integrity, deterministic evaluation,
 * progress persistence, and sandbox preflight compliance.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ALL_CHALLENGES,
  getAllChallenges,
  getChallengeBySlug,
  getChallengeById,
  getChallengesByTopic,
  getChallengesByDifficulty,
  getChallengesByType,
  getChallengesForLesson,
  searchChallenges,
} from '@/lib/content/challenges';
import {
  evaluateChallenge,
} from '@/lib/practice/challengeEvaluator';
import {
  getChallengeProgress,
  saveChallengeProgress,
  recordAttempt,
  isChallengeCompleted,
  getChallengeAttemptCount,
  getChallengeAttempt,
  resetChallengeProgress,
} from '@/lib/practice/challengeProgressManager';
import { validateCodePreflight } from '@/lib/execution/astValidator';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';
import { PrismTrace } from '@/types/trace';
import { Challenge } from '@/types/challenge';

// Helper: Create a mock PrismTrace
function createMockTrace(stdout: string[] = [], status: any = 'SUCCESS'): PrismTrace {
  return {
    version: '1.0',
    code: 'print(42)',
    language: 'python',
    status,
    totalSteps: stdout.length || 1,
    frames: [
      {
        stepIndex: 0,
        line: 1,
        eventType: 'line',
        description: 'Executed line 1',
        callStack: [],
        scope: {},
        heap: {},
        activePointers: [],
        stdout,
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

describe('Phase 8C: Practice & Challenges System', () => {
  // =========================================================================
  // 1. REGISTRY INTEGRITY
  // =========================================================================
  describe('1. Challenge Content Registry', () => {
    it('contains challenges across all supported DSA topics', () => {
      const challenges = getAllChallenges();
      expect(challenges.length).toBeGreaterThanOrEqual(15);

      const topics = new Set(challenges.map((c) => c.topic));
      expect(topics.has('arrays')).toBe(true);
      expect(topics.has('linked-lists')).toBe(true);
      expect(topics.has('searching')).toBe(true);
      expect(topics.has('sorting')).toBe(true);
      expect(topics.has('trees')).toBe(true);
      expect(topics.has('complexity')).toBe(true);
    });

    it('contains challenges across all 4 challenge types', () => {
      const challenges = getAllChallenges();
      const types = new Set(challenges.map((c) => c.type));
      expect(types.has('code-completion')).toBe(true);
      expect(types.has('debugging')).toBe(true);
      expect(types.has('trace-prediction')).toBe(true);
      expect(types.has('complexity')).toBe(true);
    });

    it('enforces unique IDs and slugs across all challenges', () => {
      const challenges = getAllChallenges();
      const ids = challenges.map((c) => c.id);
      const slugs = challenges.map((c) => c.slug);

      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('ensures every challenge has required non-empty fields', () => {
      for (const ch of getAllChallenges()) {
        expect(ch.id).toBeTruthy();
        expect(ch.slug).toBeTruthy();
        expect(ch.title).toBeTruthy();
        expect(ch.description).toBeTruthy();
        expect(ch.instructions).toBeTruthy();
        expect(ch.starterCode).toBeDefined();
        expect(ch.solutionExplanation).toBeTruthy();
        expect(ch.hints.length).toBeGreaterThanOrEqual(1);
        for (const hint of ch.hints) {
          expect(hint.level).toBeGreaterThanOrEqual(1);
          expect(hint.text).toBeTruthy();
        }
      }
    });

    it('ensures trace-prediction challenges have correct answers and options', () => {
      const predictions = getChallengesByType('trace-prediction');
      expect(predictions.length).toBeGreaterThanOrEqual(2);
      for (const ch of predictions) {
        expect(ch.traceQuestion).toBeTruthy();
        expect(ch.correctTraceAnswer).toBeTruthy();
        if (ch.traceAnswerOptions) {
          expect(ch.traceAnswerOptions).toContain(ch.correctTraceAnswer);
        }
      }
    });

    it('ensures complexity challenges have correct complexity answers', () => {
      const complexity = getChallengesByType('complexity');
      expect(complexity.length).toBeGreaterThanOrEqual(2);
      for (const ch of complexity) {
        expect(ch.complexityQuestion).toBeTruthy();
        expect(ch.correctComplexityClass).toBeTruthy();
      }
    });

    it('ensures code-completion and debugging challenges have test cases or expected output', () => {
      const codeChallenges = getAllChallenges().filter(
        (c) => c.type === 'code-completion' || c.type === 'debugging'
      );
      for (const ch of codeChallenges) {
        const hasTestCases = ch.testCases && ch.testCases.length > 0;
        const hasOutput = typeof ch.expectedOutput === 'string';
        expect(hasTestCases || hasOutput).toBe(true);
      }
    });

    it('links relevant challenges to Phase 8B learning path lessons', () => {
      const linked = getAllChallenges().filter((c) => c.lessonId);
      expect(linked.length).toBeGreaterThanOrEqual(4);
      for (const ch of linked) {
        expect(ch.learningPathId).toBe('path-dsa-foundations');
      }
    });
  });

  // =========================================================================
  // 2. QUERY HELPERS
  // =========================================================================
  describe('2. Query Helpers', () => {
    it('retrieves challenge by slug', () => {
      const ch = getChallengeBySlug('find-maximum-value');
      expect(ch).toBeDefined();
      expect(ch?.id).toBe('ch-arr-find-max');
    });

    it('retrieves challenge by id', () => {
      const ch = getChallengeById('ch-arr-find-max');
      expect(ch).toBeDefined();
      expect(ch?.slug).toBe('find-maximum-value');
    });

    it('returns undefined for non-existent slug or id', () => {
      expect(getChallengeBySlug('non-existent-slug')).toBeUndefined();
      expect(getChallengeById('non-existent-id')).toBeUndefined();
    });

    it('filters by topic', () => {
      const arrs = getChallengesByTopic('arrays');
      expect(arrs.length).toBeGreaterThan(0);
      expect(arrs.every((c) => c.topic === 'arrays')).toBe(true);
    });

    it('filters by difficulty', () => {
      const beginners = getChallengesByDifficulty('Beginner');
      expect(beginners.length).toBeGreaterThan(0);
      expect(beginners.every((c) => c.difficulty === 'Beginner')).toBe(true);
    });

    it('filters by challenge type', () => {
      const debugs = getChallengesByType('debugging');
      expect(debugs.length).toBeGreaterThan(0);
      expect(debugs.every((c) => c.type === 'debugging')).toBe(true);
    });

    it('finds challenges for a specific lesson', () => {
      const chs = getChallengesForLesson('lesson-array-memory');
      expect(chs.length).toBeGreaterThan(0);
      expect(chs[0].lessonId).toBe('lesson-array-memory');
    });

    it('searches challenges by query string', () => {
      const found = searchChallenges('maximum');
      expect(found.length).toBeGreaterThan(0);
      expect(found.some((c) => c.title.includes('Maximum'))).toBe(true);
    });
  });

  // =========================================================================
  // 3. DETERMINISTIC EVALUATOR
  // =========================================================================
  describe('3. Deterministic Evaluator (Grounded Invariant)', () => {
    const codeChallenge: Challenge = {
      id: 'test-code-ch',
      slug: 'test-code-ch',
      title: 'Test Code Challenge',
      description: 'Desc',
      topic: 'arrays',
      difficulty: 'Beginner',
      type: 'code-completion',
      instructions: 'Inst',
      starterCode: 'def f(): pass',
      hints: [{ level: 1, text: 'H1' }],
      solutionExplanation: 'Sol',
      testCases: [
        { id: 'tc1', description: 'Test 1', inputCode: 'print(f())', expectedOutput: '42' },
      ],
    };

    it('passes when trace output matches expected output exactly', () => {
      const trace = createMockTrace(['42']);
      const result = evaluateChallenge(codeChallenge, trace, 'SUCCESS');
      expect(result.passed).toBe(true);
      expect(result.status).toBe('passed');
      expect(result.testResults?.[0].passed).toBe(true);
    });

    it('fails when trace output does not match expected output', () => {
      const trace = createMockTrace(['99']);
      const result = evaluateChallenge(codeChallenge, trace, 'SUCCESS');
      expect(result.passed).toBe(false);
      expect(result.status).toBe('needs-retry');
      expect(result.testResults?.[0].passed).toBe(false);
      expect(result.testResults?.[0].actual).toBe('99');
      expect(result.testResults?.[0].expected).toBe('42');
    });

    it('returns error status when execution status is not SUCCESS', () => {
      const trace = createMockTrace([], 'RUNTIME_ERROR');
      const result = evaluateChallenge(codeChallenge, trace, 'RUNTIME_ERROR', 'IndexError: out of bounds');
      expect(result.passed).toBe(false);
      expect(result.status).toBe('error');
      expect(result.feedback).toContain('Execution failed');
      expect(result.errorMessage).toBe('IndexError: out of bounds');
    });

    it('returns error when trace is null or has empty frames', () => {
      const result = evaluateChallenge(codeChallenge, null, 'TIMEOUT', 'Execution timed out');
      expect(result.passed).toBe(false);
      expect(result.status).toBe('error');
      expect(result.feedback).toContain('Execution error');
    });

    it('evaluates trace-prediction challenges deterministically', () => {
      const predChallenge: Challenge = {
        id: 'test-pred-ch',
        slug: 'test-pred-ch',
        title: 'Predict',
        description: 'Desc',
        topic: 'searching',
        difficulty: 'Beginner',
        type: 'trace-prediction',
        instructions: 'Inst',
        starterCode: 'x = 1',
        hints: [{ level: 1, text: 'H' }],
        solutionExplanation: 'Sol',
        traceQuestion: 'How many steps?',
        traceAnswerOptions: ['1', '2', '3'],
        correctTraceAnswer: '3',
      };

      const trace = createMockTrace();
      // Correct answer
      const correctRes = evaluateChallenge(predChallenge, trace, 'SUCCESS', null, '3');
      expect(correctRes.passed).toBe(true);
      expect(correctRes.status).toBe('passed');

      // Incorrect answer
      const wrongRes = evaluateChallenge(predChallenge, trace, 'SUCCESS', null, '1');
      expect(wrongRes.passed).toBe(false);
      expect(wrongRes.status).toBe('needs-retry');
    });

    it('evaluates complexity challenges with normalization', () => {
      const compChallenge: Challenge = {
        id: 'test-comp-ch',
        slug: 'test-comp-ch',
        title: 'Complexity',
        description: 'Desc',
        topic: 'complexity',
        difficulty: 'Beginner',
        type: 'complexity',
        instructions: 'Inst',
        starterCode: 'x = 1',
        hints: [{ level: 1, text: 'H' }],
        solutionExplanation: 'Sol',
        complexityQuestion: 'What is time complexity?',
        correctComplexityClass: 'O(n^2)',
      };

      const trace = createMockTrace();
      // Exact match
      expect(evaluateChallenge(compChallenge, trace, 'SUCCESS', null, 'O(n^2)').passed).toBe(true);
      // Normalized match (unicode square: O(n²))
      expect(evaluateChallenge(compChallenge, trace, 'SUCCESS', null, 'O(n²)').passed).toBe(true);
      // Wrong answer
      expect(evaluateChallenge(compChallenge, trace, 'SUCCESS', null, 'O(n)').passed).toBe(false);
    });

    it('attaches aiContext without allowing AI to override deterministic verdict', () => {
      const trace = createMockTrace(['42']);
      const result = evaluateChallenge(codeChallenge, trace, 'SUCCESS');
      expect(result.aiContext).toBeDefined();
      expect(result.aiContext?.passed).toBe(true);
      expect(result.aiContext?.challengeType).toBe('code-completion');
    });
  });

  // =========================================================================
  // 4. PROGRESS MANAGER
  // =========================================================================
  describe('4. Challenge Progress Manager (Client Storage)', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};
      const storageMock = {
        getItem: vi.fn((k: string) => mockStorage[k] ?? null),
        setItem: vi.fn((k: string, v: string) => { mockStorage[k] = v; }),
        removeItem: vi.fn((k: string) => { delete mockStorage[k]; }),
        clear: vi.fn(() => { mockStorage = {}; }),
        length: 0,
        key: vi.fn(),
      };
      vi.stubGlobal('localStorage', storageMock);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns empty progress when storage is empty', () => {
      const progress = getChallengeProgress();
      expect(progress.attempts).toEqual({});
      expect(typeof progress.lastUpdated).toBe('number');
    });

    it('records attempt and marks completed when passed', () => {
      recordAttempt('ch-arr-find-max', true, 'def find_max(): pass');
      expect(isChallengeCompleted('ch-arr-find-max')).toBe(true);
      expect(getChallengeAttemptCount('ch-arr-find-max')).toBe(1);

      const attempt = getChallengeAttempt('ch-arr-find-max');
      expect(attempt?.passed).toBe(true);
      expect(attempt?.lastCode).toBe('def find_max(): pass');
    });

    it('maintains passed=true even if subsequent attempt fails', () => {
      recordAttempt('ch-arr-find-max', true);
      expect(isChallengeCompleted('ch-arr-find-max')).toBe(true);

      // Second attempt fails
      recordAttempt('ch-arr-find-max', false);
      expect(isChallengeCompleted('ch-arr-find-max')).toBe(true);
      expect(getChallengeAttemptCount('ch-arr-find-max')).toBe(2);
    });

    it('safely recovers from malformed localStorage JSON', () => {
      mockStorage['prism_challenge_progress_v1'] = 'INVALID_JSON_CORRUPTED{{{';
      const progress = getChallengeProgress();
      expect(progress.attempts).toEqual({});
    });

    it('resets progress cleanly', () => {
      recordAttempt('ch-arr-find-max', true);
      expect(isChallengeCompleted('ch-arr-find-max')).toBe(true);
      resetChallengeProgress();
      expect(isChallengeCompleted('ch-arr-find-max')).toBe(false);
    });
  });

  // =========================================================================
  // 5. AST PREFLIGHT COMPLIANCE
  // =========================================================================
  describe('5. AST Preflight & Sandbox Compliance', () => {
    it('ensures all challenge starterCode passes AST preflight validation', () => {
      for (const ch of getAllChallenges()) {
        const preflight = validateCodePreflight(ch.starterCode, DEFAULT_EXECUTION_LIMITS);
        expect(preflight.isValid).toBe(true);
        expect(preflight.status).toBe('SUCCESS');
      }
    });
  });
});

