import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Clock, Send, PlayCircle, ListChecks, Undo2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, formatDateThai, getDeadlineStatus, getTaskStatusLabel, TaskStatus } from "@/lib";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "@/components/ui/use-toast";

const STATUS = {
  notStarted: "Not started",
  doing: "In progress",
  ready: "Ready to submit",
  pendingReview: "Waiting review",
  submitted: "Submitted",
  returned: "Returned",
} as const;

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, hasClassAccess, getAssignmentById, updateTaskStatus } = useTasks();

  const task = useMemo(() => tasks.find((item) => item.id === id), [id, tasks]);
  const assignment = useMemo(() => getAssignmentById(id), [getAssignmentById, id]);

  if (!hasClassAccess) {
    return (
      <Layout>
        <div className="py-20 text-center space-y-3">
          <p className="text-lg font-semibold">Classroom access is required.</p>
          <p className="text-sm text-muted-foreground">Join your class first to open this assignment.</p>
          <Button onClick={() => navigate("/class-code")}>Join classroom</Button>
        </div>
      </Layout>
    );
  }

  if (!task || !assignment) {
    return (
      <Layout>
        <div className="py-20 text-center space-y-3">
          <p className="text-lg font-semibold">Assignment not found.</p>
          <Button onClick={() => navigate("/workspace")}>Back to Workspace</Button>
        </div>
      </Layout>
    );
  }

  const deadlineStatus = getDeadlineStatus(task.deadline);
  const currentStatus = task.status as string;

  const onStart = () => {
    updateTaskStatus(task.id, STATUS.doing as TaskStatus);
    toast({ title: "Status updated", description: "Task moved to in-progress." });
  };

  const onReady = () => {
    updateTaskStatus(task.id, STATUS.ready as TaskStatus);
    toast({ title: "Status updated", description: "Task is ready to submit." });
  };

  const onSubmit = () => {
    updateTaskStatus(task.id, STATUS.pendingReview as TaskStatus);
    toast({ title: "Submitted", description: "Waiting for teacher review." });
  };

  const onCancelSubmission = () => {
    updateTaskStatus(task.id, STATUS.ready as TaskStatus);
    toast({ title: "Submission canceled", description: "You can edit and submit again." });
  };

  return (
    <Layout>
      <div className="pb-32">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{task.title}</h1>
            <p className="text-sm text-muted-foreground">{task.subject}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className={`border-none shadow-sm ${getStatusColor(task.status)}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 opacity-70" />
                <span className="font-medium">Current status: {getTaskStatusLabel(task.status)}</span>
              </div>
              {task.assignedBy && <Badge variant="outline">{task.assignedBy}</Badge>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white/50">
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Deadline
                </span>
                <span className={`text-sm font-semibold ${deadlineStatus.color}`}>{formatDateThai(task.deadline)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Send className="w-3 h-3" /> Channel
                </span>
                <span className="text-sm font-semibold text-primary">{assignment.submission.channel}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><b>Title:</b> {assignment.assignmentInfo.title}</p>
              <p><b>Subject:</b> {assignment.assignmentInfo.subject}</p>
              <p><b>Target class:</b> {assignment.assignmentInfo.targetGradeRooms.join(", ") || "-"}</p>
              <p><b>Description:</b> {assignment.assignmentInfo.shortDescription || "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Steps</p>
                <ol className="list-decimal pl-5 space-y-1">
                  {assignment.taskBrief.steps.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="font-semibold mb-1">Checklist</p>
                <ul className="list-disc pl-5 space-y-1">
                  {assignment.taskBrief.checklist.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {assignment.deliverables.items.map((item, idx) => (
                <div key={idx} className="rounded-xl border p-3 space-y-1">
                  <p className="font-semibold">{item.name}</p>
                  <p>Submit type: {item.submitType}</p>
                  <p>Formats: {item.acceptedFormats.join(", ")}</p>
                  <p>Requirement: {item.requirement}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-40">
          <div className="max-w-md mx-auto space-y-3">
            {currentStatus === STATUS.notStarted && (
              <Button className="w-full h-12 rounded-xl" onClick={onStart}>
                <PlayCircle className="mr-2 w-4 h-4" /> Start task
              </Button>
            )}

            {(currentStatus === STATUS.doing || currentStatus === STATUS.returned) && (
              <Button className="w-full h-12 rounded-xl" onClick={onReady}>
                <ListChecks className="mr-2 w-4 h-4" /> Mark ready
              </Button>
            )}

            {currentStatus === STATUS.ready && (
              <Button className="w-full h-12 rounded-xl" onClick={onSubmit}>
                <Send className="mr-2 w-4 h-4" /> Confirm submit
              </Button>
            )}

            {(currentStatus === STATUS.pendingReview || currentStatus === STATUS.submitted) && (
              <>
                <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl text-center">
                  <p className="font-bold text-secondary">Submission sent</p>
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl" onClick={onCancelSubmission}>
                  <Undo2 className="mr-2 w-4 h-4" /> Cancel submission
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskDetail;

