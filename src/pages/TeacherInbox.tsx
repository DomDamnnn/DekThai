import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Inbox, Megaphone, Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLASSROOM_EVENT, createTeacherInboxMessage, listTeacherInboxMessages } from "@/lib/classroomStorage";
import { TeacherInboxMessage, formatDateThai } from "@/lib";
import { useAppSettings } from "@/hooks/useAppSettings";

const TeacherInbox: React.FC = () => {
  const { isTeacher, teacher } = useTeacherGuard();
  const { teacherClassrooms } = useAuth();
  const { toast } = useToast();
  const { settings } = useAppSettings();
  const th = settings.language === "th";

  const [selectedClassCode, setSelectedClassCode] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<TeacherInboxMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!selectedClassCode && teacherClassrooms[0]) {
      setSelectedClassCode(teacherClassrooms[0].code);
    }
  }, [selectedClassCode, teacherClassrooms]);

  useEffect(() => {
    const reload = () => {
      if (!selectedClassCode) {
        setMessages([]);
        return;
      }
      setMessages(listTeacherInboxMessages(selectedClassCode));
    };

    reload();
    window.addEventListener(CLASSROOM_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(CLASSROOM_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, [selectedClassCode]);

  const handleSendMessage = async () => {
    if (!teacher || !selectedClassCode || !message.trim()) return;

    try {
      setIsSending(true);
      createTeacherInboxMessage({
        classCode: selectedClassCode,
        title: title.trim() || (th ? "ประกาศห้องเรียน" : "Classroom update"),
        message: message.trim(),
        teacherId: teacher.id,
        teacherName: teacher.nickname,
        teacherEmail: teacher.email,
      });
      toast({
        title: th ? "ส่งประกาศแล้ว" : "Message posted",
        description: th ? `ส่งไปยัง ${selectedClassCode} แล้ว` : `Sent to ${selectedClassCode}.`,
      });
      setTitle("");
      setMessage("");
      setMessages(listTeacherInboxMessages(selectedClassCode));
    } catch (error: any) {
      toast({
        title: th ? "ส่งข้อความไม่สำเร็จ" : "Cannot send message",
        description: error?.message || (th ? "กรุณาลองใหม่อีกครั้ง" : "Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isTeacher || !teacher) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 space-y-5">
        <div className="pt-6 space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" />
            {th ? "กล่องข้อความครู" : "Teacher Inbox"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {th
              ? "ประกาศข่าวสารและสื่อสารกับนักเรียนได้ในที่เดียว"
              : "Post announcements and keep classroom communication in one place."}
          </p>
        </div>

        {teacherClassrooms.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {th
                ? "สร้างห้องเรียนแรกของคุณก่อน เพื่อเริ่มส่งข้อความ"
                : "Create your first classroom to start sending messages."}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  {th ? "ข้อความใหม่" : "New Message"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>{th ? "ห้องเรียน" : "Classroom"}</Label>
                  <Select value={selectedClassCode} onValueChange={setSelectedClassCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={th ? "เลือกรหัสห้อง" : "Select class code"} />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClassrooms.map((room) => (
                        <SelectItem key={room.code} value={room.code}>
                          {room.gradeRoom} ({room.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{th ? "หัวข้อ" : "Title"}</Label>
                  <Input
                    placeholder={
                      th ? "ประกาศประจำสัปดาห์, เตือนความจำ, เอกสาร..." : "Weekly update, reminder, materials..."
                    }
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{th ? "ข้อความ" : "Message"}</Label>
                  <Textarea
                    placeholder={th ? "พิมพ์ข้อความถึงห้องเรียน..." : "Write your classroom message..."}
                    className="min-h-[120px]"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>
                <Button
                  className="w-full rounded-xl"
                  disabled={!selectedClassCode || !message.trim() || isSending}
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? (th ? "กำลังส่ง..." : "Sending...") : th ? "ส่งถึงห้องเรียน" : "Send to classroom"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{th ? "ข้อความล่าสุด" : "Recent Messages"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {messages.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                    {th ? "ยังไม่มีข้อความในห้องเรียนนี้" : "No messages yet in this classroom."}
                  </div>
                )}

                {messages.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.01, 0.08) }}
                    className="rounded-xl border border-border p-3"
                  >
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {item.teacherName} • {formatDateThai(item.createdAt, settings.language)}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeacherInbox;
