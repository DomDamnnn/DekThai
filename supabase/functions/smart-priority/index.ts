import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `
You are Smart Priority Assistant for students.
Return ONLY valid JSON (no markdown, no extra text).

Rules:
- priority_score: integer 0-100
- priority_level: "P1" | "P2" | "P3"
- Do not invent task_id not in input.
- If info missing, add short assumptions per task.

Output schema:
{
  "results": [
    {
      "task_id": "...",
      "priority_score": 0,
      "priority_level": "P1",
      "reason": ["..."],
      "next_actions": ["..."],
      "assumptions": ["..."]
    }
  ]
}
`;

function extractJson(text: string): string {
  const t = (text ?? "").trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return t;
  return t.slice(first, last + 1);
}

Deno.serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const payload = await req.json();

    const base = Deno.env.get("AZURE_FOUNDRY_ENDPOINT")!; // e.g. https://xxx.cognitiveservices.azure.com/openai
    const apiKey = Deno.env.get("AZURE_FOUNDRY_API_KEY")!;
    const deployment = Deno.env.get("AZURE_FOUNDRY_DEPLOYMENT")!; // e.g. o4-mini
    const apiVersion = Deno.env.get("AZURE_OPENAI_API_VERSION") ?? "2024-12-01-preview";

    const url =
      `${base.replace(/\/$/, "")}/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify(payload) },
        ],
        // ❌ ไม่ใส่ temperature (o4-mini บาง config รองรับเฉพาะ default)
      }),
    });

    const raw = await upstream.text();

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: "azure_error", azure_status: upstream.status, azure_raw: raw }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 502 },
      );
    }

    const data = JSON.parse(raw);
    const content = data?.choices?.[0]?.message?.content ?? "";
    const clean = extractJson(content);
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});