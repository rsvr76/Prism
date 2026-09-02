import { create } from "zustand";
import { PrismTrace, PrismFrame, ExecutionStatus, ExecutionRecord } from "@/types/trace";
import {
  StepExplanation,
  ExplainStepRequest,
  TutorMessage,
  TutorResponse,
  TutorRequest,
  ComplexityAnalysis,
  ComplexityRequest,
} from "@/types/ai";
import { traceRunner } from "@/lib/execution/traceRunner";
import { DEFAULT_EXECUTION_LIMITS } from "@/lib/config/executionLimits";
import { buildBoundedTraceContext } from "@/lib/ai/traceContextBuilder";
import { buildBoundedTutorContext } from "@/lib/ai/tutorContextBuilder";
import { extractComplexityMetrics } from "@/lib/ai/complexityAnalyzer";

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
  // Active Code & Trace (bound to activeExecutionId)
  code: string;
  trace: PrismTrace | null;
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5x, 1x, 2x, 5x
  isRunning: boolean;
  status: ExecutionStatus;
  errorMessage: string | null;

  // Phase 6A: What-If Branching & Execution History
  executions: Record<string, ExecutionRecord>;
  executionIds: string[];
  activeExecutionId: string | null;
  isWhatIfOpen: boolean;
  whatIfDraftCode: string;
  whatIfParentStep: number;

  // AI Step Explainer state (Keyed by `${executionId}_step_${stepIndex}`)
  stepExplanations: Record<string, StepExplanation>;
  isExplaining: boolean;
  explanationError: string | null;

  // AI Tutor state (Isolated per active execution)
  tutorMessages: Record<string, TutorMessage[]>;
  isTutorResponding: boolean;
  tutorError: string | null;

  // Phase 6B: Big-O & Complexity Analysis (Keyed by `${executionId}`)
  complexityAnalyses: Record<string, ComplexityAnalysis>;
  isAnalyzingComplexity: boolean;
  complexityError: string | null;

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

  // Phase 6A What-If Actions
  openWhatIfModal: (stepIndex?: number) => void;
  closeWhatIfModal: () => void;
  setWhatIfDraftCode: (code: string) => void;
  createBranch: (branchCode?: string) => Promise<void>;
  switchExecution: (executionId: string) => void;

  // Phase 6B Complexity Actions
  analyzeComplexity: () => Promise<void>;
}

// Module-scoped execution epoch counter to prevent async race conditions
let activeExecutionEpoch = 0;
let branchCounter = 0;

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  code: DEFAULT_PYTHON_CODE,
  trace: null,
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 1,
  isRunning: false,
  status: "IDLE",
  errorMessage: null,

  // Phase 6A What-If initial state
  executions: {},
  executionIds: [],
  activeExecutionId: null,
  isWhatIfOpen: false,
  whatIfDraftCode: DEFAULT_PYTHON_CODE,
  whatIfParentStep: 0,

  stepExplanations: {},
  isExplaining: false,
  explanationError: null,

  tutorMessages: {},
  isTutorResponding: false,
  tutorError: null,

  // Phase 6B Complexity initial state
  complexityAnalyses: {},
  isAnalyzingComplexity: false,
  complexityError: null,

  setCode: (code: string) => set({ code }),

  runCode: async () => {
    // If already running, cancel previous execution and restart cleanly
    traceRunner.cancelExecution();

    const epoch = ++activeExecutionEpoch;
    const { code } = get();

    const executionId = `exec_orig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    set({
      isRunning: true,
      isPlaying: false,
      errorMessage: null,
      explanationError: null,
      tutorError: null,
      complexityError: null,
    });

    try {
      const trace = await traceRunner.runTrace(code, DEFAULT_EXECUTION_LIMITS);
      if (epoch !== activeExecutionEpoch) return; // Stale execution result discarded

      const record: ExecutionRecord = {
        executionId,
        type: "original",
        label: "Original",
        code,
        trace,
        createdAt: Date.now(),
      };

      set((state) => ({
        executions: {
          ...state.executions,
          [executionId]: record,
        },
        executionIds: state.executionIds.includes(executionId)
          ? state.executionIds
          : [...state.executionIds, executionId],
        activeExecutionId: executionId,
        code,
        trace,
        currentStep: 0,
        isRunning: false,
        status: trace.status,
        errorMessage: trace.errorMessage || null,
      }));
    } catch (err: any) {
      if (epoch !== activeExecutionEpoch) return;

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
    traceRunner.cancelExecution();
    ++activeExecutionEpoch;
    branchCounter = 0;
    set({
      code: DEFAULT_PYTHON_CODE,
      trace: null,
      currentStep: 0,
      isPlaying: false,
      isRunning: false,
      status: "IDLE",
      errorMessage: null,
      executions: {},
      executionIds: [],
      activeExecutionId: null,
      isWhatIfOpen: false,
      whatIfDraftCode: DEFAULT_PYTHON_CODE,
      whatIfParentStep: 0,
      stepExplanations: {},
      explanationError: null,
      tutorMessages: {},
      tutorError: null,
      complexityAnalyses: {},
      isAnalyzingComplexity: false,
      complexityError: null,
    });
  },

  getCurrentFrame: () => {
    const { trace, currentStep } = get();
    if (!trace || !trace.frames || trace.frames.length === 0) return null;
    return trace.frames[currentStep] || null;
  },

  explainCurrentStep: async () => {
    const { trace, currentStep, activeExecutionId, stepExplanations, isExplaining } = get();
    if (!trace || !trace.frames || isExplaining || !activeExecutionId) return;

    const cacheKey = `${activeExecutionId}_step_${currentStep}`;

    // Check if already cached
    if (stepExplanations[cacheKey]) {
      return;
    }

    const context = buildBoundedTraceContext(trace, currentStep);
    if (!context) {
      set({ explanationError: "Unable to generate trace context for this step." });
      return;
    }

    const activeTrace = trace;
    const activeStep = currentStep;
    const targetExecutionId = activeExecutionId;

    set({ isExplaining: true, explanationError: null });

    try {
      const payload: ExplainStepRequest = {
        stepIndex: activeStep,
        totalSteps: activeTrace.frames.length,
        sourceCode: activeTrace.code,
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

      // Invariant check: active execution must not have changed during API call
      if (get().activeExecutionId !== targetExecutionId || get().trace !== activeTrace) return;

      set((state) => ({
        isExplaining: false,
        stepExplanations: {
          ...state.stepExplanations,
          [cacheKey]: data.data,
        },
      }));
    } catch (err: any) {
      if (get().activeExecutionId !== targetExecutionId || get().trace !== activeTrace) return;
      set({
        isExplaining: false,
        explanationError: err?.message || "Failed to communicate with AI explanation service.",
      });
    }
  },

  sendTutorQuestion: async (question: string) => {
    const { trace, currentStep, activeExecutionId, tutorMessages, isTutorResponding } = get();
    if (!trace || !trace.frames || isTutorResponding || !question.trim() || !activeExecutionId) return;

    const activeTrace = trace;
    const activeStep = currentStep;
    const targetExecutionId = activeExecutionId;

    const userMessage: TutorMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: "user",
      text: question.trim(),
      timestamp: Date.now(),
      stepIndex: activeStep,
    };

    const currentHistory = tutorMessages[targetExecutionId] || [];

    // Construct raw history
    const rawHistory = currentHistory.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    const tutorPayload = buildBoundedTutorContext(
      activeTrace,
      activeStep,
      question.trim(),
      rawHistory
    );

    if (!tutorPayload) {
      set({ tutorError: "Unable to generate execution context for Tutor." });
      return;
    }

    // Append user message immediately under targetExecutionId
    set((state) => ({
      tutorMessages: {
        ...state.tutorMessages,
        [targetExecutionId]: [...(state.tutorMessages[targetExecutionId] || []), userMessage],
      },
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

      // Invariant check: active execution must not have changed during API call
      if (get().activeExecutionId !== targetExecutionId || get().trace !== activeTrace) return;

      const tutorResponse: TutorResponse = data.data;

      const assistantMessage: TutorMessage = {
        id: `tutor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        text: tutorResponse.answer,
        timestamp: Date.now(),
        stepIndex: activeStep,
        responseObj: tutorResponse,
      };

      set((state) => ({
        tutorMessages: {
          ...state.tutorMessages,
          [targetExecutionId]: [...(state.tutorMessages[targetExecutionId] || []), assistantMessage],
        },
        isTutorResponding: false,
      }));
    } catch (err: any) {
      if (get().activeExecutionId !== targetExecutionId || get().trace !== activeTrace) return;
      set({
        isTutorResponding: false,
        tutorError: err?.message || "Failed to communicate with AI Tutor.",
      });
    }
  },

  clearTutorMessages: () => {
    const { activeExecutionId } = get();
    if (!activeExecutionId) return;
    set((state) => ({
      tutorMessages: {
        ...state.tutorMessages,
        [activeExecutionId]: [],
      },
      tutorError: null,
    }));
  },

  // ─── Phase 6A: What-If Actions ──────────────────────────────────────────────

  openWhatIfModal: (stepIndex?: number) => {
    const { code, currentStep } = get();
    set({
      isWhatIfOpen: true,
      whatIfDraftCode: code,
      whatIfParentStep: stepIndex !== undefined ? stepIndex : currentStep,
    });
  },

  closeWhatIfModal: () => {
    set({ isWhatIfOpen: false });
  },

  setWhatIfDraftCode: (code: string) => {
    set({ whatIfDraftCode: code });
  },

  createBranch: async (branchCodeParam?: string) => {
    traceRunner.cancelExecution();
    const epoch = ++activeExecutionEpoch;
    const { whatIfDraftCode, whatIfParentStep, activeExecutionId } = get();
    const branchCode = branchCodeParam !== undefined ? branchCodeParam : whatIfDraftCode;

    branchCounter++;
    const branchId = `exec_branch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const branchLabel = `Branch ${branchCounter} (from Step ${whatIfParentStep + 1})`;

    set({
      isWhatIfOpen: false,
      isRunning: true,
      isPlaying: false,
      errorMessage: null,
      explanationError: null,
      tutorError: null,
      complexityError: null,
    });

    try {
      const trace = await traceRunner.runTrace(branchCode, DEFAULT_EXECUTION_LIMITS);
      if (epoch !== activeExecutionEpoch) return; // Stale execution result discarded

      const record: ExecutionRecord = {
        executionId: branchId,
        type: "branch",
        label: branchLabel,
        code: branchCode,
        trace,
        parentExecutionId: activeExecutionId || undefined,
        parentStepIndex: whatIfParentStep,
        createdAt: Date.now(),
      };

      set((state) => ({
        executions: {
          ...state.executions,
          [branchId]: record,
        },
        executionIds: state.executionIds.includes(branchId)
          ? state.executionIds
          : [...state.executionIds, branchId],
        activeExecutionId: branchId,
        code: branchCode,
        trace,
        currentStep: 0,
        isRunning: false,
        status: trace.status,
        errorMessage: trace.errorMessage || null,
      }));
    } catch (err: any) {
      if (epoch !== activeExecutionEpoch) return;

      // Create failed branch record so original remains completely usable
      const failedRecord: ExecutionRecord = {
        executionId: branchId,
        type: "branch",
        label: `${branchLabel} [Failed]`,
        code: branchCode,
        trace: null,
        parentExecutionId: activeExecutionId || undefined,
        parentStepIndex: whatIfParentStep,
        createdAt: Date.now(),
      };

      set((state) => ({
        executions: {
          ...state.executions,
          [branchId]: failedRecord,
        },
        executionIds: [...state.executionIds, branchId],
        activeExecutionId: branchId,
        isRunning: false,
        status: "RUNTIME_ERROR",
        errorMessage: err?.message || "Branch execution failed",
      }));
    }
  },

  switchExecution: (executionId: string) => {
    const { executions, activeExecutionId } = get();
    if (executionId === activeExecutionId) return;

    const targetRecord = executions[executionId];
    if (!targetRecord) return;

    ++activeExecutionEpoch; // Invalidate any in-flight requests from prior active execution

    set({
      activeExecutionId: executionId,
      code: targetRecord.code,
      trace: targetRecord.trace,
      currentStep: 0,
      isPlaying: false,
      status: targetRecord.trace?.status || "IDLE",
      errorMessage: targetRecord.trace?.errorMessage || null,
      explanationError: null,
      tutorError: null,
      complexityError: null,
    });
  },

  // ─── Phase 6B: Big-O Complexity Actions ─────────────────────────────────────

  analyzeComplexity: async () => {
    const { trace, activeExecutionId, complexityAnalyses, isAnalyzingComplexity } = get();
    if (!trace || !activeExecutionId || isAnalyzingComplexity) return;

    // Check if already cached for this execution
    if (complexityAnalyses[activeExecutionId]) {
      return;
    }

    const metrics = extractComplexityMetrics(trace);
    const targetExecutionId = activeExecutionId;
    const activeTrace = trace;

    set({ isAnalyzingComplexity: true, complexityError: null });

    try {
      const payload: ComplexityRequest = {
        executionId: targetExecutionId,
        sourceCode: activeTrace.code,
        metrics,
        detectedStructures: metrics.detectedStructures,
        status: activeTrace.status,
      };

      const res = await fetch("/api/ai/analyze-complexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze program complexity.");
      }

      // Invariant check: active execution must not have changed during API call
      if (get().activeExecutionId !== targetExecutionId || get().trace !== activeTrace) return;

      const fullAnalysis: ComplexityAnalysis = {
        ...data.data,
        evidenceItems: metrics.evidenceItems,
        metrics,
      };

      set((state) => ({
        isAnalyzingComplexity: false,
        complexityAnalyses: {
          ...state.complexityAnalyses,
          [targetExecutionId]: fullAnalysis,
        },
      }));
    } catch (err: any) {
      if (get().activeExecutionId !== targetExecutionId || get().trace !== activeTrace) return;
      set({
        isAnalyzingComplexity: false,
        complexityError: err?.message || "Failed to communicate with complexity analysis service.",
      });
    }
  },
}));
