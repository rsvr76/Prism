/**
 * Prism Phase 8D: Unified Student Progress & Experience Type Definitions
 * Strict TypeScript models for student progression, dashboard metrics, and activity tracking.
 *
 * NOTE: Authoritative progress states belong to Phase 8B (learning) and Phase 8C (practice).
 * This model defines derived views and lightweight activity records.
 */

import { LearningLesson, LearningStage } from './learningPath';
import { Challenge, ChallengeTopic } from './challenge';

export type ActivityType =
  | 'lesson-started'
  | 'lesson-completed'
  | 'challenge-attempted'
  | 'challenge-passed'
  | 'execution-run';

export interface StudentActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: number;
  href: string;
  metadata?: {
    topic?: string;
    steps?: number;
    attemptCount?: number;
  };
}

export interface LearningProgressSummary {
  completedCount: number;
  totalCount: number;
  percentage: number;
  currentLesson: LearningLesson | null;
  nextLesson: LearningLesson | null;
  stageBreakdown: Array<{
    stage: LearningStage;
    completed: number;
    total: number;
    isComplete: boolean;
  }>;
  isCurriculumComplete: boolean;
}

export interface PracticeProgressSummary {
  attemptedCount: number;
  passedCount: number;
  totalCount: number;
  remainingCount: number;
  percentage: number;
  accuracyPercentage: number;
  topicBreakdown: Record<
    ChallengeTopic,
    {
      passed: number;
      total: number;
    }
  >;
  nextChallenge: Challenge | null;
}

export interface ExecutionHistorySummary {
  id: string;
  label: string;
  type: 'original' | 'branch';
  totalSteps: number;
  status: string;
  timestamp: number;
  codeSnippet: string;
}

export interface UnifiedStudentProgress {
  learning: LearningProgressSummary;
  practice: PracticeProgressSummary;
  overallPercentage: number;
  recentActivity: StudentActivityItem[];
  recentExecutions: ExecutionHistorySummary[];
  lastActiveTimestamp: number;
}
