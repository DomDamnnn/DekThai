import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Calendar,
  FileText,
  Camera,
  Link as LinkIcon,
  ClipboardList
} from 'lucide-react';
import {
  Task,
  Notification,
  ROUTE_PATHS,
  getStatusColor,
  getTaskStatusLabel,
  getDeadlineStatus,
  formatDateThai,
  TaskType
} from '@/lib/index';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

const cardRevealTransition = { type: 'spring', stiffness: 260, damping: 26 } as const;

const getTypeIcon = (type: TaskType) => {
  switch (type) {
    case 'ไฟล์': return <FileText className="w-4 h-4" />;
    case 'รูปถ่าย': return <Camera className="w-4 h-4" />;
    case 'ลิงก์': return <LinkIcon className="w-4 h-4" />;
    case 'กระดาษ': return <ClipboardList className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export function WorkCard({ task }: { task: Task }) {
  const { language, tx } = useLocale();
  const deadlineStatus = getDeadlineStatus(task.deadline);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={ROUTE_PATHS.TASK_DETAIL.replace(':id', task.id)}>
        <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all cursor-pointer">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                {task.subject}
              </span>
              {task.isGroup && (
                <Badge variant="outline" className="flex items-center gap-1 border-blue-200 text-blue-600 bg-blue-50">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px]">{tx('งานกลุ่ม', 'Group work')}</span>
                </Badge>
              )}
            </div>
            <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className={cn("w-4 h-4", deadlineStatus.color)} />
              <span className={cn("font-medium", deadlineStatus.color)}>
                {formatDateThai(task.deadline, language)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                {getTypeIcon(task.type)}
                <span>{tx('ส่งแบบ', 'Submit as')} {task.type}</span>
              </div>
              <Badge variant="outline" className={cn("font-normal", getStatusColor(task.status))}>
                {getTaskStatusLabel(task.status, language)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function NotificationCard({ notification }: { notification: Notification }) {
  const { language } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={cardRevealTransition}
      whileHover={{ y: -2 }}
    >
      <Card className={cn("border-l-4 transition-all", 
        notification.isRead ? "border-l-muted opacity-80" : "border-l-primary shadow-sm"
      )}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm leading-tight">{notification.title}</h4>
              <p className="text-sm text-muted-foreground leading-snug">{notification.message}</p>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDateThai(notification.timestamp, language)}
              </span>
            </div>
            {!notification.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
          </div>

          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
              {notification.actions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={action.variant === 'primary' ? 'default' : action.variant === 'secondary' ? 'secondary' : 'outline'}
                  className="h-8 text-xs px-3"
                  asChild={!!action.path}
                >
                  {action.path ? (
                    <Link to={action.path}>{action.label}</Link>
                  ) : (
                    <span>{action.label}</span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatsCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={cardRevealTransition}
      whileHover={{ y: -3, scale: 1.015 }}
    >
      <Card className="border-none bg-accent/30 shadow-none">
        <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
          <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
            {icon}
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PriorityCard({ task }: { task: Task }) {
  const { language, tx } = useLocale();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={cardRevealTransition}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <Card className="border-none relative overflow-hidden text-white shadow-xl shadow-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#1677FF] to-secondary opacity-90" />
        <div className="absolute -right-4 -top-4 opacity-10">
          <Zap className="w-32 h-32 rotate-12" />
        </div>
        
        <CardHeader className="relative p-5 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-white/80">
              {tx('ลำดับความสำคัญ', 'Smart Priority')}
            </span>
          </div>
          <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
          <p className="text-sm text-white/80">{tx('วิชา', 'Subject')}: {task.subject}</p>
        </CardHeader>

        <CardContent className="relative p-5 pt-0 space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
              <p className="text-xs leading-relaxed text-white/90">
                <span className="font-bold">{tx('เหตุผล AI', 'AI reason')}:</span> {task.priorityReason}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateThai(task.deadline, language)}</span>
            </div>
            <div className="flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>~{task.estimatedMinutes} {tx('นาที', 'min')}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative p-5 pt-0">
          <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold h-12 rounded-2xl group" asChild>
            <Link to={ROUTE_PATHS.TASK_DETAIL.replace(':id', task.id)} className="flex items-center justify-center gap-2">
              {tx('เริ่มทำเลย', 'Start now')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.article>
  );
}
