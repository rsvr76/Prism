/**
 * Prism Phase 8D: Unified Student Progress Manager & Selectors
 * Computes deterministic derived progress views across Phase 8B (learning)
 * and Phase 8C (practice), and manages bounded activity tracking.
 *
 * All calculations are 100% deterministic -- zero AI hallucination.
 * Source of truth for learning remains Phase 8B (prism_learning_progress_v1).
 * Source of truth for practice remains Phase 8C (prism_challenge_progress_v1).
 */

import {
  UnifiedStudentProgress,
  LearningProgressSummary,
  PracticeProgressSummary,
  StudentActivityItem,
  ExecutionHistorySummary,
} from '@/types/progress';
import { DSA_FOUNDATIONS_PATH, getAllLessonsForPath } from '@/lib/content/learningPaths';
import { ALL_CHALLENGES } from '@/lib/content/challenges';
import { getProgress, resetPathProgress } from '@/lib/learning/progressManager';
import { getChallengeProgress, resetChallengeProgress } from '@/lib/practice/challengeProgressManager';
import { ChallengeTopic } from '@/types/challenge';

const ACTIVITY_STORAGE_KEY = 'prism_student_activity_v1';
const RECENT_EXECUTIONS_STORAGE_KEY = 'prism_recent_executions_v1';
const MAX_ACTIVITY_ITEMS = 30;
const MAX_RECENT_EXECUTIONS = 10;

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
  return null;
}

/**
 * Deterministic Learning Progress Selector.
 * Derives current lesson, next lesson, and stage completion from Phase 8B.
 */
export function getLearningProgressSummary(): LearningProgressSummary {
  const learningState = getProgress();
  const allLessons = getAllLessonsForPath(DSA_FOUNDATIONS_PATH);
  const totalCount = allLessons.length;
  const completedIds = new Set(learningState.completedLessonIds || []);

  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // First incomplete lesson in curriculum order
  const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) || null;

  // Current lesson (from state if set, else next incomplete, else first lesson)
  let currentLesson = null;
  if (learningState.currentLessonId) {
    currentLesson = allLessons.find((l) => l.id === learningState.currentLessonId) || null;
  }
  if (!currentLesson) {
    currentLesson = nextLesson || allLessons[0] || null;
  }

  const stageBreakdown = DSA_FOUNDATIONS_PATH.stages.map((stage) => {
    const stageLessons = stage.lessons;
    const stageCompleted = stageLessons.filter((l) => completedIds.has(l.id)).length;
    return {
      stage,
      completed: stageCompleted,
      total: stageLessons.length,
      isComplete: stageLessons.length > 0 && stageCompleted === stageLessons.length,
    };
  });

  return {
    completedCount,
    totalCount,
    percentage,
    currentLesson,
    nextLesson,
    stageBreakdown,
    isCurriculumComplete: totalCount > 0 && completedCount === totalCount,
  };
}

const TOPIC_KEYS: ChallengeTopic[] = ['arrays', 'linked-lists', 'searching', 'sorting', 'trees', 'complexity'];

/**
 * Deterministic Practice Progress Selector.
 * Derives challenge pass rates, topic breakdown, and next recommended challenge from Phase 8C.
 */
export function getPracticeProgressSummary(): PracticeProgressSummary {
  const challengeState = getChallengeProgress();
  const totalCount = ALL_CHALLENGES.length;
  const attempts = challengeState.attempts || {};

  let passedCount = 0;
  let attemptedCount = 0;

  for (const challenge of ALL_CHALLENGES) {
    const attempt = attempts[challenge.id];
    if (attempt) {
      attemptedCount++;
      if (attempt.passed) {
        passedCount++;
      }
    }
  }

  const remainingCount = Math.max(0, totalCount - passedCount);
  const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const accuracyPercentage = attemptedCount > 0 ? Math.round((passedCount / attemptedCount) * 100) : 0;

  const topicBreakdown = {} as Record<ChallengeTopic, { passed: number; total: number }>;
  for (const topic of TOPIC_KEYS) {
    const topicChallenges = ALL_CHALLENGES.filter((c) => c.topic === topic);
    const topicPassed = topicChallenges.filter((c) => attempts[c.id]?.passed === true).length;
    topicBreakdown[topic] = {
      passed: topicPassed,
      total: topicChallenges.length,
    };
  }

  // Determine next recommended challenge
  // Heuristic:
  // 1. Identify current learning stage topic (if incomplete)
  // 2. Find first unpassed challenge matching that topic
  // 3. Fallback to first unpassed beginner challenge
  // 4. Fallback to any unpassed challenge
  const learning = getLearningProgressSummary();
  let nextChallenge = null;

  if (learning.nextLesson) {
    // Map stageId or algorithmSlug to challenge topic
    const stageId = learning.nextLesson.stageId;
    let targetTopic: ChallengeTopic = 'arrays';
    if (stageId.includes('linked-list')) targetTopic = 'linked-lists';
    else if (stageId.includes('search')) targetTopic = 'searching';
    else if (stageId.includes('sort')) targetTopic = 'sorting';
    else if (stageId.includes('tree') || stageId.includes('bst')) targetTopic = 'trees';

    nextChallenge = ALL_CHALLENGES.find(
      (c) => c.topic === targetTopic && !attempts[c.id]?.passed
    ) || null;
  }

  if (!nextChallenge) {
    nextChallenge = ALL_CHALLENGES.find(
      (c) => c.difficulty === 'Beginner' && !attempts[c.id]?.passed
    ) || null;
  }

  if (!nextChallenge) {
    nextChallenge = ALL_CHALLENGES.find((c) => !attempts[c.id]?.passed) || null;
  }

  return {
    attemptedCount,
    passedCount,
    totalCount,
    remainingCount,
    percentage,
    accuracyPercentage,
    topicBreakdown,
    nextChallenge,
  };
}

/**
 * Retrieve recent activity log from localStorage.
 */
export function getRecentActivity(): StudentActivityItem[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: any): item is StudentActivityItem =>
        item &&
        typeof item.id === 'string' &&
        typeof item.type === 'string' &&
        typeof item.title === 'string' &&
        typeof item.timestamp === 'number'
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_ACTIVITY_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Record a student activity event (bounded to MAX_ACTIVITY_ITEMS).
 */
export function logActivity(
  activity: Omit<StudentActivityItem, 'id' | 'timestamp'> & { timestamp?: number }
): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const current = getRecentActivity();
    const newItem: StudentActivityItem = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: activity.timestamp || Date.now(),
    };

    // De-duplicate if identical action within 5 seconds
    if (
      current.length > 0 &&
      current[0].type === newItem.type &&
      current[0].title === newItem.title &&
      Math.abs(current[0].timestamp - newItem.timestamp) < 5000
    ) {
      return;
    }

    const updated = [newItem, ...current].slice(0, MAX_ACTIVITY_ITEMS);
    storage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Unable to persist student activity log:', err);
  }
}

/**
 * Retrieve recent workbench executions metadata (bounded to MAX_RECENT_EXECUTIONS).
 */
export function getRecentExecutions(): ExecutionHistorySummary[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(RECENT_EXECUTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: any): item is ExecutionHistorySummary =>
        item &&
        typeof item.id === 'string' &&
        typeof item.label === 'string' &&
        typeof item.timestamp === 'number'
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_EXECUTIONS);
  } catch {
    return [];
  }
}

/**
 * Record a recent execution summary (bounded, metadata only -- NO heavy trace frames!).
 */
export function logExecutionSummary(
  execution: Omit<ExecutionHistorySummary, 'id' | 'timestamp'> & { timestamp?: number }
): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const current = getRecentExecutions();
    const newItem: ExecutionHistorySummary = {
      ...execution,
      id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: execution.timestamp || Date.now(),
    };

    const updated = [newItem, ...current].slice(0, MAX_RECENT_EXECUTIONS);
    storage.setItem(RECENT_EXECUTIONS_STORAGE_KEY, JSON.stringify(updated));

    // Also record an activity item
    logActivity({
      type: 'execution-run',
      title: `Executed ${execution.label}`,
      subtitle: `${execution.totalSteps} steps · Python trace`,
      href: `/?snippet=${newItem.id}`,
      metadata: { steps: execution.totalSteps },
      timestamp: newItem.timestamp,
    });
  } catch (err) {
    console.warn('Unable to persist recent execution summary:', err);
  }
}

/**
 * Unified Student Progress snapshot for Dashboard.
 */
export function getUnifiedStudentProgress(): UnifiedStudentProgress {
  const learning = getLearningProgressSummary();
  const practice = getPracticeProgressSummary();
  const recentActivity = getRecentActivity();
  const recentExecutions = getRecentExecutions();

  const totalMilestones = learning.totalCount + practice.totalCount;
  const completedMilestones = learning.completedCount + practice.passedCount;
  const overallPercentage =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const timestamps = [
    ...recentActivity.map((a) => a.timestamp),
    ...recentExecutions.map((e) => e.timestamp),
  ];
  const lastActiveTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

  return {
    learning,
    practice,
    overallPercentage,
    recentActivity,
    recentExecutions,
    lastActiveTimestamp,
  };
}

/**
 * Reset ALL student progress across Learning, Practice, and Activity.
 * Requires explicit user confirmation prior to calling.
 */
export function resetAllStudentProgress(): void {
  const storage = getStorage();
  resetPathProgress();
  resetChallengeProgress();

  if (storage) {
    try {
      storage.removeItem(ACTIVITY_STORAGE_KEY);
      storage.removeItem(RECENT_EXECUTIONS_STORAGE_KEY);
    } catch (err) {
      console.warn('Unable to clear activity keys:', err);
    }
  }
}
