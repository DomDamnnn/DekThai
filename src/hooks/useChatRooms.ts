import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { ChatRoom, ChatRoomScope } from '@/lib';

const STORAGE_KEY = 'dekthai_chat_rooms';

export function useChatRooms() {
  const { student } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize rooms from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRooms(JSON.parse(stored));
      } else {
        // Set initial app-wide rooms if none exist
        setRooms(getInitialRooms());
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    }
    setLoading(false);
  }, []);

  // Get accessible rooms based on user's classroom and school
  const accessibleRooms = useMemo(() => {
    if (!student) return [];

    // Teachers can access all app-wide and school-wide rooms
    // Students must have a classroom to access any rooms
    if (student.role === 'student' && !student.classCode) {
      return [];
    }

    return rooms.filter((room) => {
      // App-wide rooms: accessible to all
      if (room.scope === 'app') return true;

      // School-wide rooms: teachers and students in same school
      if (room.scope === 'school') {
        return room.school === student.school;
      }

      // Classroom-specific rooms: only students in same classroom
      if (room.scope === 'classroom') {
        if (student.role === 'teacher') return true; // Teachers see all classroom rooms
        return room.classCode === student.classCode && room.school === student.school;
      }

      return false;
    });
  }, [rooms, student]);

  // Check if user can create a room of a specific scope
  const canCreateRoom = useCallback(
    (scope: ChatRoomScope): boolean => {
      if (!student) return false;

      // Teachers can create app-wide and school-wide rooms
      if (student.role === 'teacher') {
        return scope === 'app' || scope === 'school';
      }

      // Regular students need classroom to create rooms
      if (!student.classCode) return false;

      // Students can only create app-wide and classroom-specific rooms
      return scope === 'app' || scope === 'classroom';
    },
    [student]
  );

  // Create a new chat room
  const createRoom = useCallback(
    (payload: {
      name: string;
      description?: string;
      scope: ChatRoomScope;
      color?: string;
      emoji?: string;
    }): ChatRoom | null => {
      if (!student || !canCreateRoom(payload.scope)) {
        console.error('User does not have permission to create room with scope:', payload.scope);
        return null;
      }

      const newRoom: ChatRoom = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: payload.name,
        description: payload.description,
        scope: payload.scope,
        createdBy: student.id,
        createdByName: student.nickname,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        school: student.school,
        classCode: payload.scope === 'classroom' ? student.classCode : undefined,
        color: payload.color,
        emoji: payload.emoji,
        isActive: true,
      };

      const updatedRooms = [...rooms, newRoom];
      setRooms(updatedRooms);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRooms));

      return newRoom;
    },
    [student, rooms, canCreateRoom]
  );

  // Update room details (customization)
  const updateRoom = useCallback(
    (roomId: string, updates: Partial<Omit<ChatRoom, 'id' | 'createdBy' | 'createdAt'>>) => {
      if (!student) return;

      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        console.error('Room not found:', roomId);
        return;
      }

      // Only the room creator or teachers can update
      if (room.createdBy !== student.id && student.role !== 'teacher') {
        console.error('User does not have permission to update this room');
        return;
      }

      const updatedRooms = rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : r
      );

      setRooms(updatedRooms);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRooms));
    },
    [rooms, student]
  );

  // Check if user can access a specific room
  const canAccessRoom = useCallback(
    (room: ChatRoom): boolean => {
      if (!student) return false;

      // App-wide rooms: accessible to all
      if (room.scope === 'app') return true;

      // Teachers can access school-wide rooms in their school or any classroom room
      if (student.role === 'teacher') {
        if (room.scope === 'school') return room.school === student.school;
        if (room.scope === 'classroom') return room.school === student.school;
        return true;
      }

      // Students need classroom access
      if (!student.classCode) return false;

      // School-wide rooms: students in same school
      if (room.scope === 'school') return room.school === student.school;

      // Classroom-specific rooms: only if same classroom
      if (room.scope === 'classroom') {
        return room.classCode === student.classCode && room.school === student.school;
      }

      return false;
    },
    [student]
  );

  // Check if user has classroom assigned (or is a teacher)
  const hasClassroomAccess = student?.role === 'teacher' || Boolean(student?.classCode);

  return {
    rooms: accessibleRooms,
    allRooms: rooms,
    loading,
    hasClassroomAccess,
    canCreateRoom,
    createRoom,
    updateRoom,
    canAccessRoom,
  };
}

// Initial app-wide rooms
function getInitialRooms(): ChatRoom[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'app_chill',
      name: 'ชิลล์',
      description: 'ห่อมพูดคุยสำหรับผ่อนคลายและสนทนาทั่วไป',
      scope: 'app',
      createdBy: 'system',
      createdByName: 'System',
      createdAt: now,
      updatedAt: now,
      color: '#FF6B6B',
      emoji: '😎',
      isActive: true,
    },
    {
      id: 'app_tutor',
      name: 'ติวหนังสือ',
      description: 'ห้องสำหรับติวและแลกเปลี่ยนความรู้',
      scope: 'app',
      createdBy: 'system',
      createdByName: 'System',
      createdAt: now,
      updatedAt: now,
      color: '#4ECDC4',
      emoji: '📚',
      isActive: true,
    },
    {
      id: 'app_read',
      name: 'อ่านหนังสือ',
      description: 'ห้องสำหรับการอ่านและแบ่งปันเรื่องราว',
      scope: 'app',
      createdBy: 'system',
      createdByName: 'System',
      createdAt: now,
      updatedAt: now,
      color: '#FFE66D',
      emoji: '📖',
      isActive: true,
    },
    {
      id: 'app_work',
      name: 'ทำงาน',
      description: 'ห้องสำหรับการทำงานและร่วมมือ',
      scope: 'app',
      createdBy: 'system',
      createdByName: 'System',
      createdAt: now,
      updatedAt: now,
      color: '#95E1D3',
      emoji: '💼',
      isActive: true,
    },
  ];
}
