import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { NotificationCard } from '@/components/Cards';
import { mockNotifications } from '@/data/index';
import { Notification, ROUTE_PATHS } from '@/lib/index';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCheck, 
  Sparkles, 
  CalendarDays, 
  Trash2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({
      title: "สำเร็จ",
      description: "อ่านการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว",
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast({
      title: "ล้างการแจ้งเตือน",
      description: "ลบการแจ้งเตือนทั้งหมดออกจากรายการแล้ว",
    });
  };

  const handleAiSchedule = () => {
    toast({
      title: "AI กำลังจัดตารางงาน...",
      description: "ระบบกำลังสร้าง 3 บล็อกเวลาที่เหมาะสมที่สุดสำหรับคุณในวันนี้",
      className: "bg-primary text-white border-none",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Layout>
      <div className="pb-24 max-w-md mx-auto">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-6 pb-4 px-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-primary/10">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">การแจ้งเตือน</h1>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `คุณมี ${unreadCount} ข้อความใหม่ที่ยังไม่ได้อ่าน` : 'ไม่มีข้อความใหม่'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleMarkAllAsRead}
                className="rounded-full hover:bg-primary/5"
                title="ทำเป็นอ่านแล้วทั้งหมด"
              >
                <CheckCheck className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClearAll}
                className="rounded-full hover:bg-destructive/5 text-destructive"
                title="ลบทั้งหมด"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* AI Shortcut Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAiSchedule}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold leading-tight">จัดตารางวันนี้จาก AI</div>
                <div className="text-[10px] opacity-90 font-light">สรุปเป็น 3 บล็อกเวลาสำหรับงานที่เร่งด่วน</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Tabs and Content */}
        <div className="p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="all" className="flex-1 rounded-lg text-sm">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 rounded-lg text-sm">
                ยังไม่อ่าน
                {unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="system" className="flex-1 rounded-lg text-sm">ระบบ</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="all" className="mt-0">
                {notifications.length > 0 ? (
                  <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible" 
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ใหม่ล่าสุด</span>
                    </div>
                    {notifications.map((notif) => (
                      <motion.div key={notif.id} variants={itemVariants}>
                        <NotificationCard notification={notif} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-none flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-semibold">เย้! ไม่มีงานหลุด</h3>
                    <p className="text-sm text-muted-foreground px-10 mt-2">
                      คุณจัดการการแจ้งเตือนทั้งหมดแล้ว เตรียมตัวลุยงานต่อไปได้เลย
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="mt-0">
                <motion.div 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="visible" 
                  className="space-y-4"
                >
                  {notifications.filter(n => !n.isRead).map((notif) => (
                    <motion.div key={notif.id} variants={itemVariants}>
                      <NotificationCard notification={notif} />
                    </motion.div>
                  ))}
                  {notifications.filter(n => !n.isRead).length === 0 && (
                    <div className="py-20 text-center">
                      <p className="text-sm text-muted-foreground">คุณอ่านครบทุกข้อความแล้ว!</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="system" className="mt-0">
                <div className="py-20 text-center">
                  <p className="text-sm text-muted-foreground">ยังไม่มีการแจ้งเตือนจากระบบในขณะนี้</p>
                </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Action-based Context (Floating) */}
        <div className="px-4 mt-8">
          <div className="p-5 rounded-3xl bg-accent/30 border border-accent flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">มีงานเร่งด่วน?</h4>
            <p className="text-xs text-muted-foreground mb-4">
              ให้ DekThai ช่วยเตือนคุณเมื่อพร้อมทำ หรือเลือกเวลาที่คุณว่างที่สุด
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" className="rounded-xl text-xs flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" />
                ดูปฏิทิน
              </Button>
              <Button variant="outline" className="rounded-xl text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-secondary fill-secondary/20" />
                Smart Priority
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;