/**
 * Configurable LLM Client for Prism AI Subsystem
 *
 * Supports Gemini REST, OpenAI-compatible REST, and Mock providers.
 * Enforces Zod validation on all structured responses.
 */

import { GROUNDING_SYSTEM_PROMPT, formatUserPrompt } from "./groundingPrompt";
import { StepExplanationSchema, StepExplanationOutput } from "./schemas";
import { BoundedTraceContext } from "@/types/ai";

export interface LLMRequestOptions {
  context: BoundedTraceContext;
  sourceCode: string;
  provider?: string;
  model?: string;
  apiKey?: string;
}

/**
 * Extract clean JSON string from potential markdown code fences.
 */
function extractJSONString(raw: string): string {
  const trimmed = raw.trim();
  // Check for ```json ... ```
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = trimmed.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return trimmed;
}

/**
 * Mock generator for local testing, offline development, or when no API key is set.
 * Returns deterministic grounded explanations derived strictly from the trace context.
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
 * Call Google Gemini REST API.
 */
async function callGemini(
  prompt: string,
  modelName: string,
  apiKey: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${GROUNDING_SYSTEM_PROMPT}\n\n${prompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response received from Gemini API");
  }

  return text;
}

/**
 * Call OpenAI-compatible REST API.
 */
async function callOpenAI(
  prompt: string,
  modelName: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GROUNDING_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response received from OpenAI API");
  }

  return text;
}

/**
 * Main service entrypoint to generate a grounded step explanation.
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

  // Use mock if provider is explicitly mock or if no key is configured
  if (provider === "mock" || !apiKey) {
    return generateMockExplanation(context);
  }

  const userPrompt = formatUserPrompt(context, sourceCode);
  let rawJsonText: string;

  if (provider === "gemini") {
    rawJsonText = await callGemini(userPrompt, model, apiKey);
  } else if (provider === "openai") {
    rawJsonText = await callOpenAI(userPrompt, model, apiKey);
  } else {
    return generateMockExplanation(context);
  }

  // Parse and Zod validate
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
