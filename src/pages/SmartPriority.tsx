import React, { useMemo, useRef, useState } from 'react';
import { callSmartPriority, type PriorityResult } from '@/api/smartPriority';
import { Layout } from '@/components/Layout';
import { PriorityCard } from '@/components/Cards';
import { 
  Sparkles, 
  Info, 
  Clock, 
  Trophy, 
  AlertCircle, 
  Zap,
  BrainCircuit,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useTasks } from '@/hooks/useTasks';

const SmartPriority: React.FC = () => {
  const { tasks, replaceTasks } = useTasks();
  const [loadingAI, setLoadingAI] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // debounce / prevent spam
  const debounceRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  const logicFactors = [
    {
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      title: 'ความเร่งด่วน (Urgency)',
      description: 'งานที่ใกล้เดดไลน์ภายใน 24-48 ชั่วโมง จะได้รับคะแนนสูงเป็นพิเศษ',
      color: 'bg-orange-500/10',
    },
    {
      icon: <Trophy className="w-6 h-6 text-blue-500" />,
      title: 'น้ำหนักคะแนน (Impact)',
      description: 'งานที่มีสัดส่วนคะแนนสูง หรือเป็นงานโปรเจกต์ใหญ่ จะถูกดันขึ้นมาข้างบน',
      color: 'bg-blue-500/10',
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-500" />,
      title: 'ระยะเวลาที่ใช้ (Effort)',
      description: 'งานที่ใช้เวลานาน ระบบจะแนะนำให้เริ่มทำก่อน เพื่อไม่ให้สะสมในช่วงท้าย',
      color: 'bg-purple-500/10',
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-destructive" />,
      title: 'งานค้าง (Debt)',
      description: 'งานที่ถูกตีกลับ หรือเป็นงานสอบแก้ตัว จะได้รับลำดับความสำคัญสูงสุด',
      color: 'bg-destructive/10',
    },
  ];

  const priorityTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.status !== 'ส่งแล้ว' && task.status !== 'รอตรวจ')
      .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  }, [tasks]);

  const buildPayloadFromTasks = (tsks: any[]) => {
    return {
      user_context: { now: new Date().toISOString() },
      tasks: tsks
        .filter((t) => t.status !== 'ส่งแล้ว' && t.status !== 'รอตรวจ')
        .map((t) => ({
          task_id: t.id, // สำคัญ: ต้องตรงกับที่เราจะ merge กลับ
          title: t.title ?? t.name ?? '',
          // เดดไลน์: ถ้าใน mock เป็น string อยู่แล้วก็ส่งไป
          due: t.deadline ?? t.due ?? null,
          // เวลา: เดา field ที่พบบ่อย
          effort_min: t.effort_min ?? t.estimatedMinutes ?? t.duration ?? 60,
          // ความสำคัญ/น้ำหนักคะแนน
          importance: t.importance ?? t.weight ?? 3,
          status: t.status ?? 'todo',
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
        // ให้ PriorityCard ใช้ของเดิมได้
        priorityScore: r.priority_score,
        priorityLevel: r.priority_level,
        // เก็บข้อความ AI ไว้โชว์/ดีบัก
        ai_reason: r.reason,
        ai_next_actions: r.next_actions,
        ai_assumptions: r.assumptions,
      };
    });
  };

  const runAIWithDebounce = () => {
    setErrorMsg(null);

    // กันกดรัว: เคลียร์ตัวเก่า
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
        setLastUpdatedAt(new Date().toLocaleString());
      } catch (err: any) {
        setErrorMsg(err?.message ?? 'Unknown error');
      } finally {
        setLoadingAI(false);
        inFlightRef.current = false;
      }
    }, 500); // debounce 500ms
  };

  return (
    <Layout>
      <div className="pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-12 px-6 bg-gradient-to-br from-primary to-secondary text-white rounded-b-[2.5rem] shadow-xl">
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium mb-4"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>AI Powered Assistant</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-3"
            >
              ระบบทำก่อน (TumKorn)
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-sm leading-relaxed max-w-xs"
            >
              อัลกอริทึมที่ช่วยคำนวณว่า "งานไหนควรทำทันที" 
              เพื่อให้คุณบริหารเวลาได้ดีที่สุดและลดความเครียด
            </motion.p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-4 top-12 opacity-20">
            <BrainCircuit size={120} />
          </div>
        </section>

        <div className="px-6 -mt-6">
          {/* Summary Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-5 rounded-2xl shadow-lg border border-border grid grid-cols-2 gap-4"
          >
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">งานที่ต้องรีบทำ</span>
              <span className="text-2xl font-bold text-primary">{priorityTasks.length} งาน</span>
            </div>
            <div className="flex flex-col gap-1 border-l pl-4 border-border">
              <span className="text-muted-foreground text-xs">คะแนนความเร่งด่วนสูงสุด</span>
              <span className="text-2xl font-bold text-destructive">
                {priorityTasks[0]?.priorityScore || 0}%
              </span>
            </div>
          </motion.div>

          {/* AI Action Bar */}
          <div className="mt-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  จัดอันดับด้วย AI
                </div>
                <div className="text-xs text-muted-foreground">
                  {lastUpdatedAt ? `อัปเดตล่าสุด: ${lastUpdatedAt}` : 'กดปุ่มเพื่อให้ AI คำนวณลำดับใหม่'}
                </div>
              </div>

              <button
                onClick={runAIWithDebounce}
                disabled={loadingAI}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:opacity-95 disabled:opacity-60"
              >
                {loadingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    กำลังจัดอันดับ...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    จัดอันดับ
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-xs leading-relaxed">
                <div className="font-semibold mb-1">เกิดข้อผิดพลาด</div>
                <div className="whitespace-pre-wrap break-words">{errorMsg}</div>
                <div className="mt-2 text-muted-foreground">
                  เช็คว่าใน `.env` มี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ถูกต้อง และ Edge Function ทำงานอยู่
                </div>
              </div>
            )}
          </div>

          {/* AI Logic Explanation */}
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Info size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI จัดลำดับอย่างไร?</h2>
                <p className="text-xs text-muted-foreground">เกณฑ์การตัดสินใจของระบบ Smart Priority</p>
              </div>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-4"
            >
              {logicFactors.map((factor, index) => (
                <motion.div 
                  key={index} 
                  variants={staggerItem}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50"
                >
                  <div className={`p-3 rounded-xl ${factor.color}`}>
                    {factor.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{factor.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {factor.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Priority Task List */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">แนะนำให้ทำตอนนี้</h2>
                  <p className="text-xs text-muted-foreground">เรียงลำดับตามความสำคัญสูงสุด</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {priorityTasks.length > 0 ? (
                priorityTasks.slice(0, 5).map((task) => (
                  <PriorityCard key={task.id} task={task} />
                ))
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                  <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">เย้! ไม่มีงานค้างเร่งด่วนในตอนนี้</p>
                </div>
              )}
            </div>

            {priorityTasks.length > 5 && (
              <button className="w-full mt-4 py-3 text-sm font-medium text-primary bg-primary/5 rounded-xl border border-primary/10">
                ดูงานทั้งหมด
              </button>
            )}
          </section>

          {/* Quick Tip */}
          <section className="mt-10 mb-6">
            <div className="bg-gradient-to-r from-accent to-accent/50 p-6 rounded-[2rem] border border-accent-foreground/10 flex items-center gap-5">
              <div className="flex-1">
                <h3 className="font-bold text-accent-foreground mb-1 text-base">
                  เคล็ดลับลดความเครียด
                </h3>
                <p className="text-xs text-accent-foreground/70 leading-relaxed">
                  การเริ่มทำงานที่ "ยากและสำคัญที่สุด" เป็นอย่างแรกตอนเช้า 
                  จะช่วยให้สมองของคุณรู้สึกผ่อนคลายตลอดทั้งวันที่เหลือ
                </p>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm text-accent">
                <Clock size={24} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default SmartPriority;
