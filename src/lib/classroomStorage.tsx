import {
  AssignmentRecord,
  ClassroomMember,
  ManagedClassroom,
  Student,
  TeacherAssignmentRecord,
  TeacherInboxMessage,
} from "@/lib";

export const CLASSROOM_EVENT = "dekthai_classrooms_updated";
const MANAGED_CLASSROOM_STORAGE_KEY = "dekthai_managed_classrooms_v1";
const TEACHER_ASSIGNMENT_STORAGE_KEY = "dekthai_teacher_assignments_v1";
const ASSIGNMENT_RECORD_STORAGE_KEY = "dekthai_assignment_records_v1";
const TEACHER_INBOX_STORAGE_KEY = "dekthai_teacher_inbox_v1";

export interface CreateClassroomInput {
  gradeRoom: string;
  school: string;
  ownerTeacherId: string;
  ownerTeacherName: string;
  code?: string;
}

export interface CreateTeacherAssignmentInput {
  classCode: string;
  title: string;
  subject: string;
  instruction?: string;
  deadline: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  allowResubmit?: boolean;
}

export interface CreateAssignmentRecordInput {
  assignment: Omit<AssignmentRecord, "id" | "createdAt"> & Partial<Pick<AssignmentRecord, "id" | "createdAt">>;
}

export interface CreateTeacherInboxMessageInput {
  classCode: string;
  title: string;
  message: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

const readJSON = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const dispatchClassroomChange = () => {
  window.dispatchEvent(new Event(CLASSROOM_EVENT));
};

const normalizeClassCode = (code: string) => code.trim().toUpperCase();

const uniqueArray = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const normalizeAssignmentRecord = (assignment: AssignmentRecord): AssignmentRecord => ({
  ...assignment,
  assignmentInfo: {
    ...assignment.assignmentInfo,
    targetClassCodes: uniqueArray(
      (assignment.assignmentInfo.targetClassCodes || []).map((code) => normalizeClassCode(code))
    ),
    targetGradeRooms: uniqueArray(assignment.assignmentInfo.targetGradeRooms || []),
  },
});

const generateClassCode = (existingCodes: Set<string>) => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const randomLetters = () =>
    Array.from({ length: 3 })
      .map(() => letters[Math.floor(Math.random() * letters.length)])
      .join("");
  const randomDigits = () => String(Math.floor(100 + Math.random() * 900));

  let code = `${randomLetters()}-${randomDigits()}`;
  while (existingCodes.has(code)) {
    code = `${randomLetters()}-${randomDigits()}`;
  }
  return code;
};

export const listManagedClassrooms = (): ManagedClassroom[] => {
  const classrooms = readJSON<ManagedClassroom[]>(MANAGED_CLASSROOM_STORAGE_KEY, []);
  return classrooms
    .filter((room) => room && room.code)
    .map((room) => ({
      ...room,
      code: normalizeClassCode(room.code),
      teacherIds: uniqueArray(room.teacherIds || []),
      studentIds: uniqueArray(room.studentIds || []),
    }));
};

export const saveManagedClassrooms = (classrooms: ManagedClassroom[]) => {
  writeJSON(MANAGED_CLASSROOM_STORAGE_KEY, classrooms);
  dispatchClassroomChange();
  return classrooms;
};

export const getManagedClassroomByCode = (code: string) => {
  const normalized = normalizeClassCode(code);
  return listManagedClassrooms().find((room) => room.code === normalized) || null;
};

export const listTeacherClassrooms = (teacherId: string) => {
  return listManagedClassrooms().filter(
    (room) => room.ownerTeacherId === teacherId || room.teacherIds.includes(teacherId)
  );
};

export const createManagedClassroom = (input: CreateClassroomInput) => {
  const classrooms = listManagedClassrooms();
  const usedCodes = new Set(classrooms.map((room) => room.code));
  const code = normalizeClassCode(input.code || generateClassCode(usedCodes));

  if (usedCodes.has(code)) {
    throw new Error("Class code already exists.");
  }

  const nextRoom: ManagedClassroom = {
    code,
    gradeRoom: input.gradeRoom.trim() || "Unknown Room",
    school: input.school.trim() || "Unknown School",
    ownerTeacherId: input.ownerTeacherId,
    ownerTeacherName: input.ownerTeacherName.trim() || "Unknown Teacher",
    teacherIds: uniqueArray([input.ownerTeacherId]),
    studentIds: [],
    createdAt: new Date().toISOString(),
  };

  saveManagedClassrooms([...classrooms, nextRoom]);
  return nextRoom;
};

export const addStudentToClassroom = (classCode: string, studentId: string) => {
  const normalizedCode = normalizeClassCode(classCode);
  const classrooms = listManagedClassrooms();
  const updated = classrooms.map((room) => {
    if (room.code !== normalizedCode) return room;
    return {
      ...room,
      studentIds: uniqueArray([...(room.studentIds || []), studentId]),
    };
  });
  saveManagedClassrooms(updated);
  return updated.find((room) => room.code === normalizedCode) || null;
};

export const removeStudentFromClassroom = (classCode: string, studentId: string) => {
  const normalizedCode = normalizeClassCode(classCode);
  const classrooms = listManagedClassrooms();
  const updated = classrooms.map((room) => {
    if (room.code !== normalizedCode) return room;
    return {
      ...room,
      studentIds: (room.studentIds || []).filter((id) => id !== studentId),
    };
  });
  saveManagedClassrooms(updated);
  return updated.find((room) => room.code === normalizedCode) || null;
};

export const addTeacherToClassroom = (classCode: string, teacherId: string) => {
  const normalizedCode = normalizeClassCode(classCode);
  const classrooms = listManagedClassrooms();
  const updated = classrooms.map((room) => {
    if (room.code !== normalizedCode) return room;
    return {
      ...room,
      teacherIds: uniqueArray([...(room.teacherIds || []), teacherId]),
    };
  });
  saveManagedClassrooms(updated);
  return updated.find((room) => room.code === normalizedCode) || null;
};

export const removeTeacherFromClassroom = (classCode: string, teacherId: string) => {
  const normalizedCode = normalizeClassCode(classCode);
  const classrooms = listManagedClassrooms();
  const updated = classrooms.map((room) => {
    if (room.code !== normalizedCode) return room;
    if (room.ownerTeacherId === teacherId) {
      return room;
    }
    return {
      ...room,
      teacherIds: (room.teacherIds || []).filter((id) => id !== teacherId),
    };
  });
  saveManagedClassrooms(updated);
  return updated.find((room) => room.code === normalizedCode) || null;
};

export const listTeacherAssignments = () => {
  const assignments = readJSON<TeacherAssignmentRecord[]>(TEACHER_ASSIGNMENT_STORAGE_KEY, []);
  return assignments
    .filter((assignment) => assignment && assignment.id)
    .map((assignment) => ({
      ...assignment,
      classCode: normalizeClassCode(assignment.classCode),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const saveTeacherAssignments = (assignments: TeacherAssignmentRecord[]) => {
  writeJSON(TEACHER_ASSIGNMENT_STORAGE_KEY, assignments);
  dispatchClassroomChange();
  return assignments;
};

export const createTeacherAssignment = (input: CreateTeacherAssignmentInput) => {
  const classCode = normalizeClassCode(input.classCode);
  const assignment: TeacherAssignmentRecord = {
    id: `tea-asg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    classCode,
    title: input.title.trim(),
    subject: input.subject.trim(),
    instruction: input.instruction?.trim(),
    deadline: input.deadline,
    teacherId: input.teacherId,
    teacherName: input.teacherName.trim() || "Unknown Teacher",
    teacherEmail: input.teacherEmail.trim(),
    allowResubmit: Boolean(input.allowResubmit),
    createdAt: new Date().toISOString(),
  };

  const assignments = listTeacherAssignments();
  saveTeacherAssignments([assignment, ...assignments]);
  return assignment;
};

export const listClassroomAssignments = (classCode: string) => {
  const normalized = normalizeClassCode(classCode);
  return listTeacherAssignments().filter((assignment) => assignment.classCode === normalized);
};

export const listAssignmentRecords = () => {
  const assignments = readJSON<AssignmentRecord[]>(ASSIGNMENT_RECORD_STORAGE_KEY, []);
  return assignments
    .filter((assignment) => assignment && assignment.id)
    .map((assignment) => normalizeAssignmentRecord(assignment))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const saveAssignmentRecords = (assignments: AssignmentRecord[]) => {
  writeJSON(ASSIGNMENT_RECORD_STORAGE_KEY, assignments);
  dispatchClassroomChange();
  return assignments;
};

export const createAssignmentRecord = (input: CreateAssignmentRecordInput) => {
  const existing = listAssignmentRecords();
  const nowIso = new Date().toISOString();
  const assignment = normalizeAssignmentRecord({
    ...input.assignment,
    id: input.assignment.id || `asg-rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: input.assignment.createdAt || nowIso,
  });

  saveAssignmentRecords([assignment, ...existing]);
  return assignment;
};

export const listClassroomAssignmentRecords = (classCode: string) => {
  const normalized = normalizeClassCode(classCode);
  return listAssignmentRecords().filter((assignment) =>
    assignment.assignmentInfo.targetClassCodes.includes(normalized)
  );
};

export const listTeacherInboxMessages = (classCode?: string) => {
  const normalizedClassCode = classCode ? normalizeClassCode(classCode) : null;
  const messages = readJSON<TeacherInboxMessage[]>(TEACHER_INBOX_STORAGE_KEY, []);
  return messages
    .filter((message) => message && message.id)
    .map((message) => ({
      ...message,
      classCode: normalizeClassCode(message.classCode),
    }))
    .filter((message) => (normalizedClassCode ? message.classCode === normalizedClassCode : true))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const saveTeacherInboxMessages = (messages: TeacherInboxMessage[]) => {
  writeJSON(TEACHER_INBOX_STORAGE_KEY, messages);
  dispatchClassroomChange();
  return messages;
};

export const createTeacherInboxMessage = (input: CreateTeacherInboxMessageInput) => {
  const message: TeacherInboxMessage = {
    id: `tea-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    classCode: normalizeClassCode(input.classCode),
    title: input.title.trim() || "Classroom update",
    message: input.message.trim(),
    teacherId: input.teacherId,
    teacherName: input.teacherName.trim() || "Unknown Teacher",
    teacherEmail: input.teacherEmail.trim(),
    createdAt: new Date().toISOString(),
  };

  const existing = listTeacherInboxMessages();
  saveTeacherInboxMessages([message, ...existing]);
  return message;
};

export const listClassroomMembers = (
  classCode: string,
  allUsers: Student[]
): { teachers: ClassroomMember[]; students: ClassroomMember[] } => {
  const room = getManagedClassroomByCode(classCode);
  if (!room) {
    return { teachers: [], students: [] };
  }

  const userById = new Map(allUsers.map((user) => [user.id, user]));

  const toMember = (userId: string, role: "teacher" | "student"): ClassroomMember => {
    const user = userById.get(userId);
    return {
      userId,
      role,
      name: user?.nickname || "Unknown User",
      email: user?.email || "-",
      avatar: user?.avatar,
      subject: user?.subject,
      joinedAt: room.createdAt,
    };
  };

  return {
    teachers: uniqueArray(room.teacherIds).map((id) => toMember(id, "teacher")),
    students: uniqueArray(room.studentIds).map((id) => toMember(id, "student")),
  };
};
