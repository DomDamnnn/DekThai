import React from "react";
import { Layout } from "@/components/Layout";
import { NotificationCard } from "@/components/Cards";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocale } from "@/hooks/useLocale";

const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const { toast } = useToast();
  const { tx } = useLocale();

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const onReadAll = () => {
    markAllAsRead();
    toast({
      title: tx("อัปเดตแล้ว", "Updated"),
      description: tx("อ่านการแจ้งเตือนทั้งหมดแล้ว", "All notifications marked as read."),
    });
  };

  const onClear = () => {
    clearAll();
    toast({
      title: tx("ล้างแล้ว", "Cleared"),
      description: tx("ลบการแจ้งเตือนทั้งหมดเรียบร้อย", "All notifications removed."),
    });
  };

  return (
    <Layout>
      <div className="pb-24 max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-6 pb-4 px-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-primary/10">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{tx("การแจ้งเตือน", "Notifications")}</h1>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? tx(`มี ${unreadCount} รายการที่ยังไม่อ่าน`, `${unreadCount} unread notification(s)`) : tx("ไม่มีรายการใหม่", "No new items")}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onReadAll} className="rounded-full">
                <CheckCheck className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClear} className="rounded-full text-destructive">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="all" className="flex-1 rounded-lg text-sm">
                {tx("ทั้งหมด", "All")}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 rounded-lg text-sm">
                {tx("ยังไม่อ่าน", "Unread")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {notifications.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {notifications.map((notif) => (
                    <NotificationCard key={notif.id} notification={notif} />
                  ))}
                </motion.div>
              ) : (
                <div className="py-20 text-center text-muted-foreground text-sm">{tx("ยังไม่มีการแจ้งเตือนจากงานที่มอบหมาย", "No assignment notifications yet.")}</div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              {unreadNotifications.length > 0 ? (
                <div className="space-y-4">
                  {unreadNotifications.map((notif) => (
                    <NotificationCard key={notif.id} notification={notif} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground text-sm">{tx("คุณอ่านครบทุกรายการแล้ว", "You're all caught up.")}</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;

