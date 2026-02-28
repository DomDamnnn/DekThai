import React, { useMemo, useRef, useState } from "react";
import { callSmartPriority, type PriorityResult } from "@/api/smartPriority";
import { Layout } from "@/components/Layout";
import { PriorityCard } from "@/components/Cards";
import {
  Sparkles,
  Info,
  Clock,
  Trophy,
  AlertCircle,
  Zap,
  BrainCircuit,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { useLocale } from "@/hooks/useLocale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DONE_STATUSES = new Set(["ส่งแล้ว", "รอตรวจ", "submitted", "waiting review"]);

type LogicFactor = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  iconColor: string;
  Icon: LucideIcon;
};

const SmartPriority: React.FC = () => {
  const { tasks, replaceTasks } = useTasks();
  const { language, tx } = useLocale();
  const [loadingAI, setLoadingAI] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFactorId, setSelectedFactorId] = useState("urgency");

  const debounceRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const heroContainerVariants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  };
  const heroItemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const logicFactors: LogicFactor[] = useMemo(
    () => [
      {
        id: "urgency",
        title: tx("ความเร่งด่วน (Urgency)", "Urgency"),
        shortTitle: tx("เร่งด่วน", "Urgency"),
        description: tx(
          "งานที่ใกล้เดดไลน์ภายใน 24-48 ชั่วโมง จะได้รับคะแนนสูงเป็นพิเศษ",
          "Tasks due within 24-48 hours receive an extra boost."
        ),
        color: "bg-orange-500/10",
        iconColor: "text-orange-500",
        Icon: Clock,
      },
      {
        id: "impact",
        title: tx("น้ำหนักคะแนน (Impact)", "Impact"),
        shortTitle: tx("น้ำหนักคะแนน", "Impact"),
        description: tx(
          "งานที่มีสัดส่วนคะแนนสูง หรือเป็นงานโปรเจกต์ใหญ่ จะถูกดันขึ้นมาข้างบน",
          "High-score or high-impact assignments are moved up the list."
        ),
        color: "bg-blue-500/10",
        iconColor: "text-blue-500",
        Icon: Trophy,
      },
      {
        id: "effort",
        title: tx("ระยะเวลาที่ใช้ (Effort)", "Effort"),
        shortTitle: tx("ใช้เวลานาน", "Effort"),
        description: tx(
          "งานที่ใช้เวลานาน ระบบจะแนะนำให้เริ่มทำก่อน เพื่อไม่ให้สะสมในช่วงท้าย",
          "Long tasks are recommended earlier to avoid last-minute overload."
        ),
        color: "bg-violet-500/10",
        iconColor: "text-violet-500",
        Icon: BrainCircuit,
      },
      {
        id: "debt",
        title: tx("งานค้าง (Debt)", "Task debt"),
        shortTitle: tx("งานค้าง", "Debt"),
        description: tx(
          "งานที่ถูกตีกลับ หรือเป็นงานสอบแก้ตัว จะได้รับลำดับความสำคัญสูงสุด",
          "Returned tasks or make-up work are prioritized first."
        ),
        color: "bg-destructive/10",
        iconColor: "text-destructive",
        Icon: AlertCircle,
      },
    ],
    [tx]
  );

  const activeFactor = logicFactors.find((factor) => factor.id === selectedFactorId) ?? logicFactors[0];

  const isDoneStatus = (status: string) => DONE_STATUSES.has(status.trim().toLowerCase());

  const priorityTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => !isDoneStatus(task.status))
      .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  }, [tasks]);

  const buildPayloadFromTasks = (tsks: any[]) => {
    return {
      user_context: { now: new Date().toISOString() },
      tasks: tsks
        .filter((t) => !isDoneStatus(t.status ?? ""))
        .map((t) => ({
          task_id: t.id,
          title: t.title ?? t.name ?? "",
          due: t.deadline ?? t.due ?? null,
          effort_min: t.effort_min ?? t.estimatedMinutes ?? t.duration ?? 60,
          importance: t.importance ?? t.weight ?? 3,
          status: t.status ?? "todo",
          subject: t.subject ?? null,
          is_group: t.isGroup ?? false,
          returned_reason: t.returnedReason ?? null,
        })),
    };
  };

  const applyAIResultsToTasks = (prev: any[], results: PriorityResult[]) => {
    const map = new Map(results.map((r) => [r.task_id, r]));
    return prev.map((t) => {
      const r = map.get(t.id);
      if (!r) return t;

      return {
        ...t,
        priorityScore: r.priority_score,
        priorityLevel: r.priority_level,
        priorityReason: r.reason ?? t.priorityReason,
        ai_reason: r.reason,
        ai_next_actions: r.next_actions,
        ai_assumptions: r.assumptions,
      };
    });
  };

  const runAIWithDebounce = () => {
    setErrorMsg(null);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      setLoadingAI(true);

      try {
        const payload = buildPayloadFromTasks(tasks);
        const data = await callSmartPriority(payload);

        replaceTasks(applyAIResultsToTasks(tasks, data.results));
        setLastUpdatedAt(new Date().toLocaleString(language === "th" ? "th-TH" : "en-US"));
      } catch (err: any) {
        setErrorMsg(err?.message ?? tx("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ", "Unknown error"));
      } finally {
        setLoadingAI(false);
        inFlightRef.current = false;
      }
    }, 500);
  };

  return (
    <Layout>
      <div className="pb-24">
        <motion.section
          variants={heroContainerVariants}
          initial="hidden"
          animate="show"
          className="relative isolate overflow-hidden rounded-[2.25rem] bg-[linear-gradient(140deg,#1d4ed8_0%,#0ea5e9_48%,#10b981_100%)] px-6 pb-10 pt-8 text-white shadow-[0_20px_50px_-30px_rgba(6,182,212,1)]"
        >
          <motion.div
            animate={{ x: [0, 10, 0], y: [0, -8, 0], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-10 -top-16 h-44 w-44 rounded-full bg-white/30 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -14, 0], y: [0, 10, 0], opacity: [0.18, 0.35, 0.18] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 right-[-30px] h-56 w-56 rounded-full bg-emerald-300/40 blur-3xl"
          />
          <motion.div
            animate={{ rotate: [0, 8, 0], scale: [1, 1.03, 1], opacity: [0.45, 0.65, 0.45] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute bottom-5 right-5 h-28 w-28"
          >
            <div className="absolute inset-0 rounded-full border border-white/25" />
            <div className="absolute inset-3 rounded-full border border-white/20" />
            <motion.div
              animate={{ y: [0, -4, 0], opacity: [0.4, 0.95, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-5 top-4 h-2 w-2 rounded-full bg-white/80"
            />
            <motion.div
              animate={{ x: [0, 5, 0], opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-6 left-4 h-1.5 w-1.5 rounded-full bg-cyan-100"
            />
          </motion.div>

          <div className="relative z-10 flex flex-col gap-5">
            <div className="max-w-[28rem]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <motion.div
                  variants={heroItemVariants}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 text-xs font-medium backdrop-blur-md"
                >
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                  <span>{tx("ผู้ช่วยอัจฉริยะ AI", "AI Powered Assistant")}</span>
                </motion.div>
                <motion.div
                  variants={heroItemVariants}
                  className="inline-flex h-9 items-center rounded-full border border-white/35 bg-white/15 px-4 text-[13px] font-semibold text-white backdrop-blur-md"
                >
                  DekThai
                </motion.div>
              </div>
              <motion.h1 variants={heroItemVariants} className="mb-3 text-3xl font-bold leading-tight sm:whitespace-nowrap">
                {tx("ระบบทำก่อน (TumKorn)", "TumKorn Priority System")}
              </motion.h1>
              <motion.div variants={heroItemVariants} className="flex items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={tx("คำอธิบายระบบ TumKorn", "TumKorn system details")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white transition hover:bg-white/25"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-72 rounded-xl border-white/30 bg-white/95 p-3 text-foreground"
                  >
                    <p className="text-sm font-semibold">
                      {tx("ระบบ TumKorn คืออะไร?", "What is TumKorn?")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {tx(
                        'TumKorn จะประเมินความเร่งด่วน น้ำหนักคะแนน เวลาที่ต้องใช้ และงานค้าง เพื่อแนะนำว่า "ควรเริ่มงานไหนก่อน" แบบอัตโนมัติ',
                        'TumKorn evaluates urgency, score impact, required effort, and backlog to suggest which task should be started first.'
                      )}
                    </p>
                  </PopoverContent>
                </Popover>
                <div className="ml-auto w-fit max-w-full rounded-xl border border-white/30 bg-white/12 px-3 py-2.5 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-white/15 p-1.5">
                      <BrainCircuit className="h-4 w-4 text-cyan-100" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.12em] text-cyan-100/90">AI Engine</p>
                      <p className="whitespace-nowrap text-xs font-semibold text-white">
                        {tx("วิเคราะห์เดดไลน์สด", "Live deadline scan")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <div className="mt-4 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{tx("งานที่ต้องรีบทำ", "Tasks to do now")}</span>
              <span className="text-2xl font-bold text-primary">
                {tx(`${priorityTasks.length} งาน`, `${priorityTasks.length} tasks`)}
              </span>
            </div>
            <div className="flex flex-col gap-1 border-l border-border pl-4">
              <span className="text-xs text-muted-foreground">{tx("คะแนนความเร่งด่วนสูงสุด", "Top urgency score")}</span>
              <span className="text-2xl font-bold text-destructive">{priorityTasks[0]?.priorityScore || 0}%</span>
            </div>
          </motion.div>

          <div className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.08 }}
              whileHover={{ y: -2 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {tx("จัดอันดับด้วย AI", "Rank with AI")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lastUpdatedAt
                    ? tx(`อัปเดตล่าสุด: ${lastUpdatedAt}`, `Last updated: ${lastUpdatedAt}`)
                    : tx("กดปุ่มเพื่อให้ AI คำนวณลำดับใหม่", "Tap to let AI recalculate priorities")}
                </div>
              </div>

              <button
                type="button"
                onClick={runAIWithDebounce}
                disabled={loadingAI}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {loadingAI ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {tx("กำลังจัดอันดับ...", "Ranking...")}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    {tx("จัดอันดับ", "Rank now")}
                  </>
                )}
              </button>
            </motion.div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs leading-relaxed text-destructive"
              >
                <div className="mb-1 font-semibold">{tx("เกิดข้อผิดพลาด", "Something went wrong")}</div>
                <div className="whitespace-pre-wrap break-words">{errorMsg}</div>
                <div className="mt-2 text-muted-foreground">
                  {tx(
                    "เช็คว่าใน .env มี VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ถูกต้อง และ Edge Function ทำงานอยู่",
                    "Check .env values (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY), and make sure the Edge Function is running."
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Info size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">{tx("AI จัดลำดับอย่างไร?", "How does AI prioritize?")}</h2>
                <p className="text-xs text-muted-foreground">
                  {tx("แตะไอคอนเพื่อดูคำอธิบายทีละหัวข้อ", "Tap each icon to see the explanation")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {logicFactors.map((factor) => {
                const active = factor.id === activeFactor.id;
                const Icon = factor.Icon;

                return (
                  <motion.button
                    key={factor.id}
                    type="button"
                    onClick={() => setSelectedFactorId(factor.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition ${
                      active
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                    aria-pressed={active}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        active ? factor.color : "bg-muted"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? factor.iconColor : "text-muted-foreground"}`} />
                    </span>
                    <span className="text-xs font-semibold text-foreground">{factor.shortTitle}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFactor.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-4 rounded-2xl border border-border bg-muted/40 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2.5 ${activeFactor.color}`}>
                    <activeFactor.Icon className={`h-5 w-5 ${activeFactor.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{activeFactor.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{activeFactor.description}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </section>

          <section className="mt-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{tx("แนะนำให้ทำตอนนี้", "Recommended now")}</h2>
                  <p className="text-xs text-muted-foreground">
                    {tx("เรียงลำดับตามความสำคัญสูงสุด", "Sorted by highest priority")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {priorityTasks.length > 0 ? (
                priorityTasks.slice(0, 5).map((task) => <PriorityCard key={task.id} task={task} />)
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-border bg-muted/30 py-12 text-center">
                  <Trophy className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="font-medium text-muted-foreground">
                    {tx("เย้! ไม่มีงานค้างเร่งด่วนในตอนนี้", "Nice! No urgent backlog right now")}
                  </p>
                </div>
              )}
            </div>

            {priorityTasks.length > 5 && (
              <button
                type="button"
                className="mt-4 w-full rounded-xl border border-primary/10 bg-primary/5 py-3 text-sm font-medium text-primary"
              >
                {tx("ดูงานทั้งหมด", "View all tasks")}
              </button>
            )}
          </section>

          <section className="mb-6 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              whileHover={{ y: -2, scale: 1.005 }}
              className="flex items-center gap-5 rounded-[2rem] border border-accent-foreground/10 bg-gradient-to-r from-accent to-accent/50 p-6"
            >
              <div className="flex-1">
                <h3 className="mb-1 text-base font-bold text-accent-foreground">{tx("เคล็ดลับลดความเครียด", "Stress relief tip")}</h3>
                <p className="text-xs leading-relaxed text-accent-foreground/70">
                  {tx(
                    'เริ่มงานที่ "ยากและสำคัญที่สุด" ก่อนช่วงเช้า จะช่วยให้สมองโล่งและจัดการวันที่เหลือได้ง่ายขึ้น',
                    'Start with the hardest important task in the morning. The rest of the day becomes easier to manage.'
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-accent shadow-sm">
                <Clock size={24} />
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default SmartPriority;
