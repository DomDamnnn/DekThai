import { useCallback, useEffect, useMemo, useState } from "react";
import { Notification } from "@/lib";
import { useTasks } from "@/hooks/useTasks";
import { AUTH_EVENT, getCurrentUser, readAuthState } from "@/lib/authStorage";

const NOTIFICATION_STORAGE_KEY = "dekthai_notifications_v3";
const NOTIFICATION_EVENT = "dekthai_notifications_updated";

const scopedNotificationKey = (userId?: string) => `${NOTIFICATION_STORAGE_KEY}:${userId || "guest"}`;

const readNotifications = (key: string): Notification[] => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveNotifications = (key: string, notifications: Notification[]) => {
  localStorage.setItem(key, JSON.stringify(notifications));
  window.dispatchEvent(new Event(NOTIFICATION_EVENT));
};

export const useNotifications = () => {
  const { assignments, hasClassAccess } = useTasks();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const reload = useCallback(
    (targetUserId = userId) => {
      const key = scopedNotificationKey(targetUserId || undefined);
      setNotifications(readNotifications(key));
    },
    [userId]
  );

  useEffect(() => {
    const syncUser = () => {
      const currentUser = getCurrentUser(readAuthState());
      setUserId(currentUser?.id || null);
      reload(currentUser?.id || null);
    };

    syncUser();
    const onChange = () => syncUser();
    window.addEventListener("storage", onChange);
    window.addEventListener(NOTIFICATION_EVENT, onChange);
    window.addEventListener(AUTH_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(NOTIFICATION_EVENT, onChange);
      window.removeEventListener(AUTH_EVENT, onChange);
    };
  }, [reload]);

  useEffect(() => {
    const key = scopedNotificationKey(userId || undefined);

    if (!userId || !hasClassAccess) {
      saveNotifications(key, []);
      setNotifications([]);
      return;
    }

    const previous = readNotifications(key);
    const previousMap = new Map(previous.map((item) => [item.id, item]));

    const next = assignments
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map<Notification>((assignment) => {
        const id = `assignment-${assignment.id}`;
        const existing = previousMap.get(id);
        return {
          id,
          type: "assignment",
          title: "New assignment",
          message: `${assignment.assignmentInfo.subject}: ${assignment.assignmentInfo.title}`,
          timestamp: assignment.createdAt,
          isRead: existing?.isRead ?? false,
          actions: [{ label: "Open task", path: `/task/${assignment.id}`, variant: "primary" }],
        };
      });

    saveNotifications(key, next);
    setNotifications(next);
  }, [assignments, hasClassAccess, userId]);

  const markAllAsRead = useCallback(() => {
    const key = scopedNotificationKey(userId || undefined);
    const next = readNotifications(key).map((item) => ({ ...item, isRead: true }));
    saveNotifications(key, next);
    setNotifications(next);
  }, [userId]);

  const clearAll = useCallback(() => {
    const key = scopedNotificationKey(userId || undefined);
    saveNotifications(key, []);
    setNotifications([]);
  }, [userId]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
  };
};



