/**
 * Prism Phase 8B: Guided Learning Paths Type Definitions
 * Strict TypeScript content models for structured learning journeys.
 */

import { DifficultyLevel } from './content';

export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface LearningLesson {
  id: string;
  slug: string;
  stageId: string;
  title: string;
  subtitle: string;
  whyItMatters: string;
  learningObjectives: string[];
  prerequisites: string[];
  conceptExplanation: string;
  mentalModel: string;
  algorithmSlug: string; // References AlgorithmDefinition.slug from Phase 8A
  order: number;
}

export interface LearningStage {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: LearningLesson[];
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: string;
  prerequisites: string[];
  stages: LearningStage[];
}

export interface UserProgressState {
  completedLessonIds: string[];
  currentLessonId: string | null;
  lastUpdated: number;
}

export interface PathProgressSummary {
  completed: number;
  total: number;
  percentage: number;
}
