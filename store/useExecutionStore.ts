import { create } from 'zustand';
import { PrismTrace, PrismFrame, ExecutionStatus } from '@/types/trace';
import { traceRunner } from '@/lib/execution/traceRunner';
import { DEFAULT_EXECUTION_LIMITS } from '@/lib/config/executionLimits';

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
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  code: DEFAULT_PYTHON_CODE,
  trace: null,
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 1,
  isRunning: false,
  status: 'IDLE',
  errorMessage: null,

  setCode: (code: string) => set({ code }),

  runCode: async () => {
    const { code } = get();
    set({ isRunning: true, isPlaying: false, errorMessage: null });

    try {
      const trace = await traceRunner.runTrace(code, DEFAULT_EXECUTION_LIMITS);
      set({
        trace,
        currentStep: 0,
        isRunning: false,
        status: trace.status,
        errorMessage: trace.errorMessage || null,
      });
    } catch (err: any) {
      set({
        isRunning: false,
        status: 'RUNTIME_ERROR',
        errorMessage: err?.message || 'Execution failed',
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
      status: 'IDLE',
      errorMessage: null,
    });
  },

  getCurrentFrame: () => {
    const { trace, currentStep } = get();
    if (!trace || !trace.frames || trace.frames.length === 0) return null;
    return trace.frames[currentStep] || null;
  },
}));
