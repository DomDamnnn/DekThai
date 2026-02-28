import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  School,
  Mail,
  GraduationCap,
  BookOpenCheck,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ROUTE_PATHS } from '@/lib';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocale } from '@/hooks/useLocale';

type MemberCard = {
  userId: string;
  role: 'teacher' | 'student';
  name: string;
  email: string;
  avatar?: string;
  school?: string;
  grade?: string;
  subject?: string;
};

const GroupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    student,
    accounts,
    teacherClassrooms,
    getClassroomMembers,
    cancelJoinRequest,
  } = useAuth();
  const { toast } = useToast();
  const { tx } = useLocale();

  const [selectedClassCode, setSelectedClassCode] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberCard | null>(null);
  const [isLeavingClassroom, setIsLeavingClassroom] = useState(false);

  const availableClassCodes = useMemo(() => {
    if (!student) return [];
    if (student.role === 'teacher') {
      const fromRooms = teacherClassrooms.map((room) => room.code);
      const fromProfile = [...(student.managedClassCodes || []), ...(student.assignedClassCodes || [])];
      return Array.from(new Set([...fromRooms, ...fromProfile].filter(Boolean)));
    }
    return student.classCode ? [student.classCode] : [];
  }, [student, teacherClassrooms]);

  useEffect(() => {
    if (!student || student.role !== 'teacher') return;
    if (!selectedClassCode && availableClassCodes[0]) {
      setSelectedClassCode(availableClassCodes[0]);
    }
  }, [availableClassCodes, selectedClassCode, student]);

  const activeClassCode = useMemo(() => {
    if (!student) return '';
    if (student.role === 'teacher') return selectedClassCode || availableClassCodes[0] || '';
    return student.classCode || '';
  }, [availableClassCodes, selectedClassCode, student]);

  const managedMembers = useMemo(() => {
    if (!activeClassCode) {
      return { teachers: [], students: [] };
    }
    return getClassroomMembers(activeClassCode);
  }, [activeClassCode, getClassroomMembers]);

  const members = useMemo(() => {
    if (!activeClassCode) return [];
    const activeCode = activeClassCode.toUpperCase();
    const map = new Map<string, MemberCard>();

    const addMember = (member: MemberCard) => {
      if (!member.userId) return;
      if (!map.has(member.userId)) {
        map.set(member.userId, member);
      }
    };

    managedMembers.teachers.forEach((member) => {
      const profile = accounts.find((acc) => acc.id === member.userId);
      addMember({
        userId: member.userId,
        role: 'teacher',
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        school: profile?.school,
        grade: profile?.grade,
        subject: profile?.subject,
      });
    });

    managedMembers.students.forEach((member) => {
      const profile = accounts.find((acc) => acc.id === member.userId);
      addMember({
        userId: member.userId,
        role: 'student',
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        school: profile?.school,
        grade: profile?.grade,
      });
    });

    accounts.forEach((account) => {
      if (account.role === 'student') {
        if ((account.classCode || '').toUpperCase() !== activeCode) return;
        addMember({
          userId: account.id,
          role: 'student',
          name: account.nickname,
          email: account.email,
          avatar: account.avatar,
          school: account.school,
          grade: account.grade,
        });
        return;
      }

      const teacherCodes = new Set(
        [...(account.managedClassCodes || []), ...(account.assignedClassCodes || [])].map((code) =>
          code.toUpperCase()
        )
      );
      if (!teacherCodes.has(activeCode)) return;
      addMember({
        userId: account.id,
        role: 'teacher',
        name: account.nickname,
        email: account.email,
        avatar: account.avatar,
        school: account.school,
        grade: account.grade,
        subject: account.subject,
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.role !== b.role) return a.role === 'teacher' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [accounts, activeClassCode, managedMembers.students, managedMembers.teachers]);

  const teacherCount = members.filter((member) => member.role === 'teacher').length;
  const studentCount = members.filter((member) => member.role === 'student').length;

  const handleLeaveClassroom = async () => {
    if (!student || student.role !== 'student' || !activeClassCode || isLeavingClassroom) return;
    const confirmed = window.confirm(
      tx(
        `ต้องการออกจากห้อง ${activeClassCode} หรือไม่? คุณสามารถเข้าร่วมใหม่ภายหลังได้ด้วยรหัสห้อง`,
        `Leave classroom ${activeClassCode}? You can rejoin later with class code.`
      )
    );
    if (!confirmed) return;

    try {
      setIsLeavingClassroom(true);
      await cancelJoinRequest();
      toast({
        title: tx('ออกจากห้องเรียนแล้ว', 'Left classroom'),
        description: tx(`คุณออกจาก ${activeClassCode} แล้ว`, `You have left ${activeClassCode}.`),
      });
    } catch (error: any) {
      toast({
        title: tx('ไม่สามารถออกจากห้องเรียนได้', 'Unable to leave classroom'),
        description: error?.message || tx('กรุณาลองอีกครั้ง', 'Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsLeavingClassroom(false);
    }
  };

  if (!student) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 space-y-5">
        <div className="pt-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <School className="w-6 h-6 text-primary" />
            {tx('ห้องเรียน', 'Classroom')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tx('ดูสมาชิกทั้งหมด และแตะเพื่อดูรายละเอียดโปรไฟล์', 'View all members and tap to see profile details in a popup.')}
          </p>
        </div>

        {student.role === 'teacher' && availableClassCodes.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{tx('เลือกห้องเรียน', 'Select classroom')}</p>
              <Select value={activeClassCode} onValueChange={setSelectedClassCode}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={tx('เลือกรหัสห้อง', 'Select class code')} />
                </SelectTrigger>
                <SelectContent>
                  {availableClassCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {!activeClassCode && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center space-y-3">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="font-semibold">{tx('ยังไม่มีห้องเรียนที่เชื่อมไว้', 'No linked classroom yet.')}</p>
              <p className="text-sm text-muted-foreground">
                {tx('เพิ่มรหัสห้องเรียนก่อน แล้วรายชื่อสมาชิกจะปรากฏที่นี่', 'Add your class code first, then member list will appear here.')}
              </p>
              <Button
                className="rounded-xl"
                onClick={() => navigate(ROUTE_PATHS.CLASS_CODE)}
              >
                {tx('ไปที่หน้ารหัสห้องเรียน', 'Go to Class Code')}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeClassCode && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{tx('รหัสห้องเรียน', 'Class Code')}</p>
                  <p className="text-lg font-bold tracking-wide">{activeClassCode}</p>
                </div>
                <Badge className="rounded-full bg-primary text-white">{members.length} {tx('คน', 'members')}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Badge variant="secondary">{tx('ครู', 'Teachers')} {teacherCount}</Badge>
                <Badge variant="outline">{tx('นักเรียน', 'Students')} {studentCount}</Badge>
              </div>
              {student.role === 'student' && (
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={handleLeaveClassroom}
                    disabled={isLeavingClassroom}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    {isLeavingClassroom ? tx('กำลังออก...', 'Leaving...') : tx('ออกจากห้องเรียน', 'Leave classroom')}
                  </Button>
                </div>
              )}
            </motion.div>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{tx('สมาชิกในห้องเรียน', 'Classroom Members')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    {tx('ยังไม่มีสมาชิกในห้องเรียนนี้', 'No members in this classroom yet.')}
                  </div>
                )}

                {members.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className="w-full rounded-2xl border border-border p-3 text-left hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{member.name}</p>
                          <Badge variant={member.role === 'teacher' ? 'secondary' : 'outline'}>
                            {member.role === 'teacher' ? tx('ครู', 'Teacher') : tx('นักเรียน', 'Student')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={Boolean(selectedMember)} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>{tx('รายละเอียดโปรไฟล์', 'Profile Detail')}</DialogTitle>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                    <AvatarFallback>{selectedMember.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{selectedMember.name}</p>
                    <Badge variant={selectedMember.role === 'teacher' ? 'secondary' : 'outline'}>
                      {selectedMember.role === 'teacher' ? tx('ครูผู้สอน', 'Subject Teacher') : tx('นักเรียน', 'Student')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{selectedMember.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <School className="w-4 h-4" />
                    <span>{selectedMember.school || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    <span>{selectedMember.grade || '-'}</span>
                  </div>
                  {selectedMember.subject && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpenCheck className="w-4 h-4" />
                      <span>{selectedMember.subject}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                  {tx('ข้อมูลในหน้าต่างนี้อ้างอิงจากโปรไฟล์ล่าสุดที่สมาชิกลงทะเบียนไว้', "This popup uses each member's latest registered profile data.")}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default GroupPage;
