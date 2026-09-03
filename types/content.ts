/**
 * Prism Phase 8A: Learning Content & Algorithm Library Type Definitions
 * Strict TypeScript content models for educational data structures and algorithms.
 */

export type AlgorithmCategory = 'data-structures' | 'algorithms';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type VisualizationTarget = '1d_array' | 'singly_linked_list' | 'binary_tree';

export interface TimeComplexitySpec {
  best: string;
  average: string;
  worst: string;
  explanation?: string;
}

export interface SpaceComplexitySpec {
  worst: string;
  explanation?: string;
}

export interface AlgorithmDefinition {
  id: string;
  slug: string;
  name: string;
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  description: string;
  whatItDoes: string;
  howItWorks: string[];
  pythonCode: string;
  timeComplexity: TimeComplexitySpec;
  spaceComplexity: SpaceComplexitySpec;
  prerequisites: string[];
  visualizationType: VisualizationTarget;
  tags: string[];
  whatToWatch: string[];
  suggestedTutorQuestions: string[];
}
