/**
 * Prism Phase 8B: Guided Learning Paths Test Suite
 * Validates data models, curriculum sequencing, Phase 8A content mappings,
 * progression persistence, and safe client-side recovery.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DSA_FOUNDATIONS_PATH,
  LEARNING_PATHS_REGISTRY,
  getAllLearningPaths,
  getLearningPathBySlug,
  getAllLessonsForPath,
  getLessonBySlug,
} from '@/lib/content/learningPaths';
import {
  getProgress,
  saveProgress,
  isLessonCompleted,
  markLessonComplete,
  markLessonIncomplete,
  toggleLessonComplete,
  setCurrentLesson,
  calculatePathProgress,
  resetPathProgress,
} from '@/lib/learning/progressManager';
import { getAlgorithmBySlug } from '@/lib/content/algorithms';
import { validateCodePreflight } from '@/lib/execution/astValidator';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';

describe('Phase 8B: Guided Learning Paths Architecture & Curriculum', () => {

  // =========================================================================
  // 1. DATA MODEL INTEGRITY & CURRICULUM SEQUENCING
  // =========================================================================
  describe('1. Data Model & Curriculum Structure', () => {
    it('registers the initial DSA Foundations learning path', () => {
      expect(DSA_FOUNDATIONS_PATH).toBeDefined();
      expect(DSA_FOUNDATIONS_PATH.id).toBe('path-dsa-foundations');
      expect(DSA_FOUNDATIONS_PATH.slug).toBe('dsa-foundations');
      expect(DSA_FOUNDATIONS_PATH.difficulty).toBe('Beginner');
      expect(DSA_FOUNDATIONS_PATH.stages.length).toBe(6);
    });

    it('enforces unique IDs and slugs across all learning paths', () => {
      const paths = getAllLearningPaths();
      const ids = paths.map((p) => p.id);
      const slugs = paths.map((p) => p.slug);

      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('enforces monotonic stage ordering from Stage 1 to Stage 6', () => {
      const stages = DSA_FOUNDATIONS_PATH.stages;
      for (let i = 0; i < stages.length; i++) {
        expect(stages[i].order).toBe(i + 1);
        expect(stages[i].id).toBeTruthy();
        expect(stages[i].title).toBeTruthy();
        expect(stages[i].description).toBeTruthy();
        expect(stages[i].lessons.length).toBeGreaterThan(0);
      }
    });

    it('contains exactly 10 sequential lessons with strictly monotonic order', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);
      expect(allLessons.length).toBe(10);

      const lessonIds = new Set<string>();
      const lessonSlugs = new Set<string>();

      for (let i = 0; i < allLessons.length; i++) {
        const lesson = allLessons[i];
        expect(lesson.order).toBe(i + 1);
        expect(lessonIds.has(lesson.id)).toBe(false);
        expect(lessonSlugs.has(lesson.slug)).toBe(false);

        lessonIds.add(lesson.id);
        lessonSlugs.add(lesson.slug);

        // Required pedagogical fields non-empty
        expect(lesson.title.trim().length).toBeGreaterThan(0);
        expect(lesson.subtitle.trim().length).toBeGreaterThan(0);
        expect(lesson.whyItMatters.trim().length).toBeGreaterThan(0);
        expect(lesson.conceptExplanation.trim().length).toBeGreaterThan(0);
        expect(lesson.mentalModel.trim().length).toBeGreaterThan(0);
        expect(lesson.learningObjectives.length).toBeGreaterThanOrEqual(2);
        expect(lesson.prerequisites.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  // =========================================================================
  // 2. PHASE 8A CONTENT REFERENCES & AST VALIDATION
  // =========================================================================
  describe('2. Integration with Phase 8A Algorithm Content', () => {
    it('maps every lesson to a valid, registered Phase 8A algorithm definition', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);

      for (const lesson of allLessons) {
        expect(lesson.algorithmSlug).toBeTruthy();
        const algo = getAlgorithmBySlug(lesson.algorithmSlug);
        expect(algo).toBeDefined();
        expect(algo?.slug).toBe(lesson.algorithmSlug);
        expect(algo?.pythonCode.length).toBeGreaterThan(0);
      }
    });

    it('verifies all referenced Python examples pass AST preflight safety and line limits', () => {
      const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);

      for (const lesson of allLessons) {
        const algo = getAlgorithmBySlug(lesson.algorithmSlug)!;
        const preflight = validateCodePreflight(algo.pythonCode, DEFAULT_EXECUTION_LIMITS);
        expect(preflight.isValid).toBe(true);
        expect(preflight.status).toBe('SUCCESS');

        const lines = algo.pythonCode.trim().split('\n').length;
        expect(lines).toBeLessThanOrEqual(100);
      }
    });
  });

  // =========================================================================
  // 3. CURRICULUM TRAVERSAL & QUERY HELPERS
  // =========================================================================
  describe('3. Curriculum Traversal & Helpers', () => {
    it('retrieves learning paths by slug cleanly', () => {
      const path = getLearningPathBySlug('dsa-foundations');
      expect(path).toBeDefined();
      expect(path?.title).toBe('DSA Foundations');

      const nonExistent = getLearningPathBySlug('advanced-graph-theory');
      expect(nonExistent).toBeUndefined();
    });

    it('correctly computes previous and next lessons for the first lesson', () => {
      const lookup = getLessonBySlug('dsa-foundations', 'arrays-memory-access');
      expect(lookup).toBeDefined();
      expect(lookup?.lesson.slug).toBe('arrays-memory-access');
      expect(lookup?.prevLesson).toBeUndefined(); // First lesson has no previous
      expect(lookup?.nextLesson).toBeDefined();
      expect(lookup?.nextLesson?.slug).toBe('linked-lists-pointers');
    });

    it('correctly computes previous and next lessons for the final lesson', () => {
      const lookup = getLessonBySlug('dsa-foundations', 'inorder-tree-traversal');
      expect(lookup).toBeDefined();
      expect(lookup?.lesson.slug).toBe('inorder-tree-traversal');
      expect(lookup?.prevLesson).toBeDefined();
      expect(lookup?.prevLesson?.slug).toBe('binary-search-tree-property');
      expect(lookup?.nextLesson).toBeUndefined(); // Last lesson has no next
    });

    it('returns undefined when querying nonexistent lesson or path', () => {
      expect(getLessonBySlug('dsa-foundations', 'quantum-teleportation')).toBeUndefined();
      expect(getLessonBySlug('unknown-path', 'arrays-memory-access')).toBeUndefined();
    });
  });

  // =========================================================================
  // 4. PROGRESSION PERSISTENCE & LOCALSTORAGE RESILIENCE
  // =========================================================================
  describe('4. Client-Side Progression & Storage Resilience', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};
      vi.stubGlobal('localStorage', {
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
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns empty progression state initially', () => {
      const progress = getProgress();
      expect(progress.completedLessonIds).toEqual([]);
      expect(progress.currentLessonId).toBeNull();
      expect(calculatePathProgress(DSA_FOUNDATIONS_PATH)).toEqual({
        completed: 0,
        total: 10,
        percentage: 0,
      });
    });

    it('marks lessons complete and calculates path progress percentage', () => {
      markLessonComplete('lesson-array-memory');
      expect(isLessonCompleted('lesson-array-memory')).toBe(true);
      expect(isLessonCompleted('lesson-linked-list-pointers')).toBe(false);

      let summary = calculatePathProgress(DSA_FOUNDATIONS_PATH);
      expect(summary.completed).toBe(1);
      expect(summary.total).toBe(10);
      expect(summary.percentage).toBe(10);

      markLessonComplete('lesson-linked-list-pointers');
      summary = calculatePathProgress(DSA_FOUNDATIONS_PATH);
      expect(summary.completed).toBe(2);
      expect(summary.percentage).toBe(20);
    });

    it('toggles lesson completion state cleanly', () => {
      const nowComplete = toggleLessonComplete('lesson-array-memory');
      expect(nowComplete).toBe(true);
      expect(isLessonCompleted('lesson-array-memory')).toBe(true);

      const nowIncomplete = toggleLessonComplete('lesson-array-memory');
      expect(nowIncomplete).toBe(false);
      expect(isLessonCompleted('lesson-array-memory')).toBe(false);
    });

    it('tracks the current active lesson', () => {
      setCurrentLesson('lesson-binary-search');
      const progress = getProgress();
      expect(progress.currentLessonId).toBe('lesson-binary-search');
    });

    it('safely recovers from malformed JSON in localStorage without throwing', () => {
      mockStorage['prism_learning_progress_v1'] = '{ malformed: json !@#';
      const progress = getProgress();
      expect(progress.completedLessonIds).toEqual([]);
      expect(progress.currentLessonId).toBeNull();
    });

    it('safely filters invalid and non-string types in stored progress state', () => {
      mockStorage['prism_learning_progress_v1'] = JSON.stringify({
        completedLessonIds: ['lesson-array-memory', null, 42, '', '   ', 'lesson-linear-search'],
        currentLessonId: 12345, // invalid type
      });

      const progress = getProgress();
      expect(progress.completedLessonIds).toEqual(['lesson-array-memory', 'lesson-linear-search']);
      expect(progress.currentLessonId).toBeNull();
    });

    it('resets progress cleanly', () => {
      markLessonComplete('lesson-array-memory');
      expect(isLessonCompleted('lesson-array-memory')).toBe(true);

      resetPathProgress();
      expect(isLessonCompleted('lesson-array-memory')).toBe(false);
      expect(calculatePathProgress(DSA_FOUNDATIONS_PATH).completed).toBe(0);
    });
  });
});
