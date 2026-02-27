export const ROUTE_PATHS = {
  WELCOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PDPA: '/pdpa',
  CLASS_CODE: '/class-code',
  PENDING: '/pending',
  HOME: '/home',
  WORKSPACE: '/workspace',
  TASK_DETAIL: '/task/:id',
  CALENDAR: '/calendar',
  GROUP: '/group',
  NOTIFICATIONS: '/notifications',
  SMART_PRIORITY: '/smart-priority',
  STACK: '/stack',
  DEK_CAMP: '/dekcamp',
  PROFILE: '/profile',
  TEACHER_CLASSROOMS: '/teacher/classrooms',
  TEACHER_INBOX: '/teacher/inbox',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_ASSIGNMENTS: '/teacher/assignments',
} as const;

export type TaskStatus = 'ยังไม่เริ่ม' | 'กำลังทำ' | 'พร้อมส่ง' | 'ส่งแล้ว' | 'รอตรวจ' | 'ตีกลับ';
export type TaskType = 'ไฟล์' | 'รูปถ่าย' | 'กระดาษ' | 'ลิงก์';
export type TaskChannel = 'ในแอพ' | 'Google Classroom' | 'ส่งครูหน้าห้อง';

export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string; // ISO String
  type: TaskType;
  channel: TaskChannel;
  estimatedMinutes: number;
  weight?: number;
  status: TaskStatus;
  priorityScore: number;
  priorityReason: string;
  isGroup: boolean;
  returnedReason?: string;
  description?: string;
  attachments?: string[];
  rubric?: string;
  classCode?: string;
  assignedBy?: string;
  assignedByTeacherId?: string;
}

export type UserRole = 'student' | 'teacher';

export interface Student {
  id: string;
  role: UserRole;
  nickname: string;
  school: string;
  grade: string;
  subject?: string;
  email: string;
  phone?: string;
  avatar?: string;
  stackCount: number;
  maxStack: number;
  onTimeRate: number;
  backlogCount: number;
  classCode?: string;
  status: 'pending' | 'approved' | 'none';
  isAnonymous: boolean;
  managedClassCodes?: string[];
  assignedClassCodes?: string[];
}

export type NotificationType = 'deadline' | 'returned' | 'confirmed' | 'group' | 'camp' | 'assignment';

export interface NotificationAction {
  label: string;
  path?: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actions?: NotificationAction[];
}

export interface ClassRoom {
  id: string;
  name: string;
  teacher: string;
  code: string;
  studentCount: number;
}

export interface ManagedClassroom {
  code: string;
  gradeRoom: string;
  school: string;
  ownerTeacherId: string;
  ownerTeacherName: string;
  teacherIds: string[];
  studentIds: string[];
  createdAt: string;
}

export interface ClassroomMember {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  avatar?: string;
  subject?: string;
  joinedAt: string;
}

export interface TeacherAssignmentRecord {
  id: string;
  classCode: string;
  title: string;
  subject: string;
  instruction?: string;
  deadline: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  allowResubmit: boolean;
  createdAt: string;
}

export interface TeacherInboxMessage {
  id: string;
  classCode: string;
  title: string;
  message: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate?: string;
}

export interface Stack {
  current: number;
  max: number;
  history: { date: string; completed: boolean }[];
  onTimeRate: number;
}

export interface AssignmentResource {
  label: string;
  url: string;
}

export interface AssignmentDeliverable {
  name: string;
  submitType: 'file' | 'link' | 'text';
  acceptedFormats: string[];
  requirement: string;
  maxFileSizeMb?: number;
  fileNameTemplate: string;
}

export interface AssignmentRubricRow {
  title: string;
  maxScore: number;
  fullScoreDescription: string;
}

export interface AssignmentRecord {
  id: string;
  createdAt: string;
  assignmentInfo: {
    title: string;
    subject: string;
    targetGradeRooms: string[];
    targetClassCodes: string[];
    assignmentType: 'individual' | 'group';
    groupConfig?: {
      minMembers: number;
      maxMembers: number;
      groupingMethod: 'teacher_assigns' | 'students_choose' | 'random';
    };
    fullScore: number;
    gradeWeightPercent?: number;
    estimatedDurationMinutes: number;
    shortDescription?: string;
  };
  taskBrief: {
    learningObjectives: string[];
    steps: string[];
    dos: string[];
    donts: string[];
    checklist: string[];
    resources?: AssignmentResource[];
    aiPolicy?: {
      allowed: string[];
      forbidden: string[];
      note?: string;
    };
  };
  deliverables: {
    items: AssignmentDeliverable[];
    examples?: AssignmentResource[];
  };
  submission: {
    channel: string;
    instructionSteps: string[];
    deadline: string;
    allowLate: boolean;
    lateUntil?: string;
    latePenaltyPolicy?: string;
    allowResubmit?: boolean;
    resubmitUntil?: string;
  };
  rubric: {
    method: 'rubric' | 'checklist' | 'total_only';
    rows: AssignmentRubricRow[];
    passRule: string;
    notes?: string;
  };
  qa: {
    questionChannel: string;
    responseWindow?: string;
    faq?: { question: string; answer: string }[];
  };
}

export interface ClassroomRecord {
  code: string;
  gradeRoom: string;
  school: string;
}

export const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'ยังไม่เริ่ม': return 'bg-muted text-muted-foreground';
    case 'กำลังทำ': return 'bg-primary/10 text-primary border-primary/20';
    case 'พร้อมส่ง': return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'ส่งแล้ว': return 'bg-green-100 text-green-700 border-green-200';
    case 'รอตรวจ': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'ตีกลับ': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const getDeadlineStatus = (deadline: string) => {
  const now = new Date();
  const due = new Date(deadline);
  const diff = due.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (diff < 0) return { label: "Late", color: "text-destructive" };
  if (hours < 24) return { label: "Due soon", color: "text-orange-500" };
  return { label: "Normal", color: "text-muted-foreground" };
};

export const getTaskStatusLabel = (status: TaskStatus) => {
  const value = String(status);
  if (value.includes("ยัง")) return "Not started";
  if (value.includes("กำลัง")) return "In progress";
  if (value.includes("พร้อม")) return "Ready to submit";
  if (value.includes("ส่ง")) return "Submitted";
  if (value.includes("รอ")) return "Waiting review";
  if (value.includes("ตีก")) return "Returned";
  return value;
};

export const formatDateThai = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


