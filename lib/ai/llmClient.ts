/**
 * Configurable LLM Client for Prism AI Subsystem
 * Supports Step Explainer, Interactive Tutor, and Phase 6B Complexity Analyzer.
 *
 * Supports Gemini REST, OpenAI-compatible REST, and Mock providers.
 * Enforces Zod validation on all structured responses.
 */

import { GROUNDING_SYSTEM_PROMPT, formatUserPrompt } from "./groundingPrompt";
import { TUTOR_SYSTEM_PROMPT, formatTutorUserPrompt } from "./tutorGroundingPrompt";
import { COMPLEXITY_SYSTEM_PROMPT, formatComplexityUserPrompt } from "./complexityPrompt";
import {
  StepExplanationSchema,
  StepExplanationOutput,
  TutorResponseSchema,
  TutorResponseOutput,
  ComplexityResponseSchema,
  ComplexityResponseOutput,
} from "./schemas";
import { BoundedTraceContext, ComplexityRequest } from "@/types/ai";

export interface LLMRequestOptions {
  context: BoundedTraceContext;
  sourceCode: string;
  provider?: string;
  model?: string;
  apiKey?: string;
}

export interface TutorLLMRequestOptions {
  context: BoundedTraceContext;
  sourceCode: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  question: string;
  provider?: string;
  model?: string;
  apiKey?: string;
}

export interface ComplexityLLMRequestOptions {
  request: ComplexityRequest;
  provider?: string;
  model?: string;
  apiKey?: string;
}

/**
 * Extract clean JSON string from potential markdown code fences.
 */
function extractJSONString(raw: string): string {
  const trimmed = raw.trim();
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = trimmed.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return trimmed;
}

/**
 * Mock generator for local testing, offline development, or when no API key is set.
 */
function generateMockExplanation(context: BoundedTraceContext): StepExplanationOutput {
  const line = context.line;
  const lineCode = context.activeLineSource ? `\`${context.activeLineSource}\`` : `line ${line}`;
  const diff = context.diff;

  const changes: string[] = [];

  for (const va of diff.variablesAdded) {
    changes.push(`Initialized \`${va.name}\` = \`${va.value}\``);
  }
  for (const vc of diff.variablesChanged) {
    changes.push(`Updated \`${vc.name}\`: \`${vc.from}\` → \`${vc.to}\``);
  }
  for (const pm of diff.pointersMoved) {
    changes.push(`Advanced pointer \`${pm.name}\` to \`${pm.to}\``);
  }
  for (const ho of diff.heapObjectsCreated) {
    changes.push(`Allocated heap object \`${ho}\``);
  }
  for (const hr of diff.heapReferencesChanged) {
    changes.push(`Redirected \`${hr.objectId}.${hr.pointer}\` → \`${hr.to}\``);
  }
  if (diff.stdoutAdded.length > 0) {
    changes.push(`Printed to stdout: "${diff.stdoutAdded.join(", ")}"`);
  }

  if (changes.length === 0) {
    changes.push(`Evaluated condition or statement on line ${line}`);
  }

  let dsInsight: string | undefined = undefined;
  if (context.detectedStructureType === "singly_linked_list") {
    dsInsight = "Linked list pointers were inspected or rewired in this frame.";
  } else if (context.detectedStructureType === "1d_array") {
    dsInsight = "Array elements or partition boundaries were active during this step.";
  } else if (context.detectedStructureType === "binary_tree") {
    dsInsight = "Binary tree node references (.left / .right) were accessed in this step.";
  }

  return {
    summary: `Executed ${lineCode} (Step ${context.stepIndex}).`,
    why: `The program advanced to line ${line} and evaluated the expression, producing the observed state mutations in local scope.`,
    changes: changes.slice(0, 5),
    dataStructureInsight: dsInsight,
    learningPoint: "Tracking state transitions step-by-step reveals how algorithmic invariants maintain structural correctness.",
  };
}

/**
 * Mock generator for interactive Tutor responses.
 */
function generateMockTutorResponse(
  context: BoundedTraceContext,
  question: string
): TutorResponseOutput {
  const line = context.line;
  const scopeKeys = Object.keys(context.currentScope);
  const scopeSummary =
    scopeKeys.length > 0
      ? scopeKeys.map((k) => `${k} = ${context.currentScope[k]}`).join(", ")
      : "No variables in scope";

  const lowerQ = question.toLowerCase();
  const isFutureQ =
    lowerQ.includes("future") ||
    lowerQ.includes("will happen") ||
    lowerQ.includes("next loop") ||
    lowerQ.includes("predict");

  const evidence: string[] = [
    `At Step ${context.stepIndex}, execution reached line ${line}.`,
    `Local scope variables: [${scopeSummary}].`,
  ];

  if (context.diff.variablesChanged.length > 0) {
    const vc = context.diff.variablesChanged[0];
    evidence.push(`Variable \`${vc.name}\` transitioned from \`${vc.from}\` to \`${vc.to}\`.`);
  }

  if (context.diff.heapReferencesChanged.length > 0) {
    const hr = context.diff.heapReferencesChanged[0];
    evidence.push(`Heap References updated: \`${hr.objectId}.${hr.pointer}\` → \`${hr.to}\`.`);
  }

  let answer: string;
  if (isFutureQ) {
    answer = `Prism only explains observed execution up to the current step (Step ${context.stepIndex}). It does not predict future iterations or simulate unexecuted code.`;
  } else {
    answer = `At Step ${context.stepIndex} (Line ${line}), the program evaluates the statement with active state: ${scopeSummary}. Regarding your question "${question}": the step performs an atomic operation advancing the algorithm toward its termination condition.`;
  }

  return {
    answer,
    evidence: evidence.slice(0, 4),
    learningPoint: "Observing variable state at each step verifies that the algorithm's loop or recursive invariant holds true.",
  };
}

/**
 * Mock generator for Phase 6B Complexity analysis.
 */
function generateMockComplexityAnalysis(
  request: ComplexityRequest
): ComplexityResponseOutput {
  const { metrics, detectedStructures } = request;
  const timeClass = metrics.observedTimeHeuristic;
  const spaceClass = metrics.observedSpaceHeuristic;

  const evidence: string[] = [
    `Total trace operations recorded: ${metrics.totalOperations} across ${metrics.totalSteps} steps.`,
    `Max loop nesting level: ${metrics.maxLoopNesting} (inner line repeated ${metrics.maxLineExecutionCount} times).`,
  ];

  if (metrics.isRecursive) {
    evidence.push(`Recursive execution observed with max call stack depth ${metrics.maxCallStackDepth} and recursion depth ${metrics.recursionDepth}.`);
  }

  if (metrics.peakHeapObjects > 0) {
    evidence.push(`Peak heap objects observed: ${metrics.peakHeapObjects} (${detectedStructures.join(", ") || "custom objects"}).`);
  }

  let whyExplanation = `The observed execution exhibits ${timeClass} time scaling based on loop nesting and repetition factors. `;
  if (timeClass === "O(1)") {
    whyExplanation += "The program executes a constant number of statements with no repeated loop iterations.";
  } else if (timeClass === "O(n)") {
    whyExplanation += "A single loop or linear chain of recursive calls iterates directly proportional to the input size.";
  } else if (timeClass === "O(n²)") {
    whyExplanation += "Nested loops repeat inner iterations quadratically relative to the outer loop count.";
  } else if (timeClass === "O(n³)") {
    whyExplanation += "Triple nested loops exhibit cubic scaling relative to the input bounds.";
  } else if (timeClass === "O(log n)") {
    whyExplanation += "The execution step count scales logarithmically with problem size (e.g. repeated halving).";
  } else {
    whyExplanation += "The trace exhibits complex execution patterns across branches.";
  }

  const caveats: string[] = [
    "This complexity classification is inferred empirically from the observed trace on this specific input.",
    "Dynamic execution trace measurement demonstrates empirical behavior and does not constitute a universal mathematical asymptotic proof for all inputs.",
  ];

  return {
    timeComplexity: timeClass,
    spaceComplexity: spaceClass,
    confidence: metrics.totalSteps > 3 ? "high" : "medium",
    summary: `Observed execution is consistent with ${timeClass} time and ${spaceClass} auxiliary space complexity.`,
    why: whyExplanation,
    evidence,
    caveats,
  };
}

/**
 * Direct HTTP call to Gemini API using generateContent with JSON mode.
 */
async function callGemini(
  systemInstruction: string,
  userPrompt: string,
  modelName: string = "gemini-2.5-flash",
  apiKey: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 1500,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty response candidate.");
  }

  return text;
}

/**
 * Direct HTTP call to OpenAI API using chat completions with JSON mode.
 */
async function callOpenAI(
  systemInstruction: string,
  userPrompt: string,
  modelName: string = "gpt-4o-mini",
  apiKey: string
): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";

  const body = {
    model: modelName,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1500,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("OpenAI returned empty response choice.");
  }

  return text;
}

/**
 * Main entrypoint for generating step explanations.
 */
export async function generateStepExplanation(
  options: LLMRequestOptions
): Promise<StepExplanationOutput> {
  const { context, sourceCode } = options;

  const provider =
    options.provider ||
    process.env.AI_PROVIDER ||
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "gemini" : "mock");

  const model =
    options.model ||
    process.env.AI_MODEL ||
    (provider === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini");

  const apiKey =
    options.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.AI_API_KEY ||
    "";

  if (provider === "mock" || !apiKey) {
    return generateMockExplanation(context);
  }

  const userPrompt = formatUserPrompt(context, sourceCode);
  let rawJsonText: string;

  if (provider === "gemini") {
    rawJsonText = await callGemini(GROUNDING_SYSTEM_PROMPT, userPrompt, model, apiKey);
  } else if (provider === "openai") {
    rawJsonText = await callOpenAI(GROUNDING_SYSTEM_PROMPT, userPrompt, model, apiKey);
  } else {
    return generateMockExplanation(context);
  }

  const cleanJson = extractJSONString(rawJsonText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    throw new Error(`Invalid JSON returned by LLM: ${(err as Error).message}`);
  }

  const validationResult = StepExplanationSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error(`LLM output failed Zod schema validation: ${errors}`);
  }

  return validationResult.data;
}

/**
 * Generate interactive Tutor response grounded in the execution trace.
 */
export async function generateTutorResponse(
  options: TutorLLMRequestOptions
): Promise<TutorResponseOutput> {
  const { context, sourceCode, history, question } = options;

  const provider =
    options.provider ||
    process.env.AI_PROVIDER ||
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "gemini" : "mock");

  const model =
    options.model ||
    process.env.AI_MODEL ||
    (provider === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini");

  const apiKey =
    options.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.AI_API_KEY ||
    "";

  if (provider === "mock" || !apiKey) {
    return generateMockTutorResponse(context, question);
  }

  const userPrompt = formatTutorUserPrompt(context, sourceCode, history, question);
  let rawJsonText: string;

  if (provider === "gemini") {
    rawJsonText = await callGemini(TUTOR_SYSTEM_PROMPT, userPrompt, model, apiKey);
  } else if (provider === "openai") {
    rawJsonText = await callOpenAI(TUTOR_SYSTEM_PROMPT, userPrompt, model, apiKey);
  } else {
    return generateMockTutorResponse(context, question);
  }

  const cleanJson = extractJSONString(rawJsonText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    throw new Error(`Invalid JSON returned by LLM: ${(err as Error).message}`);
  }

  const validationResult = TutorResponseSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error(`LLM Tutor output failed Zod schema validation: ${errors}`);
  }

  return validationResult.data;
}

/**
 * Generate Phase 6B Complexity analysis grounded in execution metrics.
 */
export async function generateComplexityAnalysis(
  options: ComplexityLLMRequestOptions
): Promise<ComplexityResponseOutput> {
  const { request } = options;

  const provider =
    options.provider ||
    process.env.AI_PROVIDER ||
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "gemini" : "mock");

  const model =
    options.model ||
    process.env.AI_MODEL ||
    (provider === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini");

  const apiKey =
    options.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.AI_API_KEY ||
    "";

  if (provider === "mock" || !apiKey) {
    return generateMockComplexityAnalysis(request);
  }

  const userPrompt = formatComplexityUserPrompt(request);
  let rawJsonText: string;

  if (provider === "gemini") {
    rawJsonText = await callGemini(COMPLEXITY_SYSTEM_PROMPT, userPrompt, model, apiKey);
  } else if (provider === "openai") {
    rawJsonText = await callOpenAI(COMPLEXITY_SYSTEM_PROMPT, userPrompt, model, apiKey);
  } else {
    return generateMockComplexityAnalysis(request);
  }

  const cleanJson = extractJSONString(rawJsonText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    throw new Error(`Invalid JSON returned by LLM: ${(err as Error).message}`);
  }

  const validationResult = ComplexityResponseSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error(`LLM Complexity output failed Zod schema validation: ${errors}`);
  }

  return validationResult.data;
}
