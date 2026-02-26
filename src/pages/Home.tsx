import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Scan, 
  Sparkles, 
  Bell, 
  Zap, 
  ChevronRight, 
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WorkCard, StatsCard, PriorityCard } from '@/components/Cards';
import { ROUTE_PATHS, Task } from '@/lib/index';
import { mockTasks } from '@/data/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { student } = useAuth();

  // จัดการข้อมูลงาน
  const activeTasks = useMemo(() => {
    return mockTasks.filter(t => t.status !== 'ส่งแล้ว' && t.status !== 'รอตรวจ');
  }, []);

  // 1. งานที่ต้องทำตอนนี้ (Top Priority)
  const topPriorityTask = useMemo(() => {
    return [...activeTasks].sort((a, b) => b.priorityScore - a.priorityScore)[0];
  }, [activeTasks]);

  // 2. งานใกล้เดดไลน์ (แสดง 2 งาน)
  const nearDeadlineTasks = useMemo(() => {
    return [...activeTasks]
      .filter(t => t.id !== topPriorityTask?.id)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 2);
  }, [activeTasks, topPriorityTask]);

  const todaySummary = useMemo(() => {
    const count = activeTasks.length;
    if (count === 0) return 'ยอดเยี่ยม! คุณเคลียร์งานครบหมดแล้ว';
    return `วันนี้คุณมีงานต้องจัดการ ${count} อย่าง`;
  }, [activeTasks]);

  return (
    <Layout>
      <div className="px-5 pt-6 pb-24 space-y-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              สวัสดี, {student?.nickname || 'เพื่อนใหม่'} 👋
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {todaySummary}
            </p>
          </div>
          <Link to={ROUTE_PATHS.NOTIFICATIONS} className="relative p-2 bg-card rounded-full shadow-sm border border-border">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card"></span>
          </Link>
        </motion.div>

        {/* Quick Action Buttons */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          <motion.button 
            variants={staggerItem}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-border space-y-2"
          >
            <div className="p-2 bg-primary/10 rounded-xl">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">เพิ่มงาน</span>
          </motion.button>

          <motion.button 
            variants={staggerItem}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-border space-y-2"
          >
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Scan className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold">สแกนไฟล์</span>
          </motion.button>

          <motion.button 
            variants={staggerItem}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(ROUTE_PATHS.SMART_PRIORITY)}
            className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-md space-y-2"
          >
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white">AI ลำดับงาน</span>
          </motion.button>
        </motion.div>

        {/* 1. งานที่ต้องทำตอนนี้ (Top Priority) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              งานที่ต้องทำตอนนี้
            </h2>
            <Link 
              to={ROUTE_PATHS.SMART_PRIORITY} 
              className="text-xs font-semibold text-primary flex items-center"
            >
              ทำไมถึงต้องทำชิ้นนี้? <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          {topPriorityTask ? (
            <PriorityCard task={topPriorityTask} />
          ) : (
            <div className="p-8 bg-muted/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-secondary" />
              <p className="text-sm text-muted-foreground">ยังไม่มีงานเร่งด่วนในขณะนี้<br/>พักผ่อนให้เต็มที่นะ!</p>
            </div>
          )}
        </section>

        {/* 2. งานใกล้เดดไลน์ */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              งานใกล้เดดไลน์
            </h2>
            <Link 
              to={ROUTE_PATHS.WORKSPACE} 
              className="text-xs font-semibold text-muted-foreground flex items-center"
            >
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {nearDeadlineTasks.map(task => (
              <WorkCard key={task.id} task={task} />
            ))}
            {nearDeadlineTasks.length === 0 && !topPriorityTask && (
              <p className="text-sm text-center text-muted-foreground py-4">ไม่มีงานใกล้กำหนดส่งเร็วๆ นี้</p>
            )}
          </div>
        </section>

        {/* 3. สถิติความต่อเนื่อง (Stack) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              สถิติความต่อเนื่อง
            </h2>
            <Link 
              to={ROUTE_PATHS.STACK} 
              className="text-xs font-semibold text-muted-foreground flex items-center"
            >
              ดูรางวัล <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <StatsCard 
              title="Stack ต่อเนื่อง"
              value={`${student?.stackCount || 0} วัน`}
              icon={<Zap className="w-5 h-5 text-white" />}
            />
            <StatsCard 
              title="ส่งตรงเวลา"
              value={`${student?.onTimeRate || 0}%`}
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
                <p className="text-xs text-muted-foreground font-medium">งานค้างสะสม (Backlog)</p>
                <p className="text-sm font-bold">{student?.backlogCount || 0} รายการ</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs h-8"
              onClick={() => navigate(ROUTE_PATHS.WORKSPACE)}
            >
              จัดการเลย
            </Button>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;