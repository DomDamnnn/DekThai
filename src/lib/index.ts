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
}

export interface Student {
  id: string;
  nickname: string;
  school: string;
  grade: string;
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
}

export type NotificationType = 'deadline' | 'returned' | 'confirmed' | 'group' | 'camp';

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

  if (diff < 0) return { label: 'เกินกำหนด', color: 'text-destructive' };
  if (hours < 24) return { label: 'ใกล้เดดไลน์', color: 'text-orange-500' };
  return { label: 'ปกติ', color: 'text-muted-foreground' };
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