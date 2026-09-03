/**
 * Prism Phase 8B: Client-Side Learning Progress Manager
 * Safely persists and retrieves student lesson progression using localStorage.
 * Enforces strict validation, SSR guards, and recovery from malformed data.
 */

import { UserProgressState, PathProgressSummary, LearningPath } from '@/types/learningPath';
import { getAllLessonsForPath } from '@/lib/content/learningPaths';

const STORAGE_KEY = 'prism_learning_progress_v1';

function getDefaultProgress(): UserProgressState {
  return {
    completedLessonIds: [],
    currentLessonId: null,
    lastUpdated: Date.now(),
  };
}

/**
 * Validates and sanitizes a raw parsed object from localStorage.
 */
function validateProgressState(raw: any): UserProgressState {
  if (!raw || typeof raw !== 'object') {
    return getDefaultProgress();
  }

  const completed = Array.isArray(raw.completedLessonIds)
    ? raw.completedLessonIds.filter((id: any): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];

  const current = typeof raw.currentLessonId === 'string' && raw.currentLessonId.trim().length > 0
    ? raw.currentLessonId
    : null;

  const updated = typeof raw.lastUpdated === 'number' && !isNaN(raw.lastUpdated)
    ? raw.lastUpdated
    : Date.now();

  return {
    completedLessonIds: completed,
    currentLessonId: current,
    lastUpdated: updated,
  };
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

/**
 * Retrieve current user progress from localStorage.
 */
export function getProgress(): UserProgressState {
  const storage = getStorage();
  if (!storage) {
    return getDefaultProgress();
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw);
    return validateProgressState(parsed);
  } catch {
    // Malformed JSON recovery
    return getDefaultProgress();
  }
}

/**
 * Save user progress safely to localStorage.
 */
export function saveProgress(progress: UserProgressState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const sanitized = validateProgressState(progress);
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('Unable to persist Prism learning progress:', err);
  }
}

/**
 * Check if a specific lesson is completed.
 */
export function isLessonCompleted(lessonId: string): boolean {
  const progress = getProgress();
  return progress.completedLessonIds.includes(lessonId);
}

/**
 * Mark a lesson as completed.
 */
export function markLessonComplete(lessonId: string): void {
  const progress = getProgress();
  if (!progress.completedLessonIds.includes(lessonId)) {
    progress.completedLessonIds.push(lessonId);
    progress.lastUpdated = Date.now();
    saveProgress(progress);
  }
}

/**
 * Mark a lesson as incomplete.
 */
export function markLessonIncomplete(lessonId: string): void {
  const progress = getProgress();
  const index = progress.completedLessonIds.indexOf(lessonId);
  if (index !== -1) {
    progress.completedLessonIds.splice(index, 1);
    progress.lastUpdated = Date.now();
    saveProgress(progress);
  }
}

/**
 * Toggle completion status of a lesson. Returns the new completion state.
 */
export function toggleLessonComplete(lessonId: string): boolean {
  const completed = isLessonCompleted(lessonId);
  if (completed) {
    markLessonIncomplete(lessonId);
    return false;
  } else {
    markLessonComplete(lessonId);
    return true;
  }
}

/**
 * Update the active lesson currently being studied.
 */
export function setCurrentLesson(lessonId: string): void {
  const progress = getProgress();
  progress.currentLessonId = lessonId;
  progress.lastUpdated = Date.now();
  saveProgress(progress);
}

/**
 * Calculate completion percentage and counts for a learning path.
 */
export function calculatePathProgress(path: LearningPath): PathProgressSummary {
  const allLessons = getAllLessonsForPath(path);
  const total = allLessons.length;
  if (total === 0) return { completed: 0, total: 0, percentage: 0 };

  const progress = getProgress();
  const completed = allLessons.filter((l) => progress.completedLessonIds.includes(l.id)).length;
  const percentage = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
  };
}

/**
 * Reset all learning progress.
 */
export function resetPathProgress(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Unable to reset Prism learning progress:', err);
  }
}
