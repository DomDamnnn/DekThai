import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { mockTasks } from '@/data/index';
import { Task, getStatusColor, formatDateThai } from '@/lib/index';
import { 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  ChevronRight, 
  Paperclip, 
  Clock, 
  Send,
  Plus,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// Dummy data for sub-tasks in Kanban
const mockSubTasks = [
  { id: 'st1', title: 'รวบรวมเนื้อหาบทที่ 1', assignee: 'บอย', deadline: '2026-02-18T10:00:00Z', status: 'done', files: 2 },
  { id: 'st2', title: 'ออกแบบหน้าปกรายงาน', assignee: 'เดียร์', deadline: '2026-02-19T14:00:00Z', status: 'doing', files: 1 },
  { id: 'st3', title: 'สรุปผลการทดลอง', assignee: 'ฟ้า', deadline: '2026-02-20T12:00:00Z', status: 'todo', files: 0 },
  { id: 'st4', title: 'ทำสไลด์นำเสนอ', assignee: 'ต้น', deadline: '2026-02-21T09:00:00Z', status: 'todo', files: 0 },
];

const mockMessages = [
  { id: 'm1', sender: 'บอย', text: 'ผมลงเนื้อหาบทที่ 1 ไว้ในโฟลเดอร์แล้วนะ', time: '10:15', isMe: false },
  { id: 'm2', sender: 'เดียร์', text: 'โอเคจ้า เดี๋ยวเราเริ่มดูส่วนออกแบบให้เลย', time: '10:17', isMe: true },
  { id: 'm3', sender: 'ฟ้า', text: 'ผลแล็บวันนี้ออกมาแล้ว เดี๋ยวส่งให้ในบอร์ดนะ', time: '11:00', isMe: false },
];

const GroupPage: React.FC = () => {
  const groupTasks = mockTasks.filter(task => task.isGroup);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(groupTasks[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'board' | 'chat'>('board');

  const selectedTask = groupTasks.find(t => t.id === selectedTaskId);

  if (!selectedTask) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-xl font-semibold">ยังไม่มีกลุ่มงาน</h2>
          <p className="text-muted-foreground mt-2">งานกลุ่มที่ครูมอบหมายจะปรากฏที่นี่</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pb-24">
        {/* Header Section: Group Selection */}
        <div className="bg-white border-b sticky top-0 z-10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              DekGroup
            </h1>
            <Button variant="outline" size="sm" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" /> สร้างกลุ่ม
            </Button>
          </div>

          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-3">
              {groupTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`flex flex-col items-start p-3 rounded-2xl border-2 transition-all min-w-[200px] ${
                    selectedTaskId === task.id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-transparent bg-muted/50'
                  }`}
                >
                  <span className="text-xs font-medium text-muted-foreground mb-1">{task.subject}</span>
                  <span className="text-sm font-bold truncate w-full text-left">{task.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Progress Summary Card */}
        <div className="p-4">
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ความคืบหน้ารวม</h3>
                <p className="text-2xl font-bold text-primary">65%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">เหลืออีก 4 งานย่อย</p>
                <p className="text-xs font-medium text-destructive">เดดไลน์: {formatDateThai(selectedTask.deadline)}</p>
              </div>
            </div>
            <Progress value={65} className="h-2 mb-2" />
            <div className="flex -space-x-2 mt-3">
              {['บอย', 'เดียร์', 'ฟ้า', 'ต้น'].map((name, i) => (
                <Avatar key={i} className="border-2 border-white w-8 h-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
              ))}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-white font-medium">
                +2
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="px-4">
          <Tabs defaultValue="board" onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-full h-12 bg-muted p-1 mb-4">
              <TabsTrigger value="board" className="rounded-full flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                บอร์ดงาน
              </TabsTrigger>
              <TabsTrigger value="chat" className="rounded-full flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                แชทกลุ่ม
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="board" className="mt-0">
                  {/* Kanban Board Layout (Mobile Scrollable) */}
                  <div className="space-y-6">
                    {/* Section: To Do */}
                    <KanbanSection 
                      title="ต้องทำ"
                      count={2}
                      tasks={mockSubTasks.filter(s => s.status === 'todo')}
                      color="bg-muted-foreground/10 text-muted-foreground"
                    />
                    
                    {/* Section: Doing */}
                    <KanbanSection 
                      title="กำลังทำ"
                      count={1}
                      tasks={mockSubTasks.filter(s => s.status === 'doing')}
                      color="bg-primary/10 text-primary"
                    />

                    {/* Section: Done */}
                    <KanbanSection 
                      title="เสร็จแล้ว"
                      count={1}
                      tasks={mockSubTasks.filter(s => s.status === 'done')}
                      color="bg-secondary/10 text-secondary"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <div className="flex flex-col h-[50vh] bg-white rounded-3xl border shadow-sm">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {mockMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {!msg.isMe && <span className="text-[10px] font-bold text-muted-foreground">{msg.sender}</span>}
                            </div>
                            <div 
                              className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${msg.isMe 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-muted text-foreground rounded-tl-none'}`
                              }
                            >
                              {msg.text}
                            </div>
                            <span className="text-[9px] text-muted-foreground mt-1">{msg.time}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-3 border-t flex gap-2">
                      <Input 
                        placeholder="พิมพ์ข้อความ..." 
                        className="rounded-full bg-muted border-none"
                      />
                      <Button size="icon" className="rounded-full shrink-0">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

interface KanbanSectionProps {
  title: string;
  count: number;
  tasks: typeof mockSubTasks;
  color: string;
}

const KanbanSection: React.FC<KanbanSectionProps> = ({ title, count, tasks, color }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-sm">{title}</h4>
        <Badge variant="secondary" className={`rounded-full px-2 py-0 h-5 text-[10px] ${color}`}>
          {count}
        </Badge>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Plus className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
    
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="p-3 border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <h5 className="text-sm font-semibold">{task.title}</h5>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-orange-400" />
              {formatDateThai(task.deadline).split(',')[0]}
            </div>
            {task.files > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {task.files} ไฟล์
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`} />
                <AvatarFallback>{task.assignee[0]}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-medium">{task.assignee}</span>
            </div>
            {task.status === 'done' ? (
              <CheckCircle2 className="w-4 h-4 text-secondary" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-muted" />
            )}
          </div>
        </Card>
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-4 border-2 border-dashed rounded-2xl opacity-40">
          <p className="text-xs">ไม่มีงานในส่วนนี้</p>
        </div>
      )}
    </div>
  </div>
);

export default GroupPage;