import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "openai/gpt-oss-120b";
const AI_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MAX_SOURCE_CHARS = 30000;
const MAX_COMPLETION_TOKENS = 16000;
const QUESTION_COUNT = 10;
const OPTION_COUNT = 4;

const QUESTIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options", "correctIndex", "explanation"],
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctIndex: { type: "integer" },
          explanation: { type: "string" },
        },
      },
    },
  },
};

interface PracticeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseQuestions(payload: unknown): PracticeQuestion[] {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { questions?: unknown }).questions)) {
    return [];
  }
  const questions: PracticeQuestion[] = [];
  for (const raw of (payload as { questions: unknown[] }).questions) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const options = Array.isArray(item.options) ? item.options : [];
    const correctIndex = item.correctIndex;
    if (
      typeof item.question !== "string" ||
      typeof item.explanation !== "string" ||
      options.length !== OPTION_COUNT ||
      !options.every((option) => typeof option === "string") ||
      !Number.isInteger(correctIndex) ||
      (correctIndex as number) < 0 ||
      (correctIndex as number) >= OPTION_COUNT
    ) {
      continue;
    }
    questions.push({
      question: item.question,
      options: options as string[],
      correctIndex: correctIndex as number,
      explanation: item.explanation,
    });
  }
  return questions;
}

async function generateQuestions(apiKey: string, source: string): Promise<PracticeQuestion[]> {
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; StudyNotesApp/1.0)",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      response_format: {
        type: "json_schema",
        json_schema: { name: "practice_test", strict: true, schema: QUESTIONS_SCHEMA },
      },
      messages: [
        {
          role: "system",
          content:
            "You write practice test questions that help a student check whether they understand their study material. " +
            "Use ONLY the source text provided. Never ask about facts that are not in the source. " +
            "Each question has exactly four options, exactly one correct, and plausible distractors. " +
            "Respond with a JSON object only.",
        },
        {
          role: "user",
          content:
            `Source text:\n"""\n${source}\n"""\n\n` +
            `Write ${QUESTION_COUNT} multiple-choice questions covering the most important ideas in the source. ` +
            "Return JSON in this shape: " +
            '{"questions":[{"question":string,"options":[string,string,string,string],' +
            '"correctIndex":integer (0-3),"explanation":string}]}. ' +
            "The explanation briefly says why the correct option is right.",
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI service returned status ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI response was empty");

  const questions = parseQuestions(JSON.parse(content));
  if (questions.length === 0) throw new Error("AI response had an unexpected shape");
  return questions;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const body = await req.json();
    const documentId = typeof body?.documentId === "string" ? body.documentId : null;
    if (!documentId) {
      return json({ error: "Invalid request." }, 400);
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return json({ error: "AI_NOT_CONFIGURED" }, 503);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, content")
      .eq("id", documentId)
      .maybeSingle();
    if (documentError) throw documentError;
    if (!document) return json({ error: "Document not found." }, 404);

    const source = String(document.content ?? "").slice(0, MAX_SOURCE_CHARS);
    if (!source.trim()) {
      return json({ error: "This document has no text to write questions from." }, 422);
    }

    const questions = await generateQuestions(apiKey, source);

    const { error: saveError } = await supabase.from("practice_tests").upsert(
      { document_id: documentId, questions },
      { onConflict: "document_id" },
    );
    if (saveError) throw saveError;

    return json({ questions });
  } catch (err) {
    console.error("generate-practice-test failed", err);
    return json({ error: "The practice test could not be generated. Please try again." }, 500);
  }
});
