import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, LayoutGrid, ListFilter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { WorkCard } from '@/components/Cards';
import { mockTasks } from '@/data/index';
import { Task, TaskStatus } from '@/lib/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

const WorkSpace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ทั้งหมด'>('ทั้งหมด');
  const [isSmartPriority, setIsSmartPriority] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'score' | 'weight'>('deadline');

  // Get unique subjects for filtering (Optional extension)
  const subjects = useMemo(() => {
    const subs = new Set(mockTasks.map(t => t.subject));
    return Array.from(subs);
  }, []);

  const filteredTasks = useMemo(() => {
    let result = [...mockTasks];

    // Search filter
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ทั้งหมด') {
      result = result.filter(task => task.status === statusFilter);
    }

    // Sorting Logic
    if (isSmartPriority) {
      // Smart Priority always sorts by priorityScore
      result.sort((a, b) => b.priorityScore - a.priorityScore);
    } else {
      // Manual Sorting
      result.sort((a, b) => {
        if (sortBy === 'deadline') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'score') {
          return b.priorityScore - a.priorityScore;
        }
        if (sortBy === 'weight') {
          return (b.weight || 0) - (a.weight || 0);
        }
        return 0;
      });
    }

    return result;
  }, [searchQuery, statusFilter, isSmartPriority, sortBy]);

  const taskCounts = useMemo(() => ({
    total: mockTasks.length,
    pending: mockTasks.filter(t => t.status === 'ยังไม่เริ่ม' || t.status === 'กำลังทำ' || t.status === 'ตีกลับ').length,
    returned: mockTasks.filter(t => t.status === 'ตีกลับ').length,
  }), []);

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-24">
        {/* Header Section */}
        <header className="px-4 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground">งานของฉัน</h1>
            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/10 text-primary border-none">
              {taskCounts.pending} งานที่ต้องทำ
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">จัดการงานทั้งหมดของคุณให้เป็นระเบียบ</p>
        </header>

        {/* Search & Main Actions */}
        <div className="px-4 flex flex-col gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="ค้นหางาน หรือ วิชา..."
              className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Button 
              variant={isSmartPriority ? "default" : "outline"}
              className={`rounded-full h-10 px-4 flex items-center gap-2 shrink-0 transition-all ${
                isSmartPriority ? "bg-gradient-to-r from-primary to-secondary border-none text-white" : "bg-card border-none shadow-sm text-muted-foreground"
              }`}
              onClick={() => setIsSmartPriority(!isSmartPriority)}
            >
              <Sparkles className="w-4 h-4" />
              Smart Priority
            </Button>
            
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)} disabled={isSmartPriority}>
              <SelectTrigger className="w-auto h-10 rounded-full bg-card border-none shadow-sm gap-2 text-muted-foreground">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">เดดไลน์ใกล้สุด</SelectItem>
                <SelectItem value="score">คะแนนความสำคัญ</SelectItem>
                <SelectItem value="weight">น้ำหนักคะแนนงาน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-4">
          <Tabs 
            defaultValue="ทั้งหมด" 
            className="w-full" 
            onValueChange={(val) => setStatusFilter(val as TaskStatus | 'ทั้งหมด')}
          >
            <TabsList className="w-full bg-muted/50 p-1 h-12 rounded-2xl">
              <TabsTrigger value="ทั้งหมด" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="ยังไม่เริ่ม" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">ยังไม่เริ่ม</TabsTrigger>
              <TabsTrigger value="กำลังทำ" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">กำลังทำ</TabsTrigger>
              <TabsTrigger value="ตีกลับ" className="flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                ตีกลับ
                {taskCounts.returned > 0 && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Task List */}
        <div className="px-4 flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <WorkCard task={task} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ListFilter className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">ไม่พบงานที่ค้นหา</h3>
                <p className="text-muted-foreground max-w-[200px] mx-auto text-sm">
                  ลองเปลี่ยนคำค้นหา หรือเปลี่ยนฟิลเตอร์ดูนะ
                </p>
                <Button 
                  variant="ghost" 
                  className="mt-4 text-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ทั้งหมด');
                    setIsSmartPriority(false);
                  }}
                >
                  ล้างการค้นหา
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Summary Footer (Floating Style) */}
        {filteredTasks.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] bg-card/80 backdrop-blur-md border border-border/50 py-3 px-6 rounded-full shadow-lg flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">แสดง {filteredTasks.length} จาก {taskCounts.total} งาน</span>
            </div>
            {isSmartPriority && (
              <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                AI Optimized
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkSpace;