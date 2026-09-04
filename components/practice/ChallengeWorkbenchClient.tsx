"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Target,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  RotateCcw,
  Sparkles,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { Challenge, ChallengeEvaluationResult, ChallengeHint } from "@/types/challenge";
import { evaluateChallenge } from "@/lib/practice/challengeEvaluator";
import { recordAttempt, getChallengeAttempt } from "@/lib/practice/challengeProgressManager";
import { logActivity } from "@/lib/progress/studentProgress";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40",
  Intermediate: "text-amber-400 border-amber-500/30 bg-amber-950/40",
  Advanced: "text-rose-400 border-rose-500/30 bg-rose-950/40",
};

const TYPE_LABELS: Record<string, string> = {
  "code-completion": "Code Completion",
  "debugging": "Debugging",
  "trace-prediction": "Trace Prediction",
  "complexity": "Complexity",
};

interface ChallengeWorkbenchClientProps {
  challenge: Challenge;
}

export default function ChallengeWorkbenchClient({ challenge }: ChallengeWorkbenchClientProps) {
  const [code, setCode] = useState(challenge.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ChallengeEvaluationResult | null>(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [revealedHints, setRevealedHints] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<{ explanation: string; nextSteps: string[] } | null>(null);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const attemptRef = useRef(getChallengeAttempt(challenge.id));
  const isPassed = result?.passed === true || attemptRef.current?.passed === true;

  // For trace-prediction and complexity challenges we need the answer before running
  const needsAnswerFirst = challenge.type === "trace-prediction" || challenge.type === "complexity";

  const handleSubmit = useCallback(async () => {
    if (isRunning) return;
    if (needsAnswerFirst && !studentAnswer.trim()) return;

    setIsRunning(true);
    setResult(null);
    setAiFeedback(null);

    try {
      // Build the code to run:
      // For code challenges with a single test case, append the inputCode from tc1.
      let codeToRun = code;
      if (
        (challenge.type === "code-completion" || challenge.type === "debugging") &&
        challenge.testCases &&
        challenge.testCases.length > 0
      ) {
        codeToRun = code.trimEnd() + "\n" + challenge.testCases[0].inputCode;
      }

      // Run through the existing execution pipeline via the Pyodide worker.
      // We call the server-side execution indirectly through the existing useExecutionStore
      // by posting to window. Instead, we use the existing worker infrastructure via a
      // lightweight fetch of a traced run. For the challenge page we use a simple
      // fetch-based approach that calls the execution via a direct Pyodide run.
      //
      // IMPORTANT: We do NOT create a second execution engine.
      // We use the existing tracer mechanism via a direct execution in the browser context.
      // In this client component context we execute via Pyodide and sys.settrace
      // exactly as the main workbench does, but we read the result directly.
      //
      // For simplicity in this component, we run the code through the
      // existing tracer Worker URL (same as TraceRunnerService).

      const { runCodeDirect } = await import("@/lib/practice/directRunner");
      const { trace, status, error } = await runCodeDirect(codeToRun);

      const evalResult = evaluateChallenge(
        challenge,
        trace,
        status,
        error,
        studentAnswer.trim() || undefined,
        trace ? undefined : undefined  // complexity class from trace metrics if available
      );

      setResult(evalResult);
      recordAttempt(challenge.id, evalResult.passed, code, studentAnswer);
      attemptRef.current = getChallengeAttempt(challenge.id);
      logActivity({
        type: evalResult.passed ? 'challenge-passed' : 'challenge-attempted',
        title: challenge.title,
        subtitle: evalResult.passed
          ? `Passed · ${challenge.topic}`
          : `Attempted · ${challenge.difficulty}`,
        href: `/practice/${challenge.slug}`,
        metadata: { topic: challenge.topic },
      });

      // Fetch AI feedback in background (non-blocking)
      fetchAIFeedback(evalResult);
    } catch (err: any) {
      setResult({
        status: "error",
        passed: false,
        feedback: `Unexpected error: ${err?.message || "Unknown error"}`,
        executionStatus: "ERROR",
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, challenge, studentAnswer, isRunning, needsAnswerFirst]);

  const fetchAIFeedback = async (evalResult: ChallengeEvaluationResult) => {
    setIsFetchingAI(true);
    try {
      const res = await fetch("/api/ai/challenge-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          challengeType: challenge.type,
          passed: evalResult.passed,
          deterministicFeedback: evalResult.feedback,
          executionStatus: evalResult.executionStatus,
          errorMessage: evalResult.errorMessage,
          testResults: evalResult.testResults,
          traceObservation: evalResult.traceObservation,
          studentAnswer: studentAnswer || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.explanation) setAiFeedback(data);
      }
    } catch {
      // AI feedback is optional; silently ignore
    } finally {
      setIsFetchingAI(false);
    }
  };

  const handleRevealHint = () => {
    if (revealedHints < challenge.hints.length) {
      setRevealedHints((n) => n + 1);
    }
  };

  const handleReset = () => {
    setCode(challenge.starterCode);
    setResult(null);
    setAiFeedback(null);
    setStudentAnswer("");
  };

  const sortedHints: ChallengeHint[] = [...challenge.hints].sort((a, b) => a.level - b.level);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Header */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 px-4 flex items-center gap-4 z-20 shrink-0">
        <Link
          href="/practice"
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          aria-label="Back to Practice"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Practice</span>
        </Link>

        <div className="flex-1 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-200 truncate">{challenge.title}</span>
          <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${DIFFICULTY_COLORS[challenge.difficulty] || "text-slate-400"}`}>
            {challenge.difficulty}
          </span>
          <span className="hidden sm:inline text-xs text-slate-500">{TYPE_LABELS[challenge.type]}</span>
        </div>

        {challenge.lessonId && (
          <Link
            href={`/paths/${challenge.learningPathId}/${challenge.lessonId}`}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Back to Lesson</span>
          </Link>
        )}

        {isPassed && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Passed
          </span>
        )}
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Instructions panel */}
        <aside className="lg:w-96 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto bg-slate-950 p-6">
          <h2 className="text-base font-semibold text-white mb-3">{challenge.title}</h2>

          {/* Instructions */}
          <div className="prose prose-invert prose-sm max-w-none mb-5">
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {challenge.instructions.replace(/^#+\s+[^\n]+\n*/, "").trim()}
            </div>
          </div>

          {/* Trace-prediction or complexity answer input */}
          {challenge.type === "trace-prediction" && challenge.traceQuestion && (
            <div className="mb-5 p-4 rounded-lg border border-violet-500/30 bg-violet-950/30">
              <p className="text-xs font-semibold text-violet-300 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Your Prediction
              </p>
              <p className="text-sm text-slate-300 mb-3">{challenge.traceQuestion}</p>
              {challenge.traceAnswerOptions ? (
                <div className="flex flex-wrap gap-2">
                  {challenge.traceAnswerOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStudentAnswer(opt)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-all ${
                        studentAnswer === opt
                          ? "bg-violet-600 border-violet-400 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-300 hover:border-violet-500/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Your answer…"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-violet-500/60"
                />
              )}
            </div>
          )}

          {challenge.type === "complexity" && challenge.complexityQuestion && (
            <div className="mb-5 p-4 rounded-lg border border-amber-500/30 bg-amber-950/30">
              <p className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Complexity Question
              </p>
              <p className="text-sm text-slate-300 mb-3">{challenge.complexityQuestion}</p>
              <div className="flex flex-wrap gap-2">
                {["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(n^3)", "O(2^n)"].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setStudentAnswer(cls)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-all ${
                      studentAnswer === cls
                        ? "bg-amber-600 border-amber-400 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/50"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {challenge.hints.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Hints
                </span>
                {revealedHints < challenge.hints.length && (
                  <button
                    onClick={handleRevealHint}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Reveal hint {revealedHints + 1} →
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {sortedHints.slice(0, revealedHints).map((hint) => (
                  <div key={hint.level} className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200">
                    <span className="font-semibold text-amber-400">Hint {hint.level}: </span>
                    {hint.text}
                  </div>
                ))}
                {revealedHints === 0 && (
                  <p className="text-xs text-slate-500 italic">Click &quot;Reveal hint&quot; for a nudge.</p>
                )}
              </div>
            </div>
          )}

          {/* Solution explanation (only after passing or explicit reveal) */}
          {(isPassed || showSolution) && (
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
              <p className="text-xs font-semibold text-emerald-400 mb-1.5">Solution Explanation</p>
              <p className="text-xs text-slate-300">{challenge.solutionExplanation}</p>
            </div>
          )}
          {!isPassed && !showSolution && revealedHints === challenge.hints.length && challenge.hints.length > 0 && (
            <button
              onClick={() => setShowSolution(true)}
              className="text-xs text-slate-500 hover:text-slate-300 underline mt-1 transition-colors"
            >
              Show solution explanation
            </button>
          )}
        </aside>

        {/* Right: Editor + Result */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code editor */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <span className="text-xs text-slate-400 font-mono">Python 3</span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                title="Reset to starter code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <MonacoEditor
                height="100%"
                language="python"
                value={code}
                onChange={(v) => setCode(v || "")}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                }}
              />
            </div>
          </div>

          {/* Submit bar */}
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3 shrink-0">
            <button
              onClick={handleSubmit}
              disabled={isRunning || (needsAnswerFirst && !studentAnswer.trim())}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {isRunning ? "Running…" : "Run & Submit"}
            </button>
            {needsAnswerFirst && !studentAnswer && (
              <span className="text-xs text-amber-400">Select your answer above first.</span>
            )}
          </div>

          {/* Result panel */}
          {result && (
            <div className="border-t border-slate-800 bg-slate-950/60 p-4 max-h-72 overflow-y-auto shrink-0">
              {/* Status badge */}
              <div className="flex items-center gap-2 mb-3">
                {result.passed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Challenge Passed!</span>
                  </>
                ) : result.status === "error" ? (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span className="text-sm font-semibold text-rose-400">Execution Error</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">Not Quite — Try Again</span>
                  </>
                )}
              </div>

              {/* Deterministic feedback */}
              <p className="text-sm text-slate-300 mb-3 whitespace-pre-wrap">{result.feedback}</p>

              {/* Test results */}
              {result.testResults && result.testResults.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {result.testResults.map((tr) => (
                    <div key={tr.testCaseId} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded ${tr.passed ? "bg-emerald-950/40 text-emerald-300" : "bg-rose-950/40 text-rose-300"}`}>
                      {tr.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span className="font-medium">{tr.description}</span>
                      {!tr.passed && (
                        <span className="text-slate-400 ml-auto font-mono text-[10px]">
                          expected: {tr.expected} | got: {tr.actual}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Feedback */}
              {isFetchingAI && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Getting AI explanation…
                </div>
              )}

              {aiFeedback && (
                <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-700/60">
                  <p className="text-xs font-semibold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Tutor Explanation
                  </p>
                  <p className="text-xs text-slate-300 mb-2">{aiFeedback.explanation}</p>
                  {aiFeedback.nextSteps.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Next steps:</p>
                      <ul className="space-y-0.5">
                        {aiFeedback.nextSteps.map((step, i) => (
                          <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                            <span className="text-cyan-500 shrink-0">→</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
