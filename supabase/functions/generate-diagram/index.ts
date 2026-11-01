import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "openai/gpt-oss-120b";
const AI_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MAX_SOURCE_CHARS = 30000;
const MAX_COMPLETION_TOKENS = 8000;
const MAX_NODES = 14;

const DIAGRAM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "nodes", "edges"],
  properties: {
    title: { type: "string" },
    nodes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "label", "detail", "group"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          detail: { type: "string" },
          group: { type: "string" },
        },
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["from", "to", "label"],
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          label: { type: "string" },
        },
      },
    },
  },
};

interface DiagramNode {
  id: string;
  label: string;
  detail: string;
  group: string;
}

interface DiagramEdge {
  from: string;
  to: string;
  label: string;
}

interface ConceptDiagram {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validateDiagram(payload: unknown): ConceptDiagram | null {
  if (!payload || typeof payload !== "object") return null;
  const raw = payload as Record<string, unknown>;
  if (typeof raw.title !== "string" || !Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) return null;

  const nodes: DiagramNode[] = [];
  const ids = new Set<string>();
  for (const item of raw.nodes) {
    if (!item || typeof item !== "object") continue;
    const node = item as Record<string, unknown>;
    if (
      typeof node.id !== "string" || typeof node.label !== "string" ||
      typeof node.detail !== "string" || typeof node.group !== "string"
    ) {
      continue;
    }
    if (!node.id.trim() || ids.has(node.id) || nodes.length >= MAX_NODES) continue;
    ids.add(node.id);
    nodes.push({ id: node.id, label: node.label, detail: node.detail, group: node.group || "General" });
  }

  const edges: DiagramEdge[] = [];
  for (const item of raw.edges) {
    if (!item || typeof item !== "object") continue;
    const edge = item as Record<string, unknown>;
    if (typeof edge.from !== "string" || typeof edge.to !== "string" || typeof edge.label !== "string") continue;
    if (edge.from === edge.to || !ids.has(edge.from) || !ids.has(edge.to)) continue;
    edges.push({ from: edge.from, to: edge.to, label: edge.label });
  }

  if (nodes.length < 2) return null;
  return { title: raw.title, nodes, edges };
}

async function generateDiagram(apiKey: string, source: string): Promise<ConceptDiagram> {
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
        json_schema: { name: "concept_diagram", strict: true, schema: DIAGRAM_SCHEMA },
      },
      messages: [
        {
          role: "system",
          content:
            "You design concept diagrams that show how the key ideas in a study text connect. " +
            "Use ONLY the source text provided. Never add ideas that are not in the source. " +
            "Respond with a JSON object only.",
        },
        {
          role: "user",
          content:
            `Source text:\n"""\n${source}\n"""\n\n` +
            `Create a diagram with between 6 and ${MAX_NODES} nodes, one per important idea. ` +
            "Each node has a short id (n1, n2, ...), a label of at most 6 words, a one or two sentence detail, " +
            "and a group name (a short theme such as 'Causes' or 'Process'). " +
            "Edges connect a node 'from' to a node 'to' with a short 'label' describing the relationship " +
            "(for example 'leads to', 'is part of', 'requires'). Use the ids exactly as given in nodes. " +
            "Return JSON in this shape: " +
            '{"title":string,"nodes":[{"id":string,"label":string,"detail":string,"group":string}],' +
            '"edges":[{"from":string,"to":string,"label":string}]}.',
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

  const diagram = validateDiagram(JSON.parse(content));
  if (!diagram) throw new Error("AI response had an unexpected shape");
  return diagram;
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
      return json({ error: "This document has no text to draw a diagram from." }, 422);
    }

    const diagram = await generateDiagram(apiKey, source);

    const { error: saveError } = await supabase.from("study_diagrams").upsert(
      { document_id: documentId, diagram },
      { onConflict: "document_id" },
    );
    if (saveError) throw saveError;

    return json({ diagram });
  } catch (err) {
    console.error("generate-diagram failed", err);
    return json({ error: "The diagram could not be generated. Please try again." }, 500);
  }
});
