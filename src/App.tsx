import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";

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

            {/* --- Core App Routes (Wrapped with Layout for Bottom Navigation & Header) --- */}
            <Route
              path={ROUTE_PATHS.HOME}
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.WORKSPACE}
              element={
                <Layout>
                  <WorkSpace />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.TASK_DETAIL}
              element={
                <Layout>
                  <TaskDetail />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.CALENDAR}
              element={
                <Layout>
                  <Calendar />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.GROUP}
              element={
                <Layout>
                  <GroupPage />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.NOTIFICATIONS}
              element={
                <Layout>
                  <Notifications />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.SMART_PRIORITY}
              element={
                <Layout>
                  <SmartPriority />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.STACK}
              element={
                <Layout>
                  <StackPage />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.DEK_CAMP}
              element={
                <Layout>
                  <DekCamp />
                </Layout>
              }
            />
            <Route
              path={ROUTE_PATHS.PROFILE}
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />

            {/* --- Catch-all & Redirection --- */}
            <Route path="*" element={<Navigate to={ROUTE_PATHS.WELCOME} replace />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;