import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const useTeacherGuard = () => {
  const navigate = useNavigate();
  const { student, isLoading, ROUTE_PATHS } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!student) {
      navigate(ROUTE_PATHS.LOGIN, { replace: true });
      return;
    }
    if (student.role !== "teacher") {
      navigate(ROUTE_PATHS.HOME, { replace: true });
    }
  }, [ROUTE_PATHS.HOME, ROUTE_PATHS.LOGIN, isLoading, navigate, student]);

  return {
    isTeacher: student?.role === "teacher",
    teacher: student?.role === "teacher" ? student : null,
    isLoading,
  };
};
