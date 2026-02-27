import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ClipboardCheck, Copy, Plus, School, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSettings } from "@/hooks/useAppSettings";
import { ROUTE_PATHS } from "@/lib";

const TeacherClassrooms: React.FC = () => {
  const navigate = useNavigate();
  const { isTeacher, teacher } = useTeacherGuard();
  const { teacherClassrooms, createClassroom, assignTeacherToClassroom, getClassroomMembers } = useAuth();
  const { toast } = useToast();
  const { settings } = useAppSettings();
  const th = settings.language === "th";
  const createClassroomRef = useRef<HTMLDivElement | null>(null);
  const joinClassroomRef = useRef<HTMLDivElement | null>(null);

  const [gradeRoom, setGradeRoom] = useState("");
  const [school, setSchool] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [selectedClassCode, setSelectedClassCode] = useState("");
  const [coTeacherEmail, setCoTeacherEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (teacher && !school) {
      setSchool(teacher.school || "");
    }
  }, [school, teacher]);

  useEffect(() => {
    if (!selectedClassCode && teacherClassrooms[0]) {
      setSelectedClassCode(teacherClassrooms[0].code);
    }
  }, [selectedClassCode, teacherClassrooms]);

  const classroomStats = useMemo(() => {
    return teacherClassrooms.map((room) => {
      const members = getClassroomMembers(room.code);
      return {
        code: room.code,
        teachers: members.teachers.length,
        students: members.students.length,
      };
    });
  }, [getClassroomMembers, teacherClassrooms]);

  const totalStudents = classroomStats.reduce((sum, room) => sum + room.students, 0);
  const scrollToSection = (section: HTMLDivElement | null) => {
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateClassroom = async () => {
    if (!gradeRoom.trim()) return;
    try {
      setIsSubmitting(true);
      const room = await createClassroom({
        gradeRoom: gradeRoom.trim(),
        school: school.trim() || teacher?.school || "",
        code: customCode.trim() || undefined,
      });
      toast({
        title: th ? "สร้างห้องเรียนแล้ว" : "Classroom created",
        description: th
          ? `${room.gradeRoom} (${room.code}) พร้อมใช้งาน`
          : `${room.gradeRoom} (${room.code}) is ready.`,
      });
      setGradeRoom("");
      setCustomCode("");
      setSelectedClassCode(room.code);
    } catch (error: any) {
      toast({
        title: th ? "สร้างห้องเรียนไม่สำเร็จ" : "Cannot create classroom",
        description: error?.message || (th ? "กรุณาตรวจสอบข้อมูลแล้วลองใหม่" : "Please check your data and try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignCoTeacher = async () => {
    if (!selectedClassCode || !coTeacherEmail.trim()) return;
    try {
      setIsAssigning(true);
      const profile = await assignTeacherToClassroom({
        classCode: selectedClassCode,
        teacherEmail: coTeacherEmail.trim(),
      });
      toast({
        title: th ? "เพิ่มครูร่วมสอนแล้ว" : "Teacher assigned",
        description: th
          ? `${profile?.nickname || "ครู"} เข้าร่วมห้อง ${selectedClassCode} แล้ว`
          : `${profile?.nickname || "Teacher"} now joins ${selectedClassCode}.`,
      });
      setCoTeacherEmail("");
    } catch (error: any) {
      toast({
        title: th ? "ไม่สามารถเพิ่มครูร่วมสอนได้" : "Cannot assign teacher",
        description: error?.message || (th ? "กรุณาตรวจสอบอีเมลครูอีกครั้ง" : "Please verify the teacher email."),
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: th ? "คัดลอกแล้ว" : "Copied",
        description: th
          ? `คัดลอกรหัสห้อง ${code} แล้ว`
          : `Class code ${code} copied to clipboard.`,
      });
    } catch {
      toast({
        title: th ? "คัดลอกไม่สำเร็จ" : "Copy failed",
        description: th ? "ไม่สามารถเข้าถึงคลิปบอร์ดได้" : "Clipboard access is unavailable.",
        variant: "destructive",
      });
    }
  };

  if (!isTeacher || !teacher) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 space-y-5">
        <div className="pt-6 space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <School className="w-6 h-6 text-primary" />
            {th ? "ห้องเรียนของครู" : "Teacher Classrooms"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {th
              ? "สร้างห้องเรียน แชร์รหัสห้อง และจัดการครูร่วมสอน"
              : "Create classrooms, share class codes, and manage co-teachers."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Card className="border-none shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{th ? "ห้องเรียน" : "Classrooms"}</p>
              <p className="text-xl font-bold">{teacherClassrooms.length}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{th ? "นักเรียน" : "Students"}</p>
              <p className="text-xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{th ? "รายวิชา" : "Subject"}</p>
              <p className="text-sm font-semibold truncate">{teacher.subject || (th ? "ทั่วไป" : "General")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-[76px] rounded-xl flex flex-col items-center justify-center gap-2 px-2 py-3 text-xs whitespace-normal text-center"
            onClick={() => scrollToSection(createClassroomRef.current)}
          >
            <Plus className="w-4 h-4" />
            {th ? "สร้างห้องเรียน" : "Create classroom"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-[76px] rounded-xl flex flex-col items-center justify-center gap-2 px-2 py-3 text-xs whitespace-normal text-center"
            onClick={() => scrollToSection(joinClassroomRef.current)}
          >
            <Building2 className="w-4 h-4" />
            {th ? "เข้าร่วมห้องเรียน" : "Join classroom"}
          </Button>
          <Button
            type="button"
            className="h-auto min-h-[76px] rounded-xl flex flex-col items-center justify-center gap-2 px-2 py-3 text-xs whitespace-normal text-center"
            onClick={() => navigate(ROUTE_PATHS.TEACHER_ASSIGNMENTS)}
          >
            <ClipboardCheck className="w-4 h-4" />
            {th ? "สร้างงาน" : "Create assignment"}
          </Button>
        </div>

        <div ref={createClassroomRef}>
          <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              {th ? "สร้างห้องเรียน" : "Create Classroom"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>{th ? "ระดับชั้น / ห้อง" : "Grade / Room"}</Label>
              <Input
                placeholder={th ? "ม.4/1 หรือ Grade 10-A" : "M.4/1 or Grade 10-A"}
                value={gradeRoom}
                onChange={(event) => setGradeRoom(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{th ? "โรงเรียน" : "School"}</Label>
              <Input
                placeholder={th ? "ชื่อโรงเรียน" : "School name"}
                value={school}
                onChange={(event) => setSchool(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>{th ? "รหัสห้องแบบกำหนดเอง (ไม่บังคับ)" : "Custom Class Code (optional)"}</Label>
              <Input
                placeholder="ABC-123"
                value={customCode}
                onChange={(event) => setCustomCode(event.target.value.toUpperCase())}
              />
            </div>
            <Button
              className="w-full rounded-xl"
              disabled={!gradeRoom.trim() || isSubmitting}
              onClick={handleCreateClassroom}
            >
              {isSubmitting ? (th ? "กำลังสร้าง..." : "Creating...") : th ? "สร้างห้องเรียน" : "Create classroom"}
            </Button>
          </CardContent>
          </Card>
        </div>

        <div ref={joinClassroomRef}>
          <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              {th ? "เพิ่มครูร่วมสอน" : "Assign Co-teacher"}
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
              <Label>{th ? "อีเมลครู" : "Teacher Email"}</Label>
              <Input
                placeholder="teacher@school.ac.th"
                value={coTeacherEmail}
                onChange={(event) => setCoTeacherEmail(event.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              disabled={!selectedClassCode || !coTeacherEmail.trim() || isAssigning}
              onClick={handleAssignCoTeacher}
            >
              {isAssigning ? (th ? "กำลังเพิ่ม..." : "Assigning...") : th ? "เพิ่มครูร่วมสอน" : "Assign co-teacher"}
            </Button>
          </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {teacherClassrooms.map((room, index) => {
            const stats = classroomStats.find((item) => item.code === room.code);
            return (
              <motion.div
                key={room.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{room.gradeRoom}</p>
                        <p className="text-xs text-muted-foreground">{room.school}</p>
                      </div>
                      <Badge variant="secondary">{room.code}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {th ? `ครู ${stats?.teachers || 0}` : `Teachers ${stats?.teachers || 0}`}
                      </Badge>
                      <Badge variant="outline">
                        {th ? `นักเรียน ${stats?.students || 0}` : `Students ${stats?.students || 0}`}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleCopyCode(room.code)}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        {th ? "คัดลอกรหัส" : "Copy code"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherClassrooms;
