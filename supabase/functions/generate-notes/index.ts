import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "openai/gpt-oss-120b";
const AI_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MAX_SECTION_CHARS = 9000;
const MAX_SECTIONS = 40;
const MAX_COMPLETION_TOKENS = 16000;
const MARKER_PATTERN = /--- (Page|Slide) (\d+) ---/g;

const TOPICS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["topics"],
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "explanation", "keyPoints", "terms", "example"],
        properties: {
          heading: { type: "string" },
          explanation: { type: "string" },
          keyPoints: { type: "array", items: { type: "string" } },
          terms: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["term", "meaning"],
              properties: { term: { type: "string" }, meaning: { type: "string" } },
            },
          },
          example: { type: ["string", "null"] },
        },
      },
    },
  },
};

interface SourceSection {
  label: string;
  text: string;
}

interface StudyTerm {
  term: string;
  meaning: string;
}

interface StudyTopic {
  heading: string;
  explanation: string;
  keyPoints: string[];
  terms: StudyTerm[];
  example: string | null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function labelFor(text: string, fallbackIndex: number): string {
  const numbers = [...text.matchAll(MARKER_PATTERN)].map((match) => ({ kind: match[1], n: Number(match[2]) }));
  if (numbers.length === 0) return `Section ${fallbackIndex + 1}`;
  const kind = numbers[0].kind === "Slide" ? "Slides" : "Pages";
  const first = numbers[0].n;
  const last = numbers[numbers.length - 1].n;
  return first === last ? `${kind.slice(0, -1)} ${first}` : `${kind} ${first}-${last}`;
}

function splitIntoSections(content: string): SourceSection[] {
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const pieces: string[] = [];
  for (const paragraph of paragraphs) {
    for (let start = 0; start < paragraph.length; start += MAX_SECTION_CHARS) {
      pieces.push(paragraph.slice(start, start + MAX_SECTION_CHARS));
    }
  }

  const grouped: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length + 2 > MAX_SECTION_CHARS) {
      grouped.push(current);
      current = piece;
    } else {
      current = current ? `${current}\n\n${piece}` : piece;
    }
  }
  if (current) grouped.push(current);

  return grouped.map((text, index) => ({ label: labelFor(text, index), text }));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseTopics(payload: unknown): StudyTopic[] | null {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { topics?: unknown }).topics)) {
    return null;
  }
  const topics: StudyTopic[] = [];
  for (const raw of (payload as { topics: unknown[] }).topics) {
    if (!raw || typeof raw !== "object") return null;
    const topic = raw as Record<string, unknown>;
    const terms = Array.isArray(topic.terms)
      ? topic.terms.filter(
        (t): t is StudyTerm =>
          !!t && typeof t === "object" && typeof (t as StudyTerm).term === "string" &&
          typeof (t as StudyTerm).meaning === "string",
      )
      : [];
    if (typeof topic.heading !== "string" || typeof topic.explanation !== "string" || !isStringArray(topic.keyPoints)) {
      return null;
    }
    topics.push({
      heading: topic.heading,
      explanation: topic.explanation,
      keyPoints: topic.keyPoints,
      terms,
      example: typeof topic.example === "string" && topic.example.trim() ? topic.example : null,
    });
  }
  return topics;
}

async function generateTopics(apiKey: string, section: SourceSection): Promise<StudyTopic[]> {
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; StudyNotesApp/1.0)",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      response_format: {
        type: "json_schema",
        json_schema: { name: "study_notes", strict: true, schema: TOPICS_SCHEMA },
      },
      messages: [
        {
          role: "system",
          content:
            "You are an expert teacher explaining study material to a student who is learning the topic for the first time. " +
            "Use ONLY the source text provided. Never invent definitions, formulas, dates or facts. " +
            "Explain step by step in simple language, break long sentences into short statements, and explain technical terms. " +
            "Cover every topic, definition, formula and important detail in the source; do not skip anything. " +
            "If the source is unclear or incomplete, say so instead of guessing. " +
            "Respond with a JSON object only.",
        },
        {
          role: "user",
          content:
            `Source text (${section.label}):\n"""\n${section.text}\n"""\n\n` +
            "Return JSON in this shape: " +
            '{"topics":[{"heading":string,"explanation":string,"keyPoints":string[],' +
            '"terms":[{"term":string,"meaning":string}],"example":string|null}]}. ' +
            "The explanation is a simple step-by-step teaching of the source. " +
            "The example, if given, is an additional illustration written by you and is NOT from the source; " +
            "set it to null if no example is useful.",
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

  const topics = parseTopics(JSON.parse(content));
  if (!topics || topics.length === 0) throw new Error("AI response had an unexpected shape");
  return topics;
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
    const sectionIndex = Number.isInteger(body?.sectionIndex) && body.sectionIndex >= 0 ? body.sectionIndex : null;
    if (!documentId || sectionIndex === null) {
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

    const sections = splitIntoSections(document.content);
    if (sections.length > MAX_SECTIONS) {
      return json({ error: "This document is too long to generate notes for in one pass." }, 413);
    }
    if (sectionIndex >= sections.length) {
      return json({ error: "Section is out of range." }, 400);
    }

    if (sectionIndex === 0) {
      const { error: clearError } = await supabase
        .from("study_note_sections")
        .delete()
        .eq("document_id", documentId);
      if (clearError) throw clearError;
    }

    const section = sections[sectionIndex];
    const topics = await generateTopics(apiKey, section);

    const { error: saveError } = await supabase.from("study_note_sections").upsert(
      { document_id: documentId, chunk_index: sectionIndex, label: section.label, topics },
      { onConflict: "document_id,chunk_index" },
    );
    if (saveError) throw saveError;

    return json({
      sectionIndex,
      totalSections: sections.length,
      label: section.label,
      topics,
    });
  } catch (err) {
    console.error("generate-notes failed", err);
    return json({ error: "Notes could not be generated for this section. Please try again." }, 500);
  }
});
