import { create } from "zustand";
import { PrismTrace, PrismFrame, ExecutionStatus } from "@/types/trace";
import { StepExplanation, ExplainStepRequest, TutorMessage, TutorResponse, TutorRequest } from "@/types/ai";
import { traceRunner } from "@/lib/execution/traceRunner";
import { DEFAULT_EXECUTION_LIMITS } from "@/lib/config/executionLimits";
import { buildBoundedTraceContext } from "@/lib/ai/traceContextBuilder";
import { buildBoundedTutorContext } from "@/lib/ai/tutorContextBuilder";

export const DEFAULT_PYTHON_CODE = `# Prism Python Sandbox
# Step through execution and watch variables, stack frames, and heap references mutate.

class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

# Build linked list: 10 -> 20 -> 30
head = Node(10)
head.next = Node(20)
head.next.next = Node(30)

# Traverse and sum
total = 0
curr = head
while curr:
    total += curr.val
    curr = curr.next

print("Total sum:", total)
`;

interface ExecutionStore {
  code: string;
  trace: PrismTrace | null;
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5x, 1x, 2x, 5x
  isRunning: boolean;
  status: ExecutionStatus;
  errorMessage: string | null;

  // AI Step Explainer state
  stepExplanations: Record<number, StepExplanation>;
  isExplaining: boolean;
  explanationError: string | null;

  // AI Tutor state (Phase 5)
  tutorMessages: TutorMessage[];
  isTutorResponding: boolean;
  tutorError: string | null;

  // Actions
  setCode: (code: string) => void;
  runCode: () => Promise<void>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  reset: () => void;
  getCurrentFrame: () => PrismFrame | null;
  explainCurrentStep: () => Promise<void>;
  sendTutorQuestion: (question: string) => Promise<void>;
  clearTutorMessages: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  code: DEFAULT_PYTHON_CODE,
  trace: null,
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 1,
  isRunning: false,
  status: "IDLE",
  errorMessage: null,

  stepExplanations: {},
  isExplaining: false,
  explanationError: null,

  tutorMessages: [],
  isTutorResponding: false,
  tutorError: null,

  setCode: (code: string) => set({ code }),

  runCode: async () => {
    const { code } = get();
    set({
      isRunning: true,
      isPlaying: false,
      errorMessage: null,
      stepExplanations: {},
      explanationError: null,
      tutorMessages: [],
      tutorError: null,
    });

    try {
      const trace = await traceRunner.runTrace(code, DEFAULT_EXECUTION_LIMITS);
      set({
        trace,
        currentStep: 0,
        isRunning: false,
        status: trace.status,
        errorMessage: trace.errorMessage || null,
        stepExplanations: {},
        tutorMessages: [],
        tutorError: null,
      });
    } catch (err: any) {
      set({
        isRunning: false,
        status: "RUNTIME_ERROR",
        errorMessage: err?.message || "Execution failed",
      });
    }
  },

  setStep: (step: number) => {
    const { trace } = get();
    if (!trace || trace.frames.length === 0) return;
    const clamped = Math.max(0, Math.min(step, trace.frames.length - 1));
    set({ currentStep: clamped });
  },

  nextStep: () => {
    const { currentStep, trace } = get();
    if (!trace || currentStep >= trace.frames.length - 1) return;
    set({ currentStep: currentStep + 1 });
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep <= 0) return;
    set({ currentStep: currentStep - 1 });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),

  reset: () => {
    set({
      trace: null,
      currentStep: 0,
      isPlaying: false,
      status: "IDLE",
      errorMessage: null,
      stepExplanations: {},
      explanationError: null,
      tutorMessages: [],
      tutorError: null,
    });
  },

  getCurrentFrame: () => {
    const { trace, currentStep } = get();
    if (!trace || !trace.frames || trace.frames.length === 0) return null;
    return trace.frames[currentStep] || null;
  },

  explainCurrentStep: async () => {
    const { trace, currentStep, stepExplanations, isExplaining } = get();
    if (!trace || !trace.frames || isExplaining) return;

    // Check if already cached
    if (stepExplanations[currentStep]) {
      return;
    }

    const context = buildBoundedTraceContext(trace, currentStep);
    if (!context) {
      set({ explanationError: "Unable to generate trace context for this step." });
      return;
    }

    set({ isExplaining: true, explanationError: null });

    try {
      const payload: ExplainStepRequest = {
        stepIndex: currentStep,
        totalSteps: trace.frames.length,
        sourceCode: trace.code,
        currentLineCode: context.activeLineSource,
        context,
      };

      const res = await fetch("/api/ai/explain-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate explanation.");
      }

      set((state) => ({
        isExplaining: false,
        stepExplanations: {
          ...state.stepExplanations,
          [currentStep]: data.data,
        },
      }));
    } catch (err: any) {
      set({
        isExplaining: false,
        explanationError: err?.message || "Failed to communicate with AI explanation service.",
      });
    }
  },

  sendTutorQuestion: async (question: string) => {
    const { trace, currentStep, tutorMessages, isTutorResponding } = get();
    if (!trace || !trace.frames || isTutorResponding || !question.trim()) return;

    const userMessage: TutorMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: "user",
      text: question.trim(),
      timestamp: Date.now(),
      stepIndex: currentStep,
    };

    // Construct raw history
    const rawHistory = tutorMessages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    const tutorPayload = buildBoundedTutorContext(
      trace,
      currentStep,
      question.trim(),
      rawHistory
    );

    if (!tutorPayload) {
      set({ tutorError: "Unable to generate execution context for Tutor." });
      return;
    }

    // Append user message immediately
    set((state) => ({
      tutorMessages: [...state.tutorMessages, userMessage],
      isTutorResponding: true,
      tutorError: null,
    }));

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tutorPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get response from AI Tutor.");
      }

      const tutorResponse: TutorResponse = data.data;

      const assistantMessage: TutorMessage = {
        id: `tutor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        text: tutorResponse.answer,
        timestamp: Date.now(),
        stepIndex: currentStep,
        responseObj: tutorResponse,
      };

      set((state) => ({
        tutorMessages: [...state.tutorMessages, assistantMessage],
        isTutorResponding: false,
      }));
    } catch (err: any) {
      set({
        isTutorResponding: false,
        tutorError: err?.message || "Failed to communicate with AI Tutor.",
      });
    }
  },

  clearTutorMessages: () => {
    set({ tutorMessages: [], tutorError: null });
  },
}));
