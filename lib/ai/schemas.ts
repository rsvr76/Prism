/**
 * Zod Validation Schemas for Prism AI Subsystem (Step Explainer & Interactive Tutor)
 */

import { z } from "zod";

/**
 * State Diff Schema
 */
export const StateDiffSchema = z.object({
  variablesAdded: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  variablesRemoved: z.array(
    z.object({
      name: z.string(),
      previousValue: z.string(),
    })
  ),
  variablesChanged: z.array(
    z.object({
      name: z.string(),
      from: z.string(),
      to: z.string(),
    })
  ),
  pointersMoved: z.array(
    z.object({
      name: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
  ),
  heapObjectsCreated: z.array(z.string()),
  heapFieldsChanged: z.array(
    z.object({
      objectId: z.string(),
      field: z.string(),
      from: z.string(),
      to: z.string(),
    })
  ),
  heapReferencesChanged: z.array(
    z.object({
      objectId: z.string(),
      pointer: z.string(),
      from: z.string(),
      to: z.string(),
    })
  ),
  stdoutAdded: z.array(z.string()),
  exceptionOccurred: z.boolean(),
});

/**
 * Bounded Trace Context Schema
 */
export const BoundedTraceContextSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  line: z.number().int().positive(),
  eventType: z.string(),
  description: z.string(),
  activeLineSource: z.string().optional(),
  currentScope: z.record(z.string(), z.string()),
  previousScope: z.record(z.string(), z.string()).optional(),
  diff: StateDiffSchema,
  callStackDepth: z.number().int().nonnegative(),
  callStackTop: z.string().optional(),
  heapSummary: z.array(z.string()).optional(),
  activePointers: z.array(z.string()),
  stdout: z.array(z.string()).optional(),
  newStdout: z.array(z.string()).optional(),
  exception: z
    .object({
      type: z.string(),
      message: z.string(),
    })
    .nullable()
    .optional(),
  detectedStructureType: z.string().optional(),
  isTruncated: z.boolean(),
  truncationReason: z.string().optional(),
});

/**
 * Explain Step Request Schema
 */
export const ExplainStepRequestSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  totalSteps: z.number().int().positive(),
  sourceCode: z.string().max(15000),
  currentLineCode: z.string().max(500).optional(),
  context: BoundedTraceContextSchema,
});

/**
 * Step Explanation Response Schema
 * Strict Zod validation for LLM outputs.
 */
export const StepExplanationSchema = z.object({
  summary: z
    .string()
    .min(5, "Summary must be at least 5 characters")
    .max(500, "Summary must be under 500 characters"),
  why: z
    .string()
    .min(5, "Why explanation must be at least 5 characters")
    .max(1000, "Why explanation must be under 1000 characters"),
  changes: z
    .array(z.string().max(300))
    .max(10, "No more than 10 change bullet points"),
  dataStructureInsight: z
    .string()
    .max(600)
    .optional(),
  learningPoint: z
    .string()
    .min(5, "Learning point must be at least 5 characters")
    .max(500, "Learning point must be under 500 characters"),
});

/**
 * Tutor Conversation History Message Schema
 */
export const TutorHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1).max(2000),
});

/**
 * Tutor Request Schema
 */
export const TutorRequestSchema = z.object({
  question: z
    .string()
    .min(2, "Question must be at least 2 characters")
    .max(800, "Question must be under 800 characters"),
  stepIndex: z.number().int().nonnegative(),
  totalSteps: z.number().int().positive(),
  sourceCode: z.string().max(15000),
  history: z.array(TutorHistoryMessageSchema).max(20, "History capped at 20 messages"),
  context: BoundedTraceContextSchema,
});

/**
 * Tutor Response Schema
 * Enforces structured responses with evidence citations.
 */
export const TutorResponseSchema = z.object({
  answer: z
    .string()
    .min(5, "Answer must be at least 5 characters")
    .max(2000, "Answer must be under 2000 characters"),
  evidence: z
    .array(z.string().max(300))
    .min(1, "At least 1 piece of trace evidence is required")
    .max(8, "No more than 8 evidence points"),
  learningPoint: z
    .string()
    .max(500)
    .optional(),
});

export type StepExplanationOutput = z.infer<typeof StepExplanationSchema>;
export type ExplainStepRequestInput = z.infer<typeof ExplainStepRequestSchema>;
export type TutorRequestInput = z.infer<typeof TutorRequestSchema>;
export type TutorResponseOutput = z.infer<typeof TutorResponseSchema>;
