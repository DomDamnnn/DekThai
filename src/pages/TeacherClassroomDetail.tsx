import React, { useMemo } from "react";
import { ArrowLeft, ClipboardCopy, ClipboardList, School, UserCheck, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTE_PATHS } from "@/lib";
import { useLocale } from "@/hooks/useLocale";

const TeacherClassroomDetail: React.FC = () => {
  const navigate = useNavigate();
  const { classCode } = useParams<{ classCode: string }>();
  const { isTeacher } = useTeacherGuard();
  const { teacherClassrooms, getClassroomMembers } = useAuth();
  const { assignments } = useTasks();
  const { toast } = useToast();
  const { tx } = useLocale();

  const normalizedCode = decodeURIComponent(classCode || "").trim().toUpperCase();
  const room = teacherClassrooms.find((item) => item.code.toUpperCase() === normalizedCode) || null;

  const roomStats = useMemo(() => {
    if (!room) return { teachers: 0, students: 0, assignments: 0 };
    const members = getClassroomMembers(room.code);
    const assignmentCount = assignments.filter((assignment) =>
      assignment.assignmentInfo.targetClassCodes.some(
        (targetCode) => targetCode.toUpperCase() === room.code.toUpperCase()
      )
    ).length;

    return {
      teachers: members.teachers.length,
      students: members.students.length,
      assignments: assignmentCount,
    };
  }, [assignments, getClassroomMembers, room]);

  const handleCopyCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      toast({
        title: tx("คัดลอกรหัสห้องแล้ว", "Copied class code"),
        description: room.code,
      });
    } catch {
      toast({
        title: tx("คัดลอกไม่สำเร็จ", "Copy failed"),
        description: tx("ไม่สามารถเข้าถึงคลิปบอร์ดได้", "Clipboard access is unavailable."),
        variant: "destructive",
      });
    }
  };

  if (!isTeacher) return null;

  if (!room) {
    return (
      <Layout>
        <div className="max-w-md mx-auto pb-24 pt-6 space-y-4">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => navigate(ROUTE_PATHS.TEACHER_CLASSROOMS)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tx("กลับหน้าห้องเรียน", "Back to classrooms")}
          </Button>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {tx("ไม่พบข้อมูลห้องเรียนนี้", "Classroom not found.")}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 pt-6 space-y-4">
        <Button
          variant="ghost"
          className="px-2"
          onClick={() => navigate(ROUTE_PATHS.TEACHER_CLASSROOMS)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {tx("กลับหน้าห้องเรียน", "Back to classrooms")}
        </Button>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              {room.gradeRoom}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{room.school}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-xs text-muted-foreground">{tx("รหัสห้อง", "Class code")}</p>
                <p className="font-semibold">{room.code}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={handleCopyCode}>
                <ClipboardCopy className="w-4 h-4 mr-1" />
                {tx("คัดลอกรหัส", "Copy")}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Badge variant="outline" className="justify-center py-2 gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                {tx("ครู", "Teachers")} {roomStats.teachers}
              </Badge>
              <Badge variant="outline" className="justify-center py-2 gap-1">
                <Users className="w-3.5 h-3.5" />
                {tx("นักเรียน", "Students")} {roomStats.students}
              </Badge>
              <Badge variant="outline" className="justify-center py-2 gap-1">
                <ClipboardList className="w-3.5 h-3.5" />
                {tx("งานที่สั่ง", "Assignments")} {roomStats.assignments}
              </Badge>
            </div>

            <Button
              className="w-full rounded-xl"
              onClick={() =>
                navigate(`${ROUTE_PATHS.TEACHER_STUDENTS}?classCode=${encodeURIComponent(room.code)}`)
              }
            >
              {tx("ดูรายชื่อนักเรียน", "View student list")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherClassroomDetail;
