import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    // Validate inputs
    const body = await req.json();
    const { customer_id, content, type, direction } = body as {
      customer_id?: string;
      content?: string;
      type?: 'email' | 'chat' | 'call';
      direction?: 'inbound' | 'outbound';
    };

    if (!customer_id || !content || !type || !direction) {
      return NextResponse.json(
        { error: "Missing required fields: customer_id, content, type, direction" },
        { status: 400 }
      );
    }

    // ── Call Gemini to analyze the interaction ───────────────────────────
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config: {
            systemInstruction: `You are an AI CRM analyst processing inbound B2C customer communications.
Analyze the following message and extract:
1. "ai_summary": A 1-2 sentence concise summary of the message.
2. "sentiment_score": An integer from 0 (extremely angry/negative) to 100 (extremely happy/positive).
3. "tags_to_apply": An array of strings representing tags to apply to the customer profile based on this interaction (e.g. ["Complaint", "Churn Risk", "VIP Priority"]).
4. "draft_reply": If the message is a complaint or question, draft a brief, personalized reply.

Return ONLY valid JSON.`,
            responseMimeType: "application/json",
            temperature: 0.2,
        }
    });

    const aiResponseText = response.text || "{}";
    let aiResult: {
      ai_summary?: string;
      sentiment_score?: number;
      tags_to_apply?: string[];
      draft_reply?: string;
    } = {};

    try {
        aiResult = JSON.parse(aiResponseText);
    } catch {
        console.error("Failed to parse Gemini JSON output:", aiResponseText);
    }

    // Insert the interaction log
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Supabase client fails to infer generic tables without CLI regenerator
    const { error: intError } = await (supabaseAdmin
      .from('interactions') as any)
      .insert({
        customer_id,
        direction,
        type,
        content,
        sentiment_score: aiResult.sentiment_score ?? null,
        ai_summary: aiResult.ai_summary ?? null
      });

    if (intError) {
      console.error("Supabase insert error:", intError);
      return NextResponse.json({ error: "Failed to log interaction" }, { status: 500 });
    }

    // We can also handle tags here if needed in the future

    return NextResponse.json({
      success: true,
      analysis: aiResult
    });
  } catch (error) {
    console.error("[/api/ingest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
