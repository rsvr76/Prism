/**
 * Prism Phase 8C: Challenge Progress Manager
 * Persists and retrieves student challenge progress using localStorage.
 * Follows the same safe validation pattern as Phase 8B's progressManager.
 *
 * Storage key is separate from Phase 8B's lesson progress key.
 * No authentication or cloud storage -- client-side only.
 */

import { ChallengeProgressState, ChallengeAttempt } from '@/types/challenge';

const STORAGE_KEY = 'prism_challenge_progress_v1';

function getDefaultState(): ChallengeProgressState {
  return { attempts: {}, lastUpdated: Date.now() };
}

/**
 * Validate and sanitize raw parsed state from localStorage.
 */
function validateState(raw: any): ChallengeProgressState {
  if (!raw || typeof raw !== 'object') return getDefaultState();

  const attempts: Record<string, ChallengeAttempt> = {};
  if (raw.attempts && typeof raw.attempts === 'object') {
    for (const [id, val] of Object.entries(raw.attempts)) {
      if (!val || typeof val !== 'object') continue;
      const v = val as any;
      if (typeof v.attemptedAt !== 'number' || typeof v.passed !== 'boolean' || typeof v.attemptCount !== 'number') continue;
      attempts[id] = {
        attemptedAt: v.attemptedAt,
        passed: v.passed,
        attemptCount: Math.max(1, Math.floor(v.attemptCount)),
        lastCode: typeof v.lastCode === 'string' ? v.lastCode : undefined,
        lastAnswer: typeof v.lastAnswer === 'string' ? v.lastAnswer : undefined,
      };
    }
  }
  const lastUpdated = typeof raw.lastUpdated === 'number' && !isNaN(raw.lastUpdated)
    ? raw.lastUpdated
    : Date.now();
  return { attempts, lastUpdated };
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
  return null;
}

export function getChallengeProgress(): ChallengeProgressState {
  const storage = getStorage();
  if (!storage) return getDefaultState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return validateState(JSON.parse(raw));
  } catch {
    return getDefaultState();
  }
}

export function saveChallengeProgress(state: ChallengeProgressState): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(validateState(state)));
  } catch (err) {
    console.warn('Unable to persist challenge progress:', err);
  }
}

export function recordAttempt(
  challengeId: string,
  passed: boolean,
  code?: string,
  answer?: string
): void {
  const state = getChallengeProgress();
  const existing = state.attempts[challengeId];
  state.attempts[challengeId] = {
    attemptedAt: Date.now(),
    passed: existing?.passed || passed, // once passed, stays passed
    attemptCount: (existing?.attemptCount || 0) + 1,
    lastCode: code,
    lastAnswer: answer,
  };
  state.lastUpdated = Date.now();
  saveChallengeProgress(state);
}

export function isChallengeCompleted(challengeId: string): boolean {
  return getChallengeProgress().attempts[challengeId]?.passed === true;
}

export function getChallengeAttemptCount(challengeId: string): number {
  return getChallengeProgress().attempts[challengeId]?.attemptCount || 0;
}

export function getChallengeAttempt(challengeId: string): ChallengeAttempt | undefined {
  return getChallengeProgress().attempts[challengeId];
}

export function resetChallengeProgress(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Unable to reset challenge progress:', err);
  }
}
