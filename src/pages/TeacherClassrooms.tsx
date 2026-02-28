import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, ClipboardCheck, Plus, School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ROUTE_PATHS } from "@/lib";
import { useLocale } from "@/hooks/useLocale";

const TeacherClassrooms: React.FC = () => {
  const navigate = useNavigate();
  const { isTeacher, teacher } = useTeacherGuard();
  const { teacherClassrooms, createClassroom, joinTeacherClassroom, getClassroomMembers } = useAuth();
  const { assignments } = useTasks();
  const { toast } = useToast();
  const { tx } = useLocale();

  const [isAddClassroomOpen, setIsAddClassroomOpen] = useState(false);
  const [activePopupMode, setActivePopupMode] = useState<"create" | "join">("create");
  const [gradeRoom, setGradeRoom] = useState("");
  const [school, setSchool] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [joinClassCode, setJoinClassCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (teacher && !school) {
      setSchool(teacher.school || "");
    }
  }, [school, teacher]);

  const classroomStats = useMemo(() => {
    return teacherClassrooms.map((room) => {
      const members = getClassroomMembers(room.code);
      const assignmentCount = assignments.filter((assignment) =>
        assignment.assignmentInfo.targetClassCodes.some(
          (targetCode) => targetCode.toUpperCase() === room.code.toUpperCase()
        )
      ).length;

      return {
        code: room.code,
        teachers: members.teachers.length,
        students: members.students.length,
        assignments: assignmentCount,
      };
    });
  }, [assignments, getClassroomMembers, teacherClassrooms]);

  const openClassroomDetail = (classCode: string) => {
    navigate(ROUTE_PATHS.TEACHER_CLASSROOM_DETAIL.replace(":classCode", encodeURIComponent(classCode)));
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
        title: tx("สร้างห้องเรียนแล้ว", "Classroom created"),
        description: tx(`${room.gradeRoom} (${room.code}) พร้อมใช้งาน`, `${room.gradeRoom} (${room.code}) is ready.`),
      });
      setGradeRoom("");
      setCustomCode("");
      setIsAddClassroomOpen(false);
      setActivePopupMode("create");
    } catch (error: any) {
      toast({
        title: tx("สร้างห้องเรียนไม่สำเร็จ", "Cannot create classroom"),
        description: error?.message || tx("กรุณาตรวจสอบข้อมูลแล้วลองใหม่", "Please check your data and try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!joinClassCode.trim()) return;
    try {
      setIsJoining(true);
      const room = await joinTeacherClassroom({ classCode: joinClassCode.trim() });
      toast({
        title: tx("เข้าร่วมห้องเรียนแล้ว", "Joined classroom"),
        description: tx(`เข้าร่วม ${room.gradeRoom} (${room.code}) สำเร็จ`, `You have joined ${room.gradeRoom} (${room.code}).`),
      });
      setJoinClassCode("");
      setIsAddClassroomOpen(false);
      setActivePopupMode("join");
    } catch (error: any) {
      toast({
        title: tx("เข้าร่วมห้องเรียนไม่สำเร็จ", "Cannot join classroom"),
        description: error?.message || tx("กรุณาตรวจสอบรหัสห้องแล้วลองใหม่", "Please verify class code and try again."),
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (!isTeacher || !teacher) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 space-y-5">
        <div className="pt-6 space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <School className="w-6 h-6 text-primary" />
            {tx("จัดการห้องเรียน", "Classroom Manager")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx("เลือกห้องเรียนเพื่อดูรายละเอียด หรือเพิ่มห้องใหม่จากปุ่มด้านล่าง", "Tap a classroom card to open details, or add a new classroom below.")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-[76px] rounded-xl flex flex-col items-center justify-center gap-2 px-2 py-3 text-xs whitespace-normal text-center"
            onClick={() => navigate(ROUTE_PATHS.TEACHER_OVERVIEW)}
          >
            <BarChart3 className="w-4 h-4" />
            {tx("หน้าหลัก", "Home")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-[76px] rounded-xl flex flex-col items-center justify-center gap-2 px-2 py-3 text-xs whitespace-normal text-center"
            onClick={() => setIsAddClassroomOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {tx("เพิ่มห้องเรียน", "Add classroom")}
          </Button>
          <Button
            type="button"
            className="h-auto min-h-[76px] rounded-xl flex flex-col items-center justify-center gap-2 px-2 py-3 text-xs whitespace-normal text-center"
            onClick={() => navigate(ROUTE_PATHS.TEACHER_ASSIGNMENTS)}
          >
            <ClipboardCheck className="w-4 h-4" />
            {tx("สร้างงาน", "Create assignment")}
          </Button>
        </div>

        {teacherClassrooms.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {tx("ยังไม่มีห้องเรียน กดปุ่มเพิ่มห้องเรียนเพื่อสร้างหรือเข้าร่วมห้อง", "No classrooms yet. Use Add classroom to create or join one.")}
              </p>
              <Button className="rounded-xl" onClick={() => setIsAddClassroomOpen(true)}>
                {tx("เพิ่มห้องเรียน", "Add classroom")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {teacherClassrooms.map((room, index) => {
              const stats = classroomStats.find((item) => item.code === room.code);
              return (
                <motion.button
                  key={room.code}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.015, 0.12) }}
                  onClick={() => openClassroomDetail(room.code)}
                  className="text-left"
                >
                  <Card className="border-none shadow-sm h-full aspect-square hover:shadow-md transition-shadow">
                    <CardContent className="p-4 h-full flex flex-col justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold leading-tight line-clamp-2">{room.gradeRoom}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{room.school}</p>
                      </div>

                      <div className="space-y-2">
                        <Badge variant="secondary" className="w-fit">{room.code}</Badge>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{tx("ครู", "Teachers")}: {stats?.teachers || 0}</p>
                          <p>{tx("นักเรียน", "Students")}: {stats?.students || 0}</p>
                          <p>{tx("งานที่สั่ง", "Assignments")}: {stats?.assignments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isAddClassroomOpen} onOpenChange={setIsAddClassroomOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tx("เพิ่มห้องเรียน", "Add classroom")}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={activePopupMode === "create" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setActivePopupMode("create")}
            >
              {tx("สร้างห้องเรียน", "Create")}
            </Button>
            <Button
              type="button"
              variant={activePopupMode === "join" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setActivePopupMode("join")}
            >
              {tx("เข้าร่วมห้อง", "Join")}
            </Button>
          </div>

          {activePopupMode === "create" ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{tx("ระดับชั้น / ห้อง", "Grade / Room")}</Label>
                <Input
                  placeholder={tx("ม.4/1 หรือ Grade 10-A", "M.4/1 or Grade 10-A")}
                  value={gradeRoom}
                  onChange={(event) => setGradeRoom(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>{tx("โรงเรียน", "School")}</Label>
                <Input
                  placeholder={tx("ชื่อโรงเรียน", "School name")}
                  value={school}
                  onChange={(event) => setSchool(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>{tx("รหัสห้องแบบกำหนดเอง (ไม่บังคับ)", "Custom class code (optional)")}</Label>
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
                {isSubmitting ? tx("กำลังสร้าง...", "Creating...") : tx("สร้างห้องเรียน", "Create classroom")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{tx("รหัสห้องเรียน", "Class code")}</Label>
                <Input
                  placeholder="ABC-123"
                  value={joinClassCode}
                  onChange={(event) => setJoinClassCode(event.target.value.toUpperCase())}
                />
              </div>
              <Button
                className="w-full rounded-xl"
                disabled={!joinClassCode.trim() || isJoining}
                onClick={handleJoinClassroom}
              >
                {isJoining ? tx("กำลังเข้าร่วม...", "Joining...") : tx("เข้าร่วมห้องเรียน", "Join classroom")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TeacherClassrooms;
