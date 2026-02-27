import { useCallback, useEffect, useMemo, useState } from "react";
import { AssignmentRecord, Student, Task, TaskStatus, TaskType, TeacherAssignmentRecord } from "@/lib";
import { AUTH_EVENT, getCurrentUser, readAuthState } from "@/lib/authStorage";
import {
  CLASSROOM_EVENT,
  getManagedClassroomByCode,
  listAssignmentRecords,
  listTeacherAssignments,
} from "@/lib/classroomStorage";

const STATUS_STORAGE_KEY = "dekthai_task_status_map_v3";
const COMPLETION_STORAGE_KEY = "dekthai_task_completions_v3";
const PRIORITY_OVERRIDE_STORAGE_KEY = "dekthai_task_priority_overrides_v2";
const TASKS_EVENT = "dekthai_tasks_updated";

type StatusMap = Record<string, TaskStatus>;
type CompletionMap = Record<string, string>;
type PriorityOverrideMap = Record<string, { priorityScore?: number; priorityReason?: string }>;

const DONE_STATUSES = ["ส่งแล้ว", "รอตรวจ"] as unknown as TaskStatus[];
const ACTIVE_STATUSES = ["ยังไม่เริ่ม", "กำลังทำ", "พร้อมส่ง", "ตีกลับ"] as unknown as TaskStatus[];

const readJSON = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const scopedStorageKey = (base: string, userId?: string) => `${base}:${userId || "guest"}`;

const calcPriorityScore = (deadline: string, weight = 0, estimatedMinutes = 30) => {
  const now = Date.now();
  const due = new Date(deadline).getTime();
  const hoursLeft = Math.max(1, (due - now) / (1000 * 60 * 60));
  const urgency = Math.max(0, 100 - Math.min(100, hoursLeft * 2));
  const weightScore = Math.min(30, weight * 3);
  const effortScore = Math.min(20, Math.round(estimatedMinutes / 10));
  return Math.min(100, Math.round(urgency + weightScore + effortScore));
};

const buildPriorityReason = (deadline: string) => {
  const hoursLeft = Math.round((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60));
  if (hoursLeft <= 24) return "Still have time - progress steadily";
  if (hoursLeft <= 72) return "Still have time - progress steadily";
  return "Still have time - progress steadily";
};

const durationToMinutes = (value: number) => (Number.isFinite(value) && value > 0 ? Math.round(value) : 30);

const detectTaskType = (assignment: AssignmentRecord): TaskType => {
  const first = assignment.deliverables.items[0];
  if (!first) return "ไฟล์" as unknown as TaskType;
  if (first.submitType === "link") return "ลิงก์" as unknown as TaskType;
  if (first.submitType === "text") return "กระดาษ" as unknown as TaskType;
  const formats = first.acceptedFormats.map((f) => f.toUpperCase());
  if (formats.some((f) => ["JPG", "JPEG", "PNG", "HEIC", "WEBP"].includes(f))) return "รูปถ่าย" as unknown as TaskType;
  return "ไฟล์" as unknown as TaskType;
};

const mapChannel = (channel: string): Task["channel"] => {
  const normalized = channel.toLowerCase();
  if (normalized.includes("classroom")) return "Google Classroom" as Task["channel"];
  if (normalized.includes("dekthai") || normalized.includes("แอป")) return "ในแอป" as unknown as Task["channel"];
  return "ส่งครูหน้าห้อง" as unknown as Task["channel"];
};

const dateKey = (isoString: string) => new Date(isoString).toISOString().slice(0, 10);

const computeStreaks = (completionMap: CompletionMap, tasksById: Map<string, Task>) => {
  const onTimeDays = new Set<string>();

  Object.entries(completionMap).forEach(([taskId, completedAt]) => {
    const task = tasksById.get(taskId);
    if (!task) return;
    if (new Date(completedAt).getTime() <= new Date(task.deadline).getTime()) {
      onTimeDays.add(dateKey(completedAt));
    }
  });

  const sortedDays = Array.from(onTimeDays).sort();
  if (sortedDays.length === 0) return { current: 0, max: 0 };

  let max = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i += 1) {
    const prev = new Date(sortedDays[i - 1]).getTime();
    const curr = new Date(sortedDays[i]).getTime();
    const dayDiff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) {
      run += 1;
      max = Math.max(max, run);
    } else {
      run = 1;
    }
  }

  let current = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = today.getTime();
  while (onTimeDays.has(new Date(cursor).toISOString().slice(0, 10))) {
    current += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }

  return { current, max };
};

const toTask = (assignment: AssignmentRecord, statusMap: StatusMap, priorityMap: PriorityOverrideMap): Task => {
  const weight = assignment.assignmentInfo.gradeWeightPercent ?? assignment.assignmentInfo.fullScore;
  const estimatedMinutes = durationToMinutes(assignment.assignmentInfo.estimatedDurationMinutes);
  const defaultPriorityScore = calcPriorityScore(assignment.submission.deadline, weight, estimatedMinutes);
  const defaultPriorityReason = buildPriorityReason(assignment.submission.deadline);
  const override = priorityMap[assignment.id] || {};
  const rubricText = assignment.rubric.rows
    .map((row) => `${row.title} (${row.maxScore})`)
    .join(", ");

  const assignedBy = assignment.qa.questionChannel || assignment.taskBrief.resources?.[0]?.label || undefined;

  return {
    id: assignment.id,
    title: assignment.assignmentInfo.title,
    subject: assignment.assignmentInfo.subject,
    deadline: assignment.submission.deadline,
    type: detectTaskType(assignment),
    channel: mapChannel(assignment.submission.channel),
    estimatedMinutes,
    weight,
    status: (statusMap[assignment.id] || "ยังไม่เริ่ม") as TaskStatus,
    priorityScore: override.priorityScore ?? defaultPriorityScore,
    priorityReason: override.priorityReason ?? defaultPriorityReason,
    isGroup: assignment.assignmentInfo.assignmentType === "group",
    description: assignment.assignmentInfo.shortDescription || "",
    attachments: assignment.taskBrief.resources?.map((r) => r.label) || [],
    rubric: rubricText || undefined,
    classCode: assignment.assignmentInfo.targetClassCodes[0],
    assignedBy,
  };
};

const canViewAssignment = (user: Student | null, assignment: AssignmentRecord) => {
  if (!user) return false;

  if (user.role === "teacher") {
    const assignedCodes = new Set(
      [...(user.managedClassCodes || []), ...(user.assignedClassCodes || [])].map((code) =>
        code.toUpperCase()
      )
    );
    return assignment.assignmentInfo.targetClassCodes.some((code) => assignedCodes.has(code.toUpperCase()));
  }

  if (user.status !== "approved" || !user.classCode) return false;
  const byCode = assignment.assignmentInfo.targetClassCodes.some(
    (code) => code.toUpperCase() === user.classCode?.toUpperCase()
  );
  const byGrade = assignment.assignmentInfo.targetGradeRooms.includes(user.grade);
  return byCode || byGrade;
};

const readAssignmentsFromPayload = (payload: unknown): AssignmentRecord[] => {
  if (Array.isArray(payload)) return payload as AssignmentRecord[];
  if (payload && typeof payload === "object" && Array.isArray((payload as any).assignments)) {
    return (payload as any).assignments as AssignmentRecord[];
  }
  return [];
};

const mapTeacherAssignmentToRecord = (assignment: TeacherAssignmentRecord): AssignmentRecord => {
  const room = getManagedClassroomByCode(assignment.classCode);
  const gradeRoom = room?.gradeRoom || "Unknown Room";
  const instruction = assignment.instruction || "Follow teacher instruction and submit before deadline.";

  return {
    id: assignment.id,
    createdAt: assignment.createdAt,
    assignmentInfo: {
      title: assignment.title,
      subject: assignment.subject,
      targetGradeRooms: [gradeRoom],
      targetClassCodes: [assignment.classCode],
      assignmentType: "individual",
      fullScore: 100,
      gradeWeightPercent: 10,
      estimatedDurationMinutes: 60,
      shortDescription: `Assigned by ${assignment.teacherName}`,
    },
    taskBrief: {
      learningObjectives: [`Complete ${assignment.subject} assignment on time`],
      steps: ["Read instruction", "Create your answer", "Review before submit"],
      dos: ["Submit before deadline", "Follow format requirements"],
      donts: ["Late submission", "Missing required files"],
      checklist: ["All required files attached", "Student name included"],
      resources: [
        {
          label: `Teacher: ${assignment.teacherName}`,
          url: `mailto:${assignment.teacherEmail}`,
        },
      ],
      aiPolicy: {
        allowed: ["Brainstorming", "Grammar checks"],
        forbidden: ["Copying full AI-generated answer"],
        note: instruction,
      },
    },
    deliverables: {
      items: [
        {
          name: "Assignment submission",
          submitType: "file",
          acceptedFormats: ["PDF", "DOCX", "PNG", "JPG"],
          requirement: "Single file submission",
          fileNameTemplate: `${assignment.id}_{studentId}`,
          maxFileSizeMb: 20,
        },
      ],
    },
    submission: {
      channel: "In DekThai",
      instructionSteps: ["Open task", "Upload your file", "Confirm submission"],
      deadline: assignment.deadline,
      allowLate: false,
      allowResubmit: assignment.allowResubmit,
    },
    rubric: {
      method: "total_only",
      rows: [
        {
          title: "Completion",
          maxScore: 100,
          fullScoreDescription: "Complete, accurate, and on-time submission",
        },
      ],
      passRule: ">= 50",
      notes: instruction,
    },
    qa: {
      questionChannel: `Teacher ${assignment.teacherName}`,
      responseWindow: "School hours",
    },
  };
};

export const useTasks = () => {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [completionMap, setCompletionMap] = useState<CompletionMap>({});
  const [priorityMap, setPriorityMap] = useState<PriorityOverrideMap>({});
  const [student, setStudent] = useState<Student | null>(null);

  const reloadLocal = useCallback(() => {
    const currentUser = getCurrentUser(readAuthState());
    setStudent(currentUser);

    if (!currentUser?.id) {
      setStatusMap({});
      setCompletionMap({});
      setPriorityMap({});
      return;
    }

    setStatusMap(readJSON<StatusMap>(scopedStorageKey(STATUS_STORAGE_KEY, currentUser.id), {}));
    setCompletionMap(readJSON<CompletionMap>(scopedStorageKey(COMPLETION_STORAGE_KEY, currentUser.id), {}));
    setPriorityMap(readJSON<PriorityOverrideMap>(scopedStorageKey(PRIORITY_OVERRIDE_STORAGE_KEY, currentUser.id), {}));
  }, []);

  const reloadAssignments = useCallback(async () => {
    try {
      const response = await fetch("/assigned_tasks.json", { cache: "no-store" });
      const json = response.ok ? await response.json() : { assignments: [] };
      const seededAssignments = readAssignmentsFromPayload(json);
      const detailedAssignments = listAssignmentRecords();
      const teacherAssignments = listTeacherAssignments().map(mapTeacherAssignmentToRecord);
      setAssignments([...seededAssignments, ...detailedAssignments, ...teacherAssignments]);
    } catch {
      const detailedAssignments = listAssignmentRecords();
      const teacherAssignments = listTeacherAssignments().map(mapTeacherAssignmentToRecord);
      setAssignments([...detailedAssignments, ...teacherAssignments]);
    }
  }, []);

  useEffect(() => {
    reloadLocal();
    reloadAssignments();

    const onChange = () => {
      reloadLocal();
      reloadAssignments();
    };

    window.addEventListener("storage", onChange);
    window.addEventListener(TASKS_EVENT, onChange);
    window.addEventListener(AUTH_EVENT, onChange);
    window.addEventListener(CLASSROOM_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(TASKS_EVENT, onChange);
      window.removeEventListener(AUTH_EVENT, onChange);
      window.removeEventListener(CLASSROOM_EVENT, onChange);
    };
  }, [reloadAssignments, reloadLocal]);

  const visibleAssignments = useMemo(
    () => assignments.filter((assignment) => canViewAssignment(student, assignment)),
    [assignments, student]
  );

  const tasks = useMemo(
    () => visibleAssignments.map((assignment) => toTask(assignment, statusMap, priorityMap)),
    [priorityMap, statusMap, visibleAssignments]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, nextStatus: TaskStatus) => {
      if (!student?.id) return;
      const statusKey = scopedStorageKey(STATUS_STORAGE_KEY, student.id);
      const completionKey = scopedStorageKey(COMPLETION_STORAGE_KEY, student.id);

      const nextStatusMap = { ...readJSON<StatusMap>(statusKey, {}), [taskId]: nextStatus };
      writeJSON(statusKey, nextStatusMap);
      setStatusMap(nextStatusMap);

      const nextCompletions = { ...readJSON<CompletionMap>(completionKey, {}) };
      if (DONE_STATUSES.includes(nextStatus)) {
        if (!nextCompletions[taskId]) {
          nextCompletions[taskId] = new Date().toISOString();
        }
      } else {
        delete nextCompletions[taskId];
      }
      writeJSON(completionKey, nextCompletions);
      setCompletionMap(nextCompletions);
      window.dispatchEvent(new Event(TASKS_EVENT));
    },
    [student?.id]
  );

  const replaceTasks = useCallback(
    (nextTasks: Task[]) => {
      if (!student?.id) return;
      const priorityKey = scopedStorageKey(PRIORITY_OVERRIDE_STORAGE_KEY, student.id);
      const nextPriorityMap = { ...readJSON<PriorityOverrideMap>(priorityKey, {}) };
      nextTasks.forEach((task) => {
        nextPriorityMap[task.id] = {
          priorityScore: task.priorityScore,
          priorityReason: task.priorityReason,
        };
      });
      writeJSON(priorityKey, nextPriorityMap);
      setPriorityMap(nextPriorityMap);
      window.dispatchEvent(new Event(TASKS_EVENT));
    },
    [student?.id]
  );

  const getAssignmentById = useCallback(
    (assignmentId?: string) => visibleAssignments.find((item) => item.id === assignmentId),
    [visibleAssignments]
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const doneTasks = tasks.filter((t) => DONE_STATUSES.includes(t.status));
    const activeTasks = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status));
    const backlogCount = activeTasks.filter((t) => new Date(t.deadline).getTime() < now).length;

    const onTimeDoneCount = doneTasks.filter((t) => {
      const completedAt = completionMap[t.id];
      if (!completedAt) return false;
      return new Date(completedAt).getTime() <= new Date(t.deadline).getTime();
    }).length;

    const onTimeRate = doneTasks.length > 0 ? Math.round((onTimeDoneCount / doneTasks.length) * 100) : 0;
    const streaks = computeStreaks(completionMap, new Map(tasks.map((t) => [t.id, t])));

    return {
      total: tasks.length,
      activeCount: activeTasks.length,
      doneCount: doneTasks.length,
      backlogCount,
      onTimeRate,
      stackCount: streaks.current,
      maxStack: streaks.max,
    };
  }, [tasks, completionMap]);

  const hasClassAccess = useMemo(() => {
    if (!student) return false;
    if (student.role === "teacher") {
      return [...(student.managedClassCodes || []), ...(student.assignedClassCodes || [])].length > 0;
    }
    return student.status === "approved" && !!student.classCode;
  }, [student]);

  return {
    tasks,
    assignments: visibleAssignments,
    stats,
    hasClassAccess,
    studentClassCode: student?.classCode || student?.assignedClassCodes?.[0],
    updateTaskStatus,
    replaceTasks,
    getAssignmentById,
    reloadAssignments,
  };
};


