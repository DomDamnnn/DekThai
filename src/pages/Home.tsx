import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Zap,
  ChevronRight,
  Target,
  CheckCircle2,
  Clock,
  CalendarDays,
  School,
  Sparkles,
  BrainCircuit,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PriorityCard, StatsCard } from '@/components/Cards';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useTasks } from '@/hooks/useTasks';
import { useAppSettings } from '@/hooks/useAppSettings';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { student } = useAuth();
  const { tasks, stats, hasClassAccess } = useTasks();
  const { settings } = useAppSettings();
  const th = settings.language === 'th';

  const activeTasks = useMemo(
    () =>
      tasks.filter((task) => {
        return task.status !== 'ส่งแล้ว' && task.status !== 'รอตรวจ';
      }),
    [tasks]
  );

  const topPriorityTask = useMemo(
    () => [...activeTasks].sort((a, b) => b.priorityScore - a.priorityScore)[0],
    [activeTasks]
  );

  const todaySummary = useMemo(() => {
    if (!hasClassAccess) {
      return th
        ? 'ใส่รหัสห้องเรียนเพื่อเริ่มรับงานที่ครูมอบหมาย'
        : 'Enter your class code to start receiving assignments.';
    }
    if (activeTasks.length === 0) {
      return th ? 'ตอนนี้ยังไม่มีงานด่วน' : 'No urgent tasks right now.';
    }
    return th ? `วันนี้คุณมีงานที่ต้องทำ ${activeTasks.length} งาน` : `You have ${activeTasks.length} active tasks today.`;
  }, [activeTasks.length, hasClassAccess, th]);

  return (
    <Layout>
      <div className="px-5 pt-6 pb-24 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              {th ? 'สวัสดี' : 'Hello'}, {student?.nickname || (th ? 'นักเรียน' : 'Student')}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">{todaySummary}</p>
          </div>
          <Link
            to={ROUTE_PATHS.NOTIFICATIONS}
            className="relative p-2 bg-card rounded-full shadow-sm border border-border"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Link>
        </motion.div>

        {!hasClassAccess && (
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
            <p className="text-sm font-semibold">
              {th ? 'คุณยังไม่ได้เข้าร่วมห้องเรียน' : 'You have not joined a classroom yet.'}
            </p>
            <p className="text-xs text-muted-foreground">
              {th
                ? 'เพิ่มรหัสห้องเรียนก่อน งานที่ครูมอบหมายจะขึ้นให้อัตโนมัติ'
                : 'Add your class code first. Assigned tasks will appear automatically.'}
            </p>
            <Button
              onClick={() => navigate(ROUTE_PATHS.CLASS_CODE)}
              className="h-9 rounded-xl"
            >
              {th ? 'เข้าร่วมห้องเรียน' : 'Join Classroom'}
            </Button>
          </div>
        )}

        <section>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary to-secondary text-white p-5 shadow-lg"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/15 rounded-full blur-2xl" />
            <div className="absolute right-3 top-3 opacity-20">
              <BrainCircuit className="w-20 h-20" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                TumKornAI
              </div>
              <h2 className="text-xl font-bold">
                {th ? 'Priority AI จัดลำดับงานให้ทันที' : 'Priority AI ranks your tasks instantly'}
              </h2>
              <p className="text-sm text-white/85 leading-relaxed">
                {th
                  ? 'ระบบวิเคราะห์เดดไลน์ ผลกระทบ และความยาก เพื่อบอกว่างานไหนควรทำก่อน'
                  : 'It analyzes deadline, impact, and effort to tell you what to do first.'}
              </p>
              <Button
                onClick={() => navigate(ROUTE_PATHS.SMART_PRIORITY)}
                className="h-10 rounded-xl bg-white text-primary hover:bg-white/90"
              >
                {th ? 'เปิด Priority AI' : 'Open Priority AI'}
              </Button>
            </div>
          </motion.div>
        </section>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          <motion.button
            variants={staggerItem}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(ROUTE_PATHS.CALENDAR)}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-border space-y-2"
          >
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">{th ? 'ปฏิทิน' : 'Calendar'}</span>
          </motion.button>

          <motion.button
            variants={staggerItem}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(ROUTE_PATHS.GROUP)}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-border space-y-2"
          >
            <div className="p-2 bg-secondary/15 rounded-xl">
              <School className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold">{th ? 'ห้องเรียน' : 'Classroom'}</span>
          </motion.button>

          <motion.button
            variants={staggerItem}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(ROUTE_PATHS.WORKSPACE)}
            className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-md space-y-2"
          >
            <div className="p-2 bg-white/20 rounded-xl">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white">{th ? 'งานทั้งหมด' : 'All Tasks'}</span>
          </motion.button>
        </motion.div>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {th ? 'งานสำคัญสูงสุด' : 'Top Priority'}
            </h2>
            <Link
              to={ROUTE_PATHS.WORKSPACE}
              className="text-xs font-semibold text-primary flex items-center"
            >
              {th ? 'ดูทั้งหมด' : 'View all'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {topPriorityTask ? (
            <PriorityCard task={topPriorityTask} />
          ) : (
            <div className="p-8 bg-muted/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-secondary" />
              <p className="text-sm text-muted-foreground">
                {th ? 'ไม่มีงานค้างจากห้องเรียนของคุณ' : 'No backlog from your classroom.'}
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              {th ? 'สถิติความคืบหน้า' : 'Progress Stats'}
            </h2>
            <Link
              to={ROUTE_PATHS.STACK}
              className="text-xs font-semibold text-muted-foreground flex items-center"
            >
              {th ? 'ดูรางวัล' : 'View rewards'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title={th ? 'สแตกปัจจุบัน' : 'Current Stack'}
              value={`${stats.stackCount} ${th ? 'วัน' : 'days'}`}
              icon={<Zap className="w-5 h-5 text-white" />}
            />
            <StatsCard
              title={th ? 'อัตราส่งตรงเวลา' : 'On-time Rate'}
              value={`${stats.onTimeRate}%`}
              icon={<Target className="w-5 h-5 text-white" />}
            />
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-4 bg-white rounded-2xl border border-border shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{th ? 'งานค้าง' : 'Backlog'}</p>
                <p className="text-sm font-bold">{stats.backlogCount} {th ? 'งาน' : 'tasks'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs h-8"
              onClick={() => navigate(ROUTE_PATHS.WORKSPACE)}
            >
              {th ? 'จัดการ' : 'Manage'}
            </Button>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
