import { useState, useEffect, useCallback } from 'react';
import { Student, ROUTE_PATHS } from '@/lib/index';
import { mockStudent } from '@/data/index';

const AUTH_STORAGE_KEY = 'dekthai_auth_user';

/**
 * Custom hook for managing authentication and student data in DekThai App
 * This is a simulated auth system for the prototype using localStorage
 */
export const useAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize student from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        setStudent(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored student data', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } else {
      // For prototype purposes, if no user is found, we don't auto-login
      // But we can optionally set mockStudent for quick testing if needed
      // setStudent(mockStudent);
    }
    setIsLoading(false);
  }, []);

  // Login simulation
  const login = useCallback(async (email: string, _password?: string) => {
    setIsLoading(true);
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // In prototype, we just use mockStudent if email matches or just any email
    const authenticatedStudent: Student = {
      ...mockStudent,
      email: email || mockStudent.email,
    };

    setStudent(authenticatedStudent);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedStudent));
    setIsLoading(false);
    return authenticatedStudent;
  }, []);

  // Registration simulation
  const register = useCallback(async (data: Partial<Student>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      nickname: data.nickname || 'นักเรียนใหม่',
      school: data.school || 'โรงเรียนตัวอย่าง',
      grade: data.grade || 'มัธยมศึกษาปีที่ 4',
      email: data.email || '',
      phone: data.phone || '',
      avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200',
      stackCount: 0,
      maxStack: 0,
      onTimeRate: 100,
      backlogCount: 0,
      status: 'none', // Not joined a class yet
      isAnonymous: false,
    };

    setStudent(newStudent);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newStudent));
    setIsLoading(false);
    return newStudent;
  }, []);

  // Join Class Code simulation
  const joinClass = useCallback(async (code: string) => {
    if (!student) return;
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const updatedStudent: Student = {
      ...student,
      classCode: code,
      status: 'pending', // Waiting for teacher approval
    };

    setStudent(updatedStudent);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedStudent));
    setIsLoading(false);
    return updatedStudent;
  }, [student]);

  // Cancel Join Request simulation
  const cancelJoinRequest = useCallback(async () => {
    if (!student) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedStudent: Student = {
      ...student,
      classCode: undefined,
      status: 'none',
    };

    setStudent(updatedStudent);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedStudent));
    setIsLoading(false);
    return updatedStudent;
  }, [student]);

  // Update student profile/stats
  const updateStudent = useCallback((updates: Partial<Student>) => {
    if (!student) return;

    const updatedStudent = { ...student, ...updates };
    setStudent(updatedStudent);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedStudent));
  }, [student]);

  // Logout
  const logout = useCallback(() => {
    setStudent(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  // Helper to check if student is in a specific flow state
  const isPendingApproval = student?.status === 'pending';
  const isApproved = student?.status === 'approved';
  const hasNoClass = student?.status === 'none';

  return {
    student,
    isAuthenticated: !!student,
    isLoading,
    isPendingApproval,
    isApproved,
    hasNoClass,
    login,
    logout,
    register,
    joinClass,
    cancelJoinRequest,
    updateStudent,
    ROUTE_PATHS,
  };
};
