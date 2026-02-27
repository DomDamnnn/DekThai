import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";

// Import Pages
import Welcome from "@/pages/Welcome";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PDPA from "@/pages/PDPA";
import ClassCode from "@/pages/ClassCode";
import Pending from "@/pages/Pending";
import Home from "@/pages/Home";
import WorkSpace from "@/pages/WorkSpace";
import TaskDetail from "@/pages/TaskDetail";
import Calendar from "@/pages/Calendar";
import GroupPage from "@/pages/Group";
import Notifications from "@/pages/Notifications";
import SmartPriority from "@/pages/SmartPriority";
import StackPage from "@/pages/Stack";
import DekCamp from "@/pages/DekCamp";
import Profile from "@/pages/Profile";
import TeacherClassrooms from "@/pages/TeacherClassrooms";
import TeacherInbox from "@/pages/TeacherInbox";
import TeacherStudents from "@/pages/TeacherStudents";
import TeacherAssignments from "@/pages/TeacherAssignments";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * DekThai App - Root Component
 * จัดการ Authentication Flow และการเปลี่ยนเส้นทางหลัก
 * © 2026 DekThai Project
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" expand={false} richColors />
        <HashRouter>
          <Routes>
            {/* --- Public & Authentication Routes (No Layout) --- */}
            <Route path={ROUTE_PATHS.WELCOME} element={<Welcome />} />
            <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
            <Route path={ROUTE_PATHS.REGISTER} element={<Register />} />
            <Route path={ROUTE_PATHS.PDPA} element={<PDPA />} />

            {/* --- Onboarding & Status Routes (No Layout) --- */}
            <Route path={ROUTE_PATHS.CLASS_CODE} element={<ClassCode />} />
            <Route path={ROUTE_PATHS.PENDING} element={<Pending />} />

            {/* --- Core App Routes --- */}
            <Route path={ROUTE_PATHS.HOME} element={<Home />} />
            <Route path={ROUTE_PATHS.WORKSPACE} element={<WorkSpace />} />
            <Route path={ROUTE_PATHS.TASK_DETAIL} element={<TaskDetail />} />
            <Route path={ROUTE_PATHS.CALENDAR} element={<Calendar />} />
            <Route path={ROUTE_PATHS.GROUP} element={<GroupPage />} />
            <Route path={ROUTE_PATHS.NOTIFICATIONS} element={<Notifications />} />
            <Route path={ROUTE_PATHS.SMART_PRIORITY} element={<SmartPriority />} />
            <Route path={ROUTE_PATHS.STACK} element={<StackPage />} />
            <Route path={ROUTE_PATHS.DEK_CAMP} element={<DekCamp />} />
            <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />
            <Route path={ROUTE_PATHS.TEACHER_CLASSROOMS} element={<TeacherClassrooms />} />
            <Route path={ROUTE_PATHS.TEACHER_INBOX} element={<TeacherInbox />} />
            <Route path={ROUTE_PATHS.TEACHER_STUDENTS} element={<TeacherStudents />} />
            <Route path={ROUTE_PATHS.TEACHER_ASSIGNMENTS} element={<TeacherAssignments />} />

            {/* --- Catch-all & Redirection --- */}
            <Route path="*" element={<Navigate to={ROUTE_PATHS.WELCOME} replace />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
