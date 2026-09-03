/**
 * Prism Phase 8D: Unified Student Progress & Dashboard Test Suite
 * Tests deterministic progress selectors, continue-learning derivation,
 * practice-next heuristics, bounded activity logs, and reset behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getLearningProgressSummary,
  getPracticeProgressSummary,
  getRecentActivity,
  logActivity,
  getRecentExecutions,
  logExecutionSummary,
  getUnifiedStudentProgress,
  resetAllStudentProgress,
} from '@/lib/progress/studentProgress';
import { DSA_FOUNDATIONS_PATH, getAllLessonsForPath } from '@/lib/content/learningPaths';
import { ALL_CHALLENGES } from '@/lib/content/challenges';
import { saveProgress } from '@/lib/learning/progressManager';
import { saveChallengeProgress } from '@/lib/practice/challengeProgressManager';

describe('Phase 8D: Unified Student Progress & Experience', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};

    const fakeLocalStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };

    vi.stubGlobal('localStorage', fakeLocalStorage);
    (globalThis as any).window = { localStorage: fakeLocalStorage };
    (globalThis as any).localStorage = fakeLocalStorage;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. LEARNING PROGRESS SELECTORS & CONTINUE LEARNING
  // =========================================================================
  describe('1. Learning Progress Selectors & Continue Learning', () => {
    it('computes clean zero progress for a new student', () => {
      const summary = getLearningProgressSummary();
      expect(summary.completedCount).toBe(0);
      expect(summary.totalCount).toBe(10);
      expect(summary.percentage).toBe(0);
      expect(summary.isCurriculumComplete).toBe(false);

      // Continue learning defaults to the first lesson
      expect(summary.nextLesson).toBeDefined();
      expect(summary.nextLesson?.slug).toBe('arrays-memory-access');
    });

    it('computes partial progress and advances Continue Learning to the next incomplete lesson', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);

      // Mark first 3 lessons complete
      saveProgress({
        completedLessonIds: [allLessons[0].id, allLessons[1].id, allLessons[2].id],
        currentLessonId: allLessons[2].id,
        lastUpdated: Date.now(),
      });

      const summary = getLearningProgressSummary();
      expect(summary.completedCount).toBe(3);
      expect(summary.totalCount).toBe(10);
      expect(summary.percentage).toBe(30);

      // Next lesson should be Lesson 4 (binary-search-divide-conquer)
      expect(summary.nextLesson?.id).toBe(allLessons[3].id);
      expect(summary.nextLesson?.slug).toBe('binary-search-divide-conquer');

      // Stage 1 (Arrays) and Stage 2 (Linked Lists) should be complete
      expect(summary.stageBreakdown[0].isComplete).toBe(true);
      expect(summary.stageBreakdown[1].isComplete).toBe(true);
      expect(summary.stageBreakdown[2].isComplete).toBe(false); // Searching has 2 lessons, 1 completed
    });

    it('handles curriculum completion gracefully with nextLesson null and isCurriculumComplete true', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);
      const allIds = allLessons.map((l) => l.id);

      saveProgress({
        completedLessonIds: allIds,
        currentLessonId: allIds[allIds.length - 1],
        lastUpdated: Date.now(),
      });

      const summary = getLearningProgressSummary();
      expect(summary.completedCount).toBe(10);
      expect(summary.percentage).toBe(100);
      expect(summary.isCurriculumComplete).toBe(true);
      expect(summary.nextLesson).toBeNull();
    });
  });

  // =========================================================================
  // 2. PRACTICE PROGRESS SELECTORS & PRACTICE NEXT HEURISTIC
  // =========================================================================
  describe('2. Practice Progress Selectors & Practice Next Heuristic', () => {
    it('computes clean zero practice state with next challenge pointing to beginner challenge', () => {
      const summary = getPracticeProgressSummary();
      expect(summary.attemptedCount).toBe(0);
      expect(summary.passedCount).toBe(0);
      expect(summary.percentage).toBe(0);
      expect(summary.accuracyPercentage).toBe(0);
      expect(summary.totalCount).toBe(ALL_CHALLENGES.length);

      // Next challenge should be available
      expect(summary.nextChallenge).toBeDefined();
      expect(summary.nextChallenge?.difficulty).toBe('Beginner');
    });

    it('records attempts and passed challenges accurately across topics', () => {
      const firstChallenge = ALL_CHALLENGES[0];
      const secondChallenge = ALL_CHALLENGES[1];

      saveChallengeProgress({
        attempts: {
          [firstChallenge.id]: {
            attemptedAt: Date.now(),
            passed: true,
            attemptCount: 1,
          },
          [secondChallenge.id]: {
            attemptedAt: Date.now(),
            passed: false,
            attemptCount: 2,
          },
        },
        lastUpdated: Date.now(),
      });

      const summary = getPracticeProgressSummary();
      expect(summary.attemptedCount).toBe(2);
      expect(summary.passedCount).toBe(1);
      expect(summary.accuracyPercentage).toBe(50); // 1 passed out of 2 attempted
      expect(summary.topicBreakdown[firstChallenge.topic].passed).toBeGreaterThanOrEqual(1);
    });

    it('recommends topic-aligned practice based on the active or next lesson', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);

      // Student is on searching stage (Lesson 3 & 4)
      saveProgress({
        completedLessonIds: [allLessons[0].id, allLessons[1].id], // Arrays & Lists complete
        currentLessonId: allLessons[2].id, // Linear search
        lastUpdated: Date.now(),
      });

      const summary = getPracticeProgressSummary();
      expect(summary.nextChallenge).toBeDefined();
      // Should prioritize a searching challenge
      expect(summary.nextChallenge?.topic).toBe('searching');
    });
  });

  // =========================================================================
  // 3. BOUNDED ACTIVITY & EXECUTION TRACKING
  // =========================================================================
  describe('3. Bounded Activity & Execution Tracking', () => {
    it('logs activity items in chronological order descending', () => {
      logActivity({
        type: 'lesson-started',
        title: 'Dynamic Arrays',
        subtitle: 'Stage 1',
        href: '/paths/dsa-foundations/arrays-memory-access',
        timestamp: 1000,
      });

      logActivity({
        type: 'lesson-completed',
        title: 'Dynamic Arrays',
        subtitle: 'Stage 1 Complete',
        href: '/paths/dsa-foundations/arrays-memory-access',
        timestamp: 2000,
      });

      const activities = getRecentActivity();
      expect(activities.length).toBe(2);
      expect(activities[0].type).toBe('lesson-completed');
      expect(activities[1].type).toBe('lesson-started');
    });

    it('strictly clamps activity log to maximum 30 entries (FIFO)', () => {
      for (let i = 0; i < 40; i++) {
        logActivity({
          type: 'execution-run',
          title: `Run ${i}`,
          subtitle: 'Python trace',
          href: '/',
          timestamp: 1000 + i * 10,
        });
      }

      const activities = getRecentActivity();
      expect(activities.length).toBe(30);
      expect(activities[0].title).toBe('Run 39');
    });

    it('logs execution summaries with metadata and without heavy trace payloads', () => {
      logExecutionSummary({
        label: 'Bubble Sort Test',
        type: 'original',
        totalSteps: 42,
        status: 'SUCCESS',
        codeSnippet: 'arr = [5, 2, 8]',
      });

      const executions = getRecentExecutions();
      expect(executions.length).toBe(1);
      expect(executions[0].label).toBe('Bubble Sort Test');
      expect(executions[0].totalSteps).toBe(42);
      expect(executions[0].status).toBe('SUCCESS');
      // Verify no traces are attached
      expect((executions[0] as any).trace).toBeUndefined();
    });
  });

  // =========================================================================
  // 4. UNIFIED DASHBOARD PROGRESS & ERROR RECOVERY
  // =========================================================================
  describe('4. Unified Dashboard Snapshot & Error Recovery', () => {
    it('aggregates unified student progress composite percentage correctly', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);

      // Complete 5 lessons
      saveProgress({
        completedLessonIds: allLessons.slice(0, 5).map((l) => l.id),
        currentLessonId: allLessons[4].id,
        lastUpdated: Date.now(),
      });

      // Pass 2 challenges
      saveChallengeProgress({
        attempts: {
          [ALL_CHALLENGES[0].id]: { attemptedAt: Date.now(), passed: true, attemptCount: 1 },
          [ALL_CHALLENGES[1].id]: { attemptedAt: Date.now(), passed: true, attemptCount: 1 },
        },
        lastUpdated: Date.now(),
      });

      const unified = getUnifiedStudentProgress();
      expect(unified.learning.completedCount).toBe(5);
      expect(unified.practice.passedCount).toBe(2);

      const totalMilestones = unified.learning.totalCount + unified.practice.totalCount;
      const expectedPct = Math.round((7 / totalMilestones) * 100);
      expect(unified.overallPercentage).toBe(expectedPct);
    });

    it('recovers cleanly from malformed JSON in activity storage without crashing', () => {
      mockStorage['prism_student_activity_v1'] = '{ not valid json !!';
      const activities = getRecentActivity();
      expect(activities).toEqual([]);

      // Should still be able to log new activity
      logActivity({
        type: 'lesson-started',
        title: 'New Activity',
        subtitle: 'Recovered',
        href: '/',
      });
      expect(getRecentActivity().length).toBe(1);
    });

    it('resets all student progress cleanly across learning, practice, and activity', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);
      saveProgress({
        completedLessonIds: [allLessons[0].id],
        currentLessonId: allLessons[0].id,
        lastUpdated: Date.now(),
      });

      saveChallengeProgress({
        attempts: {
          [ALL_CHALLENGES[0].id]: { attemptedAt: Date.now(), passed: true, attemptCount: 1 },
        },
        lastUpdated: Date.now(),
      });

      logActivity({
        type: 'lesson-started',
        title: 'Dynamic Arrays',
        subtitle: 'Stage 1',
        href: '/',
      });

      // Confirm pre-reset state
      expect(getLearningProgressSummary().completedCount).toBe(1);
      expect(getPracticeProgressSummary().passedCount).toBe(1);
      expect(getRecentActivity().length).toBe(1);

      // Perform reset
      resetAllStudentProgress();

      // Confirm post-reset state
      expect(getLearningProgressSummary().completedCount).toBe(0);
      expect(getPracticeProgressSummary().passedCount).toBe(0);
      expect(getRecentActivity().length).toBe(0);
    });
  });
});
