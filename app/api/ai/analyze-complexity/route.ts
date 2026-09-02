import { NextRequest, NextResponse } from "next/server";
import { ComplexityRequestSchema } from "@/lib/ai/schemas";
import { generateComplexityAnalysis } from "@/lib/ai/llmClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Request Validation
    const validationResult = ComplexityRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return NextResponse.json(
        { success: false, error: `Invalid complexity request payload: ${errorMsg}` },
        { status: 400 }
      );
    }

    // 2. Generate Complexity Analysis via LLM Client (or Mock Fallback)
    const result = await generateComplexityAnalysis({
      request: validationResult.data,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[API /api/ai/analyze-complexity Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error analyzing complexity.",
      },
      { status: 500 }
    );
  }
}
