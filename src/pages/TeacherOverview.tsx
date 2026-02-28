import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, School, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useTeacherGuard } from "@/hooks/useTeacherGuard";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ROUTE_PATHS } from "@/lib";
import { useLocale } from "@/hooks/useLocale";

const METRIC_COLORS = ["#2563eb", "#16a34a", "#f59e0b"];

const TeacherOverview: React.FC = () => {
  const navigate = useNavigate();
  const { isTeacher } = useTeacherGuard();
  const { teacherClassrooms, getClassroomMembers } = useAuth();
  const { assignments } = useTasks();
  const { tx } = useLocale();
  const metricChartConfig = useMemo(
    () => ({
      value: {
        label: tx("จำนวน", "Count"),
        color: "hsl(var(--primary))",
      },
    }),
    [tx]
  );

  const [selectedClassCode, setSelectedClassCode] = useState("");

  const roomSummaries = useMemo(() => {
    return teacherClassrooms.map((room) => {
      const members = getClassroomMembers(room.code);
      const assignmentCount = assignments.filter((assignment) =>
        assignment.assignmentInfo.targetClassCodes.some(
          (targetCode) => targetCode.toUpperCase() === room.code.toUpperCase()
        )
      ).length;

      return {
        code: room.code,
        gradeRoom: room.gradeRoom,
        school: room.school,
        students: members.students.length,
        teachers: members.teachers.length,
        assignments: assignmentCount,
      };
    });
  }, [assignments, getClassroomMembers, teacherClassrooms]);

  useEffect(() => {
    if (!selectedClassCode && roomSummaries[0]) {
      setSelectedClassCode(roomSummaries[0].code);
      return;
    }

    if (
      selectedClassCode &&
      !roomSummaries.some((room) => room.code.toUpperCase() === selectedClassCode.toUpperCase())
    ) {
      setSelectedClassCode(roomSummaries[0]?.code || "");
    }
  }, [roomSummaries, selectedClassCode]);

  const selectedRoom = useMemo(
    () => roomSummaries.find((room) => room.code.toUpperCase() === selectedClassCode.toUpperCase()) || null,
    [roomSummaries, selectedClassCode]
  );

  const metricChartData = useMemo(() => {
    if (!selectedRoom) return [] as Array<{ label: string; value: number; color: string }>;

    return [
      { label: tx("ครู", "Teachers"), value: selectedRoom.teachers, color: METRIC_COLORS[0] },
      { label: tx("นักเรียน", "Students"), value: selectedRoom.students, color: METRIC_COLORS[1] },
      { label: tx("งานที่สั่ง", "Assignments"), value: selectedRoom.assignments, color: METRIC_COLORS[2] },
    ];
  }, [selectedRoom]);

  if (!isTeacher) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24 space-y-5">
        <div className="pt-6 space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {tx("หน้าหลักครู", "Teacher Home")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tx(
              "เลือกห้องเรียนเพื่อดูภาพรวมของห้องนั้นแบบละเอียด",
              "Select a classroom to view a focused summary."
            )}
          </p>
        </div>

        {roomSummaries.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {tx("ยังไม่มีห้องเรียน กรุณาเพิ่มห้องเรียนก่อนดูภาพรวม", "No classrooms yet. Add one to view insights.")}
              </p>
              <Button className="rounded-xl" onClick={() => navigate(ROUTE_PATHS.TEACHER_CLASSROOMS)}>
                {tx("ไปหน้าจัดการห้องเรียน", "Open classroom manager")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{tx("เลือกห้องเรียน", "Select classroom")}</p>
                <Select value={selectedClassCode} onValueChange={setSelectedClassCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={tx("เลือกรหัสห้อง", "Select class code")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roomSummaries.map((room) => (
                      <SelectItem key={room.code} value={room.code}>
                        {room.gradeRoom} ({room.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedRoom && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{tx("ครู", "Teachers")}</p>
                      <p className="text-xl font-bold">{selectedRoom.teachers}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{tx("นักเรียน", "Students")}</p>
                      <p className="text-xl font-bold">{selectedRoom.students}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{tx("งานที่สั่ง", "Assignments")}</p>
                      <p className="text-xl font-bold">{selectedRoom.assignments}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{selectedRoom.gradeRoom}</p>
                      <p className="text-xs text-muted-foreground">{selectedRoom.school}</p>
                    </div>
                    <Badge variant="secondary">{selectedRoom.code}</Badge>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{tx("กราฟสรุปห้องเรียน", "Classroom Summary Chart")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={metricChartConfig} className="h-64 w-full">
                      <BarChart data={metricChartData} margin={{ left: 0, right: 8 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis allowDecimals={false} width={28} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={8}>
                          {metricChartData.map((item, index) => (
                            <Cell key={item.label} fill={item.color || METRIC_COLORS[index % METRIC_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="rounded-xl"
                    onClick={() =>
                      navigate(`${ROUTE_PATHS.TEACHER_STUDENTS}?classCode=${encodeURIComponent(selectedRoom.code)}`)
                    }
                  >
                    <Users className="w-4 h-4 mr-1" />
                    {tx("ดูรายชื่อ", "View students")}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      navigate(
                        ROUTE_PATHS.TEACHER_CLASSROOM_DETAIL.replace(
                          ":classCode",
                          encodeURIComponent(selectedRoom.code)
                        )
                      )
                    }
                  >
                    <School className="w-4 h-4 mr-1" />
                    {tx("รายละเอียดห้อง", "Room details")}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeacherOverview;
