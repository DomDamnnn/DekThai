import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar as CalendarIcon, CheckCircle2, Clock, Flag, Megaphone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { AssignmentRecord, getTaskStatusLabel } from "@/lib";

const pad2 = (value: number) => String(value).padStart(2, "0");

const toLocalDateKey = (input: Date | string) => {
  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) return "";
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
};

const formatDateHeader = (value?: Date) => {
  if (!value) return "Select a date";
  return value.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
};

const CalendarPage: React.FC = () => {
  const { tasks, assignments } = useTasks();
  const { student } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const isTeacher = student?.role === "teacher";
  const selectedDateKey = selectedDate ? toLocalDateKey(selectedDate) : "";

  const assignmentGroups = useMemo(() => {
    const assigned: Record<string, AssignmentRecord[]> = {};
    const deadlines: Record<string, AssignmentRecord[]> = {};

    assignments.forEach((assignment) => {
      const assignedKey = toLocalDateKey(assignment.createdAt);
      if (assignedKey) {
        if (!assigned[assignedKey]) assigned[assignedKey] = [];
        assigned[assignedKey].push(assignment);
      }

      const deadlineKey = toLocalDateKey(assignment.submission.deadline);
      if (deadlineKey) {
        if (!deadlines[deadlineKey]) deadlines[deadlineKey] = [];
        deadlines[deadlineKey].push(assignment);
      }
    });

    return { assigned, deadlines };
  }, [assignments]);

  const tasksOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const key = toLocalDateKey(selectedDate);
    return tasks
      .filter((task) => toLocalDateKey(task.deadline) === key)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [selectedDate, tasks]);

  const assignmentsAssignedOnSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return [...(assignmentGroups.assigned[selectedDateKey] || [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [assignmentGroups.assigned, selectedDateKey]);

  const assignmentsDueOnSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return [...(assignmentGroups.deadlines[selectedDateKey] || [])].sort(
      (a, b) => new Date(a.submission.deadline).getTime() - new Date(b.submission.deadline).getTime()
    );
  }, [assignmentGroups.deadlines, selectedDateKey]);

  return (
    <Layout>
      <div className="flex flex-col gap-5 pb-24">
        <section className="pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{isTeacher ? "Teacher Calendar" : "My Calendar"}</h1>
            <p className="text-sm text-muted-foreground">
              {isTeacher
                ? "Tap a day to see assignments posted and deadlines."
                : "Tap a day to see assigned work and deadlines."}
            </p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
        </section>

        <Card className="border-none shadow-sm overflow-hidden rounded-[24px]">
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
              modifiers={{
                assignedDay: (date) => Boolean(assignmentGroups.assigned[toLocalDateKey(date)]),
                deadlineDay: (date) => Boolean(assignmentGroups.deadlines[toLocalDateKey(date)]),
              }}
              modifiersClassNames={{
                assignedDay:
                  "relative before:absolute before:top-1 before:left-1/2 before:-translate-x-1/2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary",
                deadlineDay:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-destructive",
              }}
            />
            <div className="w-full flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Assigned date
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Deadline
              </span>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{formatDateHeader(selectedDate)}</h2>
            <Badge variant="secondary" className="rounded-full">
              {isTeacher ? assignmentsDueOnSelectedDate.length : tasksOnSelectedDate.length} item(s)
            </Badge>
          </div>

          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                {isTeacher ? "Assignments posted on this day" : "Work assigned on this day"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignmentsAssignedOnSelectedDate.length > 0 ? (
                assignmentsAssignedOnSelectedDate.map((assignment) => (
                  <Link key={`assigned-${assignment.id}`} to={`/task/${assignment.id}`}>
                    <div className="rounded-xl border border-border p-3 hover:bg-accent/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{assignment.assignmentInfo.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {assignment.assignmentInfo.subject} • {assignment.assignmentInfo.targetClassCodes.join(", ")}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[11px]">
                          {formatTime(assignment.createdAt)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No assignments were posted on this date.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Flag className="w-4 h-4 text-destructive" />
                {isTeacher ? "Deadlines on this day" : "My deadlines on this day"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isTeacher ? (
                assignmentsDueOnSelectedDate.length > 0 ? (
                  assignmentsDueOnSelectedDate.map((assignment) => (
                    <Link key={`deadline-${assignment.id}`} to={`/task/${assignment.id}`}>
                      <div className="rounded-xl border border-border p-3 hover:bg-accent/40 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{assignment.assignmentInfo.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {assignment.assignmentInfo.subject} • {assignment.assignmentInfo.targetClassCodes.join(", ")}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[11px]">
                            {formatTime(assignment.submission.deadline)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No deadlines on this date.</p>
                )
              ) : tasksOnSelectedDate.length > 0 ? (
                tasksOnSelectedDate.map((task) => (
                  <Link key={task.id} to={`/task/${task.id}`}>
                    <div className="rounded-xl border border-border p-3 hover:bg-accent/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{task.title}</p>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {task.subject}
                            </span>
                            <span>{getTaskStatusLabel(task.status)}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[11px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(task.deadline)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-3 text-sm text-muted-foreground inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  No deadline items on this date.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default CalendarPage;
