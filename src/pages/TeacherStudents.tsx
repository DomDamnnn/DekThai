import React, { useEffect, useMemo, useState } from "react";
import { GraduationCap, Mail, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSettings } from "@/hooks/useAppSettings";

type StudentCard = {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  school?: string;
  grade?: string;
  classCode?: string;
};

const TeacherStudents: React.FC = () => {
  const navigate = useNavigate();
  const { isTeacher } = useTeacherGuard();
  const { teacherClassrooms, getClassroomMembers, accounts, ROUTE_PATHS } = useAuth();
  const { settings } = useAppSettings();
  const th = settings.language === "th";

  const [selectedClassCode, setSelectedClassCode] = useState("");

  useEffect(() => {
    if (!selectedClassCode && teacherClassrooms[0]) {
      setSelectedClassCode(teacherClassrooms[0].code);
    }
  }, [selectedClassCode, teacherClassrooms]);

  const roomByCode = useMemo(
    () => new Map(teacherClassrooms.map((room) => [room.code, room])),
    [teacherClassrooms]
  );

  const students = useMemo(() => {
    if (!selectedClassCode) return [] as StudentCard[];
    const roomMembers = getClassroomMembers(selectedClassCode).students;
    const map = new Map<string, StudentCard>();

    roomMembers.forEach((member) => {
      const profile = accounts.find((account) => account.id === member.userId);
      map.set(member.userId, {
        userId: member.userId,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        school: profile?.school,
        grade: profile?.grade,
        classCode: selectedClassCode,
      });
    });

    const selectedUpper = selectedClassCode.toUpperCase();
    accounts.forEach((account) => {
      if (account.role !== "student") return;
      if ((account.classCode || "").toUpperCase() !== selectedUpper) return;
      if (map.has(account.id)) return;
      map.set(account.id, {
        userId: account.id,
        name: account.nickname,
        email: account.email,
        avatar: account.avatar,
        school: account.school,
        grade: account.grade,
        classCode: account.classCode,
      });
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts, getClassroomMembers, selectedClassCode]);

  if (!isTeacher) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 space-y-5">
        <div className="pt-6 space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {th ? "รายชื่อนักเรียน" : "Student Directory"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {th
              ? "ดูรายชื่อนักเรียนแยกตามห้องเรียน และข้อมูลโปรไฟล์สำคัญ"
              : "View student list by classroom and access key profile details."}
          </p>
        </div>

        {teacherClassrooms.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                {th
                  ? "ยังไม่มีห้องเรียนที่เชื่อมไว้ กรุณาสร้างห้องก่อนจัดการนักเรียน"
                  : "No linked classrooms yet. Create one before managing students."}
              </p>
              <Button
                className="rounded-xl"
                onClick={() => navigate(ROUTE_PATHS.TEACHER_CLASSROOMS)}
              >
                {th ? "ไปหน้าห้องเรียน" : "Open classrooms page"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{th ? "ห้องเรียน" : "Classroom"}</p>
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
                <div className="text-xs text-muted-foreground">
                  {roomByCode.get(selectedClassCode)?.school || "-"}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {th ? `นักเรียน (${students.length})` : `Students (${students.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground text-center">
                    {th ? "ยังไม่มีนักเรียนเข้าห้องเรียนนี้" : "No students joined this classroom yet."}
                  </div>
                )}

                {students.map((student) => (
                  <div key={student.userId} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{student.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {student.grade || "-"}
                      </Badge>
                      <Badge variant="secondary">{student.school || "-"}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeacherStudents;
