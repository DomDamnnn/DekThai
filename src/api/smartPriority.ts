export type PriorityResult = {
  task_id: string;
  priority_score: number;
  priority_level: 'P1' | 'P2' | 'P3';
  reason: string[];
  next_actions: string[];
  assumptions: string[];
};

export type PriorityResponse = {
  results: PriorityResult[];
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export async function callSmartPriority(payload: unknown): Promise<PriorityResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  }

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/smart-priority`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SmartPriority API error (${res.status}): ${text}`);
  }

  if (!text.trim()) {
    return { results: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('SmartPriority API returned invalid JSON');
  }

  const parsedObj = parsed as { results?: unknown };
  if (!parsedObj || typeof parsedObj !== 'object' || !Array.isArray(parsedObj.results)) {
    throw new Error('SmartPriority API response is missing "results" array');
  }

  return parsedObj as PriorityResponse;
}
