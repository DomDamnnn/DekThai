import { useEffect, useMemo, useState } from "react";
import { callSmartPriority } from "@/api/smartPriority";

export default function SmartPriorityPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    // TODO: replace ด้วย fetch tasks จริงของดอม
    // setTasks(mockTasks);
  }, []);

  const runAI = async () => {
    setLoadingAI(true);
    try {
      const payload = {
        user_context: { now: new Date().toISOString() },
        tasks: tasks.map((t) => ({
          task_id: t.id,              // ✅ ต้องตรง
          title: t.title,
          due: t.deadline,            // เช่น "2026-02-27"
          effort_min: t.effort_min ?? t.estimatedMinutes ?? 60,
          importance: t.importance ?? t.weight ?? 3,
          status: t.status ?? "todo",
          subject: t.subject ?? null,
          is_group: t.isGroup ?? false,
        })),
      };

      const ai = await callSmartPriority(payload);

      const map = new Map(ai.results.map((r) => [r.task_id, r]));

      setTasks((prev) =>
        prev.map((t) => {
          const r = map.get(t.id);
          if (!r) return t;
          return {
            ...t,
            priority_score: r.priority_score,
            priority_level: r.priority_level,
            ai_reason: r.reason,
            ai_next_actions: r.next_actions,
            ai_assumptions: r.assumptions,
          };
        })
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const sorted = useMemo(() => {
    return [...tasks].sort(
      (a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0)
    );
  }, [tasks]);

  return (
    <div>
      <button onClick={runAI} disabled={loadingAI || tasks.length === 0}>
        {loadingAI ? "กำลังจัดลำดับ..." : "จัดลำดับด้วย AI"}
      </button>

      {sorted.map((t) => (
        <div key={t.id}>
          <div>
            <b>{t.title}</b> — {t.priority_level ?? "-"} ({t.priority_score ?? 0})
          </div>

          {t.ai_reason && (
            <ul>
              {t.ai_reason.map((x: string, i: number) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          )}

          {t.ai_next_actions && (
            <>
              <div><b>Next actions</b></div>
              <ol>
                {t.ai_next_actions.map((x: string, i: number) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      ))}
    </div>
  );
}