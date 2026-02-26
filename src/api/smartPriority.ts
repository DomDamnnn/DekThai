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
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SmartPriority API error (${res.status}): ${text}`);
  }

  return JSON.parse(text) as PriorityResponse;
}
