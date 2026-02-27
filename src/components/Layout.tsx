import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, CalendarDays, ClipboardCheck, ClipboardList, Home, Inbox, School, Sparkles, User, Users } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/hooks/useAppSettings';

interface LayoutProps {
  children: React.ReactNode;
}

const AUTH_PAGE_PATHS = [
  ROUTE_PATHS.WELCOME,
  ROUTE_PATHS.LOGIN,
  ROUTE_PATHS.REGISTER,
  ROUTE_PATHS.PDPA,
] as const;

const SETUP_PAGE_PATHS = [ROUTE_PATHS.CLASS_CODE, ROUTE_PATHS.PENDING] as const;

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isAuthPage = AUTH_PAGE_PATHS.includes(location.pathname as (typeof AUTH_PAGE_PATHS)[number]);
  const isSetupPage = SETUP_PAGE_PATHS.includes(location.pathname as (typeof SETUP_PAGE_PATHS)[number]);

  if (isAuthPage || isSetupPage) {
    return <div className="min-h-screen bg-background font-sans">{children}</div>;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppLayout({ children }: LayoutProps) {
  const { unreadCount } = useNotifications();
  const { student } = useAuth();
  const { settings } = useAppSettings();
  const th = settings.language === 'th';

  const studentNavItems = [
    { label: th ? 'หน้าแรก' : 'Home', path: ROUTE_PATHS.HOME, icon: Home },
    { label: 'WorkSpace', path: ROUTE_PATHS.WORKSPACE, icon: ClipboardList },
    { label: 'Priority AI', path: ROUTE_PATHS.SMART_PRIORITY, icon: Sparkles },
    { label: th ? 'โปรไฟล์' : 'Profile', path: ROUTE_PATHS.PROFILE, icon: User },
  ];
  const teacherNavItems = [
    { label: th ? 'ห้องเรียน' : 'Classrooms', path: ROUTE_PATHS.TEACHER_CLASSROOMS, icon: School },
    { label: 'Inbox', path: ROUTE_PATHS.TEACHER_INBOX, icon: Inbox },
    { label: th ? 'นักเรียน' : 'Students', path: ROUTE_PATHS.TEACHER_STUDENTS, icon: Users },
    { label: th ? 'งานที่สั่ง' : 'Assignments', path: ROUTE_PATHS.TEACHER_ASSIGNMENTS, icon: ClipboardCheck },
    { label: 'Calendar', path: ROUTE_PATHS.CALENDAR, icon: CalendarDays },
    { label: th ? 'โปรไฟล์' : 'Profile', path: ROUTE_PATHS.PROFILE, icon: User },
  ];

  const isTeacher = student?.role === 'teacher';
  const navItems = isTeacher ? teacherNavItems : studentNavItems;
  const homePath = isTeacher ? ROUTE_PATHS.TEACHER_CLASSROOMS : ROUTE_PATHS.HOME;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto w-full h-16 px-4 flex items-center justify-between">
          <Link to={homePath} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DekThai
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to={ROUTE_PATHS.NOTIFICATIONS}>
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent">
                <Bell className="w-6 h-6 text-foreground" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 border-2 border-background bg-destructive text-[10px]">
                    {Math.min(unreadCount, 99)}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-24 max-w-md mx-auto w-full px-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto w-full h-20 px-2 flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full transition-all duration-300',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-2 rounded-xl transition-all duration-300',
                      isActive ? 'bg-primary/10 scale-110 shadow-sm' : 'bg-transparent'
                    )}
                  >
                    <item.icon className={cn('w-6 h-6', isActive ? 'stroke-[2.5px]' : 'stroke-[2px]')} />
                  </div>
                    <span className={cn('text-[10px] mt-1 font-medium transition-all duration-300', isActive ? 'opacity-100' : 'opacity-70')}>
                      {item.label}
                    </span>
                  </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
