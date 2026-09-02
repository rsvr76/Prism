/**
 * Server-Side Next.js Route Handler: POST /api/ai/tutor
 * Interactive AI Tutor Q&A grounded strictly in the Prism execution trace.
 */

import { NextResponse } from "next/server";
import { TutorRequestSchema } from "@/lib/ai/schemas";
import { generateTutorResponse } from "@/lib/ai/llmClient";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON in request body." },
        { status: 400 }
      );
    }

    // 1. Zod validate incoming request
    const parseResult = TutorRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { success: false, error: `Invalid request payload: ${errorMsg}` },
        { status: 400 }
      );
    }

    const { context, sourceCode, history, question } = parseResult.data;

    // 2. Call LLM provider with grounding context
    const tutorResponse = await generateTutorResponse({
      context,
      sourceCode,
      history,
      question,
    });

    return NextResponse.json({
      success: true,
      data: tutorResponse,
    });
  } catch (error: any) {
    console.error("Prism AI Tutor API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred while generating the tutor response.",
      },
      { status: 500 }
    );
  }
}
