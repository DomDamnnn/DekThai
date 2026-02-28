import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, HelpCircle, ChevronLeft } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/hooks/useLocale';

const ClassCode: React.FC = () => {
  const navigate = useNavigate();
  const { student, joinClass, cancelJoinRequest, findClassroomByCode } = useAuth();
  const { toast } = useToast();
  const { tx } = useLocale();
  const [classCode, setClassCode] = useState('');
  const [isLeavingClassroom, setIsLeavingClassroom] = useState(false);

  const handleJoinClass = async (code: string) => {
    if (!student) {
      navigate(ROUTE_PATHS.LOGIN);
      return;
    }

    if (student.role === 'teacher') {
      toast({
        title: tx('บัญชีครู', 'Teacher account'),
        description: tx('บัญชีครูไม่ต้องเข้าร่วมห้องผ่านรหัสห้องเรียน', 'Teacher accounts do not need to join via class code.'),
      });
      navigate(ROUTE_PATHS.TEACHER_CLASSROOMS);
      return;
    }

    try {
      const found = await findClassroomByCode(code);

      if (!found) {
        toast({
          title: tx('ไม่พบรหัสห้องเรียน', 'Class code not found'),
          description: tx('กรุณาตรวจสอบรหัสและลองใหม่อีกครั้ง', 'Please check and try again.'),
          variant: 'destructive',
        });
        return;
      }

      await joinClass(found.code, { grade: found.gradeRoom, school: found.school });
      toast({
        title: tx('เข้าร่วมห้องเรียนสำเร็จ', 'Joined classroom'),
        description: tx(`คุณเข้าร่วม ${found.gradeRoom} แล้ว`, `You joined ${found.gradeRoom}.`),
      });
      navigate(ROUTE_PATHS.HOME);
    } catch (error: any) {
      toast({
        title: tx('เกิดข้อผิดพลาด', 'Error'),
        description: error?.message || tx('ไม่สามารถโหลดข้อมูลห้องเรียนได้', 'Unable to load classroom data.'),
        variant: 'destructive',
      });
    }
  };

  const handleLeaveClassroom = async () => {
    if (!student || student.role !== 'student' || !student.classCode || isLeavingClassroom) return;
    const confirmed = window.confirm(
      tx(
        `ต้องการออกจากห้อง ${student.classCode} หรือไม่? คุณสามารถเข้าร่วมใหม่ได้ตลอดด้วยรหัสห้องเรียน`,
        `Leave classroom ${student.classCode}? You can join again anytime using class code.`
      )
    );
    if (!confirmed) return;

    try {
      setIsLeavingClassroom(true);
      await cancelJoinRequest();
      toast({
        title: tx('ออกจากห้องเรียนแล้ว', 'Left classroom'),
        description: tx('ตอนนี้คุณสามารถเข้าร่วมห้องเรียนอื่นได้', 'You can now join another classroom.'),
      });
    } catch (error: any) {
      toast({
        title: tx('เกิดข้อผิดพลาด', 'Error'),
        description: error?.message || tx('ไม่สามารถออกจากห้องเรียนได้', 'Unable to leave classroom.'),
        variant: 'destructive',
      });
    } finally {
      setIsLeavingClassroom(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <School className="text-white w-12 h-12" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
                  <div className="bg-secondary/10 p-1 rounded-full">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{tx('เข้าร่วมห้องเรียน', 'Join Classroom')}</h1>
              <p className="text-muted-foreground">
                {tx('กรอกรหัสห้องเรียนที่ได้จากครู', 'Enter the class code from your teacher')}
                <br />
                {tx('เพื่อเชื่อมต่องานและวิชาของคุณ', 'to connect your tasks and subjects.')}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card p-6 rounded-[2rem] border border-border shadow-xl shadow-black/[0.03] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-4">
              {student?.role === 'student' && student.classCode && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">{tx('ห้องเรียนปัจจุบัน', 'Current classroom')}</p>
                  <p className="text-base font-bold tracking-wider">{student.classCode}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={handleLeaveClassroom}
                    disabled={isLeavingClassroom}
                  >
                    {isLeavingClassroom ? tx('กำลังออก...', 'Leaving...') : tx('ออกจากห้องเรียน', 'Leave classroom')}
                  </Button>
                </div>
              )}
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{tx('รหัสห้องเรียน', 'Class Code')}</h2>
                <p className="text-sm text-muted-foreground">
                  {tx('กรอกรหัสให้ตรงตามที่ครูส่งให้', 'Enter the code exactly as your teacher shared it.')}
                </p>
              </div>
              <Input
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="ABC-123"
                className="h-12 rounded-2xl text-base font-mono tracking-wider uppercase"
              />
              <Button
                className="w-full h-12 rounded-2xl"
                disabled={!classCode.trim()}
                onClick={() => handleJoinClass(classCode)}
              >
                {tx('เข้าร่วมห้องเรียน', 'Join classroom')}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 pt-4"
          >
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {tx('ต้องการความช่วยเหลือ?', 'Need help?')}
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="rounded-2xl h-14 flex items-center justify-center gap-3 border-dashed hover:bg-accent"
              >
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">{tx('ฉันยังไม่มีรหัสห้องเรียน', 'I do not have a class code')}</span>
              </Button>

              <Button
                variant="ghost"
                className="rounded-2xl h-12 text-muted-foreground hover:text-foreground"
                onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {tx('กลับไปแก้ไขข้อมูลโปรไฟล์', 'Back to edit profile info')}
              </Button>
            </div>
          </motion.div>

          <p className="text-[13px] text-center text-muted-foreground leading-relaxed px-4">
            {tx(
              'เมื่อเข้าร่วมห้องเรียนแล้ว งานที่ครูมอบหมายจะซิงก์อัตโนมัติ และ Priority AI จะจัดลำดับงานให้ทันที',
              'After joining classroom, assigned tasks are synced automatically and Priority AI can immediately rank your work.'
            )}
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ClassCode;

