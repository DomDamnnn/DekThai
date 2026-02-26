import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Info, 
  AlertCircle, 
  Send, 
  PlayCircle,
  CheckSquare,
  Paperclip,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Task, 
  TaskStatus, 
  ROUTE_PATHS, 
  getStatusColor, 
  formatDateThai, 
  getDeadlineStatus 
} from '@/lib/index';
import { mockTasks } from '@/data/index';
import { Layout } from '@/components/Layout';
import { PriorityCard } from '@/components/Cards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundTask = mockTasks.find(t => t.id === id);
    if (foundTask) {
      setTask(foundTask);
    } else {
      // Fallback if not found
      navigate(ROUTE_PATHS.WORKSPACE);
    }
  }, [id, navigate]);

  if (!task) return null;

  const deadlineStatus = getDeadlineStatus(task.deadline);

  const handleStartWork = () => {
    setTask(prev => prev ? ({ ...prev, status: 'กำลังทำ' }) : null);
    toast({
      title: "เริ่มทำงานแล้ว!",
      description: "ระบบตั้งสถานะงานเป็น 'กำลังทำ' และเปิดโหมดโฟกัสให้คุณ",
    });
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulating upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadedFile("work_v1_final.pdf");
      setTask(prev => prev ? ({ ...prev, status: 'พร้อมส่ง' }) : null);
      toast({
        title: "อัปโหลดสำเร็จ",
        description: "ไฟล์ของคุณถูกแนบเข้าระบบเรียบร้อยแล้ว",
      });
    }, 1500);
  };

  const handleSubmitTask = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTask(prev => prev ? ({ ...prev, status: 'รอตรวจ' }) : null);
      toast({
        title: "ส่งงานสำเร็จ!",
        description: "งานของคุณเข้าสู่ระบบรอครูตรวจสอบแล้ว",
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="pb-32">
        {/* Header Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{task.title}</h1>
            <p className="text-sm text-muted-foreground">{task.subject}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border-none shadow-sm ${getStatusColor(task.status)}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 opacity-70" />
                  <span className="font-medium">สถานะปัจจุบัน: {task.status}</span>
                </div>
                {task.status === 'ตีกลับ' && (
                  <Badge variant="destructive" className="animate-pulse">แก้ไขด่วน</Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Priority AI Reason */}
          {task.status !== 'ส่งแล้ว' && task.status !== 'รอตรวจ' && (
            <PriorityCard task={task} />
          )}

          {/* Task Summary Info */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none shadow-sm bg-white/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> กำหนดส่ง
                  </span>
                  <span className={`text-sm font-semibold ${deadlineStatus.color}`}>
                    {formatDateThai(task.deadline)}
                  </span>
                  <span className="text-[10px] opacity-70">({deadlineStatus.label})</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Send className="w-3 h-3" /> ช่องทางส่ง
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {task.channel}
                  </span>
                  <span className="text-[10px] opacity-70">{task.type === 'ไฟล์' ? 'ส่งไฟล์ดิจิทัล' : 'ส่งที่โรงเรียน'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Returned Reason if any */}
          {task.status === 'ตีกลับ' && task.returnedReason && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-destructive">เหตุผลที่ครูตีกลับงาน:</p>
                    <p className="text-sm text-foreground">{task.returnedReason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checklist / Instructions */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-primary">รายละเอียดและเกณฑ์งาน</h2>
            </div>
            <CardContent className="p-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" /> โจทย์งาน
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {task.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                </p>
              </div>

              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">ไฟล์แนบจากครู</h3>
                  <div className="space-y-2">
                    {task.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs truncate">{file}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-primary">ดาวน์โหลด</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> เกณฑ์การให้คะแนน (Rubric)
                </h3>
                <div className="bg-accent/30 p-3 rounded-xl border border-accent">
                  <p className="text-xs text-accent-foreground leading-relaxed italic whitespace-pre-line">
                    {task.rubric || "ครูยังไม่ได้กำหนดเกณฑ์คะแนนที่ชัดเจน"}
                  </p>
                </div>
              </div>

              {task.weight && (
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                  <span className="text-xs font-medium">น้ำหนักคะแนน</span>
                  <span className="text-sm font-bold text-primary">{task.weight} คะแนน</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-40">
          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {task.status === 'ยังไม่เริ่ม' ? (
                <motion.div 
                  key="start"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Button 
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-lg font-bold shadow-lg shadow-primary/20"
                    onClick={handleStartWork}
                  >
                    <PlayCircle className="mr-2 w-5 h-5" /> เริ่มทำเลย
                  </Button>
                </motion.div>
              ) : task.status === 'กำลังทำ' || task.status === 'ตีกลับ' ? (
                <motion.div 
                  key="doing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-3"
                >
                  <Button 
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-2 border-primary/20 font-bold"
                    onClick={handleFileUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? "กำลังโหลด..." : <><Upload className="mr-2 w-5 h-5" /> แนบไฟล์</>}
                  </Button>
                  <Button 
                    className="flex-1 h-14 rounded-2xl bg-muted font-bold cursor-not-allowed opacity-50"
                    disabled
                  >
                    ส่งงาน
                  </Button>
                </motion.div>
              ) : task.status === 'พร้อมส่ง' ? (
                <motion.div 
                  key="ready"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-secondary flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> แนบไฟล์สำเร็จ: {uploadedFile}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive" onClick={() => setUploadedFile(null)}>ยกเลิก</Button>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-lg font-bold shadow-lg shadow-secondary/30"
                    onClick={handleSubmitTask}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "กำลังส่ง..." : <><Send className="mr-2 w-5 h-5" /> ยืนยันการส่งงาน</>}
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="submitted"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                  <div className="text-center">
                    <p className="font-bold text-secondary">ส่งงานเรียบร้อยแล้ว</p>
                    <p className="text-[10px] text-muted-foreground">ส่งเมื่อ {formatDateThai(new Date().toISOString())}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* External Channel Notice */}
        {task.channel === 'Google Classroom' && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-700">ส่งผ่าน Google Classroom</p>
              <p className="text-xs text-blue-600">งานนี้ต้องส่งผ่านระบบของโรงเรียน หลังจากส่งในนั้นแล้ว อย่าลืมมากด "ทำเสร็จแล้ว" ใน DekThai เพื่อรักษาสถิติความต่อเนื่องของคุณ!</p>
              <Button variant="link" className="p-0 h-auto text-xs text-blue-800 underline mt-2">เปิด Google Classroom</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TaskDetail;