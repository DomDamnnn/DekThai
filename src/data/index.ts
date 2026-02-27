import { Task, Notification, Badge, Student, ROUTE_PATHS } from '@/lib/index';

export const mockStudent: Student = {
  id: 'std-2026-001',
  role: 'student',
  nickname: "Student Dear",
  school: "Demonstration Innovation School",
  grade: "Grade 11/1",
  email: 'dear.student@dekthai.edu',
  phone: '081-234-5678',
  avatar: 'https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?auto=format&fit=crop&q=80&w=200',
  stackCount: 7,
  maxStack: 14,
  onTimeRate: 92,
  backlogCount: 2,
  classCode: 'DT-6942',
  status: 'approved',
  isAnonymous: false,
};

export const mockTasks: Task[] = [];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'deadline',
    title: "24 hours left!",
    message: 'Task "Basic Calculus Homework" is due tomorrow at 08:30.',
    timestamp: '2026-02-18T08:30:00Z',
    isRead: false,
    actions: [
      { label: "Start now", path: "/task/t1", variant: "primary" },
      { label: "Snooze 15 min", action: "snooze_15", variant: "outline" },
      { label: "Set custom time", action: "schedule_custom", variant: "secondary" },
    ]
  },
  {
    id: 'n2',
    type: 'returned',
    title: "Task returned",
    message: 'Teacher returned "English Vocabulary Quiz Correction" due to handwriting readability.',
    timestamp: '2026-02-18T07:00:00Z',
    isRead: false,
    actions: [
      { label: "Fix and resubmit", path: "/task/t4", variant: "primary" }
    ]
  },
  {
    id: 'n3',
    type: 'confirmed',
    title: "Teacher confirmed submission",
    message: "Teacher has received your chemistry lab assignment.",
    timestamp: '2026-02-17T15:20:00Z',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'group',
    title: "Group task updated",
    message: 'A teammate moved the card "Create presentation slides" to "Done".',
    timestamp: '2026-02-17T10:15:00Z',
    isRead: true,
    actions: [
      { label: "View board", path: "/group", variant: "outline" }
    ]
  },
  {
    id: 'n5',
    type: 'camp',
    title: "Opportunity for you",
    message: "DekThai AI Hackathon 2026 registration closes in 2 days.",
    timestamp: '2026-02-16T09:00:00Z',
    isRead: true,
    actions: [
      { label: "View details", path: "/dekcamp", variant: "primary" }
    ]
  }
];

export const mockBadges: Badge[] = [
  {
    id: 'b1',
    name: "On-time submitter",
    description: "Submit tasks on time for 7 consecutive days",
    icon: 'Zap',
    earnedDate: '2026-02-15',
  },
  {
    id: 'b2',
    name: "Backlog cleaner",
    description: "Clear all backlog tasks within 1 week",
    icon: 'CheckCircle2',
    earnedDate: '2026-02-10',
  },
  {
    id: 'b3',
    name: "Great teammate",
    description: "Regularly update group task status",
    icon: 'Users',
  },
  {
    id: 'b4',
    name: "Camp hunter",
    description: "Save more than 5 camps/competitions",
    icon: 'Trophy',
  }
];

