import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { mockTasks } from '@/data/index';
import { Task, formatDateThai, getStatusColor } from '@/lib/index';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Calendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  // Filter tasks for the selected date
  const tasksOnSelectedDate = useMemo(() => {
    if (!date) return [];
    return mockTasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  }, [date]);

  // Identify days that have tasks for calendar dots
  const taskDays = useMemo(() => {
    return mockTasks.reduce((acc: Record<string, string[]>, task) => {
      const d = new Date(task.deadline).toDateString();
      if (!acc[d]) acc[d] = [];
      // Simple color logic based on status or subject (simplified to status for this prototype)
      acc[d].push(task.status === 'ตีกลับ' ? 'bg-destructive' : 'bg-primary');
      return acc;
    }, {});
  }, []);

  // Special UI for Exam Week or Heavy Load
  const isHeavyWeek = tasksOnSelectedDate.length > 3;

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-24">
        {/* Header Section */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ปฏิทินงาน</h1>
            <p className="text-sm text-muted-foreground">ติดตามเดดไลน์และวางแผนการเรียน</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
        </section>

        {/* View Switcher */}
        <Tabs defaultValue="month" className="w-full" onValueChange={(v) => setView(v as 'month' | 'week')}>
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger value="month" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">รายเดือน</TabsTrigger>
            <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">รายสัปดาห์</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Calendar Card */}
        <Card className="border-none shadow-sm overflow-hidden rounded-[24px]">
          <CardContent className="p-4 flex justify-center">
            <CalendarUI
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              modifiers={{
                hasTask: (date) => !!taskDays[date.toDateString()],
              }}
              modifiersClassNames={{
                hasTask: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full"
              }}
            />
          </CardContent>
        </Card>

        {/* Exam Week / Urgent Banner */}
        {isHeavyWeek && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3"
          >
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-orange-900 text-sm">สัปดาห์งานหนัก (Heavy Week)</h4>
              <p className="text-xs text-orange-700 mt-0.5">คุณมีงานที่ต้องส่งมากกว่า 3 งานในวันนี้ อย่าลืมจัดลำดับความสำคัญให้ดีนะ!</p>
            </div>
          </motion.div>
        )}

        {/* Selected Day's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              {date ? (
                date.toDateString() === new Date().toDateString() ? 'งานวันนี้' : `งานวันที่ ${date.getDate()} ${date.toLocaleString('th-TH', { month: 'short' })}`
              ) : 'เลือกวันที่'}
            </h3>
            <Badge variant="secondary" className="rounded-full">
              {tasksOnSelectedDate.length} งาน
            </Badge>
          </div>

          <AnimatePresence mode="wait">
            {tasksOnSelectedDate.length > 0 ? (
              <motion.div 
                key={date?.toISOString()}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {tasksOnSelectedDate.map((task) => (
                  <Link key={task.id} to={`/task/${task.id}`}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] rounded-2xl group mb-3">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${task.status === 'ตีกลับ' ? 'bg-destructive animate-pulse' : 'bg-primary'}`} />
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {task.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(task.deadline).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-[24px] border border-dashed border-muted-foreground/20"
              >
                <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                  <CheckCircle2 className="w-8 h-8 text-secondary" />
                </div>
                <p className="text-sm font-medium text-foreground">ไม่มีงานที่ต้องส่งในวันนี้</p>
                <p className="text-xs text-muted-foreground mt-1">พักผ่อนให้เต็มที่ หรือเริ่มทำงานของวันพรุ่งนี้ได้เลย</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upcoming Deadline Summary */}
        <Card className="border-none bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              สรุปเดดไลน์ถัดไป
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {mockTasks.filter(t => t.status !== 'ส่งแล้ว' && t.status !== 'รอตรวจ').slice(0, 2).map(task => (
               <div key={task.id} className="flex justify-between items-center text-xs">
                 <span className="text-muted-foreground">{task.title}</span>
                 <span className="font-medium">{formatDateThai(task.deadline).split(',')[0]}</span>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calendar;