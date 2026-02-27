import { useCallback, useEffect, useState } from "react";
import { AssignmentRecord, ClassroomMember, ManagedClassroom, ROUTE_PATHS, Student, TeacherAssignmentRecord } from "@/lib";
import {
  AUTH_EVENT,
  AUTH_STORAGE_KEY,
  AuthState,
  getCurrentUser,
  listAccounts as listLocalAccounts,
  loginAccount,
  logoutAccount,
  readAuthState,
  registerAccount,
} from "@/lib/authStorage";
import {
  CLASSROOM_EVENT,
  createAssignmentRecord,
  createTeacherAssignment,
  listClassroomAssignments,
  listTeacherAssignments,
} from "@/lib/classroomStorage";
import { supabase } from "@/lib/supabaseClient";

type RegisterPayload = Partial<Student> & {
  password?: string;
  emailOtp?: string;
};

type RegisterResult =
  | Student
  | {
      pendingEmailVerification: true;
      email: string;
    };

type CreateClassroomPayload = {
  gradeRoom: string;
  school?: string;
  code?: string;
};

type AssignTeacherPayload = {
  classCode: string;
  teacherEmail: string;
};

type CreateTeacherAssignmentPayload = {
  classCode: string;
  title: string;
  subject: string;
  instruction?: string;
  deadline: string;
  allowResubmit?: boolean;
};

type CreateDetailedAssignmentPayload = Omit<AssignmentRecord, "id" | "createdAt"> &
  Partial<Pick<AssignmentRecord, "id" | "createdAt">>;

type ProfileRow = {
  id: string;
  role: "student" | "teacher";
  nickname: string;
  school: string;
  grade: string;
  subject: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  stack_count: number | null;
  max_stack: number | null;
  on_time_rate: number | null;
  backlog_count: number | null;
  class_code: string | null;
  status: "pending" | "approved" | "none";
  is_anonymous: boolean | null;
  managed_class_codes: string[] | null;
  assigned_class_codes: string[] | null;
};

type ClassroomRow = {
  code: string;
  grade_room: string;
  school: string;
  owner_teacher_id: string;
  owner_teacher_name: string;
  created_at: string;
};

type MemberBucket = {
  teachers: ClassroomMember[];
  students: ClassroomMember[];
};

type ClassroomFinder = Pick<ManagedClassroom, "code" | "gradeRoom" | "school">;

const normalizeClassCode = (code: string) => code.trim().toUpperCase();
const toUnique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_PATTERN.test(value);
const DEV_FALLBACK_EMAIL_OTP = "123456";
const isTestOtpEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_TEST_OTP === "true";
const AUTH_RESET_VERSION = "2026-02-27-v2";
const AUTH_RESET_VERSION_KEY = "dekthai_auth_reset_version";
const AUTH_MIRROR_EVENT_SOURCE = "useAuth:mirror-sync";
const AUTH_MIRROR_STORAGE = typeof window !== "undefined" ? window.sessionStorage : null;

const createAvatarFromSeed = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;

const mapProfile = (row: ProfileRow): Student => ({
  id: row.id,
  role: row.role,
  nickname: row.nickname || "New User",
  school: row.school || "Unknown School",
  grade: row.grade || (row.role === "teacher" ? "Teacher" : "Unknown"),
  subject: row.subject || undefined,
  email: row.email,
  phone: row.phone || undefined,
  avatar: row.avatar || undefined,
  stackCount: row.stack_count ?? 0,
  maxStack: row.max_stack ?? 0,
  onTimeRate: row.on_time_rate ?? 100,
  backlogCount: row.backlog_count ?? 0,
  classCode: row.class_code || undefined,
  status: row.status || (row.role === "teacher" ? "approved" : "none"),
  isAnonymous: Boolean(row.is_anonymous),
  managedClassCodes: row.managed_class_codes || (row.role === "teacher" ? [] : undefined),
  assignedClassCodes: row.assigned_class_codes || (row.role === "teacher" ? [] : undefined),
});

const mapClassroom = (
  room: ClassroomRow,
  teacherIds: string[] = [],
  studentIds: string[] = []
): ManagedClassroom => ({
  code: normalizeClassCode(room.code),
  gradeRoom: room.grade_room,
  school: room.school,
  ownerTeacherId: room.owner_teacher_id,
  ownerTeacherName: room.owner_teacher_name,
  teacherIds: toUnique(teacherIds),
  studentIds: toUnique(studentIds),
  createdAt: room.created_at,
});

const toLocalAuthState = (profile: Student | null): AuthState => {
  if (!profile) {
    return { currentAccountId: null, accounts: {}, emailIndex: {} };
  }

  const nowIso = new Date().toISOString();
  return {
    currentAccountId: profile.id,
    accounts: {
      [profile.id]: {
        id: profile.id,
        email: profile.email,
        emailNormalized: profile.email.toLowerCase(),
        password: "",
        profile,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    },
    emailIndex: {
      [profile.email.toLowerCase()]: profile.id,
    },
  };
};

const pushAuthMirror = (profile: Student | null) => {
  const state = toLocalAuthState(profile);
  AUTH_MIRROR_STORAGE?.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent(AUTH_EVENT, {
      detail: { source: AUTH_MIRROR_EVENT_SOURCE },
    })
  );
};

const getClassroomMemberName = (student: Student | undefined) => student?.nickname || "Unknown User";
const getClassroomMemberEmail = (student: Student | undefined) => student?.email || "-";

const buildProfileInsertPayload = (input: RegisterPayload, userId: string, email: string): Omit<ProfileRow, "id"> => {
  const role = input.role === "teacher" ? "teacher" : "student";
  const nickname = (input.nickname || "").trim() || "New User";

  return {
    role,
    nickname,
    school: (input.school || "").trim() || "Unknown School",
    grade: role === "teacher" ? "Teacher" : ((input.grade || "").trim() || "Unknown"),
    subject: role === "teacher" ? ((input.subject || "").trim() || "General") : null,
    email: email.trim().toLowerCase(),
    phone: (input.phone || "").trim() || null,
    avatar: input.avatar || createAvatarFromSeed(`${nickname || email}-${userId}`),
    stack_count: 0,
    max_stack: 0,
    on_time_rate: 100,
    backlog_count: 0,
    class_code: null,
    status: role === "teacher" ? "approved" : "none",
    is_anonymous: false,
    managed_class_codes: role === "teacher" ? [] : null,
    assigned_class_codes: role === "teacher" ? [] : null,
  };
};

const getStringMeta = (value: unknown) => (typeof value === "string" ? value : "");
const getMetaRole = (value: unknown): "student" | "teacher" | null => {
  if (value === "student" || value === "teacher") return value;
  return null;
};
const getLocalProfiles = (state = readAuthState()) => listLocalAccounts(state).map((account) => account.profile);

const applyOneTimeAuthReset = async () => {
  if (localStorage.getItem(AUTH_RESET_VERSION_KEY) === AUTH_RESET_VERSION) {
    return;
  }

  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("dekthai_") || key.startsWith("sb-")) {
      localStorage.removeItem(key);
    }
  });

  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // ignore cleanup errors
  }

  localStorage.setItem(AUTH_RESET_VERSION_KEY, AUTH_RESET_VERSION);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const useAuth = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [accounts, setAccounts] = useState<Student[]>([]);
  const [teacherClassrooms, setTeacherClassrooms] = useState<ManagedClassroom[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentRecord[]>([]);
  const [classroomMembersByCode, setClassroomMembersByCode] = useState<Record<string, MemberBucket>>({});
  const [isLoading, setIsLoading] = useState(true);

  const syncFromCloud = useCallback(async () => {
    setIsLoading(true);

    try {
      const localState = isTestOtpEnabled ? readAuthState() : null;
      const localCurrent = localState ? getCurrentUser(localState) : null;

      const [{ data: authData }, { data: authSession }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      const authUser = authData.user || authSession.session?.user || null;
      if (!authUser) {
        if (isTestOtpEnabled && localCurrent) {
          setStudent(localCurrent);
          setAccounts(getLocalProfiles(localState || undefined));
          setTeacherClassrooms([]);
          setTeacherAssignments([]);
          setClassroomMembersByCode({});
          return localCurrent;
        }

        setStudent(null);
        setAccounts(isTestOtpEnabled ? getLocalProfiles() : []);
        setTeacherClassrooms([]);
        setTeacherAssignments([]);
        setClassroomMembersByCode({});
        if (!isTestOtpEnabled) {
          pushAuthMirror(null);
        }
        return null;
      }

      const { data: profileRaw, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle<ProfileRow>();

      if (profileError) throw profileError;
      let profileResolved = profileRaw;

      if (!profileResolved) {
        const meta = (authUser.user_metadata || {}) as Record<string, unknown>;
        const appMeta = (authUser.app_metadata || {}) as Record<string, unknown>;
        const metaRole = getMetaRole(meta.role) || getMetaRole(appMeta.role);
        if (!metaRole) {
          throw new Error("Account profile is missing. Please sign up again from the Register page.");
        }

        const bootstrapPayload = buildProfileInsertPayload(
          {
            role: metaRole,
            nickname: getStringMeta(meta.nickname),
            school: getStringMeta(meta.school),
            grade: getStringMeta(meta.grade),
            subject: getStringMeta(meta.subject),
            phone: getStringMeta(meta.phone),
            avatar: getStringMeta(meta.avatar),
          },
          authUser.id,
          authUser.email || ""
        );

        const createProfileResult = await supabase
          .from("profiles")
          .upsert(
            {
              id: authUser.id,
              ...bootstrapPayload,
            },
            { onConflict: "id" }
          )
          .select("*")
          .maybeSingle<ProfileRow>();

        if (createProfileResult.error) throw createProfileResult.error;
        if (!createProfileResult.data) {
          throw new Error("Profile not found. Please re-register this account.");
        }
        profileResolved = createProfileResult.data;
      }

      let currentStudent = mapProfile(profileResolved);
      const teacherClassSet = new Set<string>();
      const managedCodes: string[] = [];
      const assignedCodes: string[] = [];

      let classroomRows: ClassroomRow[] = [];
      if (currentStudent.role === "teacher") {
        const [ownedResult, assignedResult] = await Promise.all([
          supabase.from("classrooms").select("*").eq("owner_teacher_id", currentStudent.id),
          supabase.from("classroom_teachers").select("class_code").eq("teacher_id", currentStudent.id),
        ]);

        if (ownedResult.error) throw ownedResult.error;
        if (assignedResult.error) throw assignedResult.error;

        const ownedRooms = (ownedResult.data || []) as ClassroomRow[];
        const assignedCodesRaw = toUnique(
          (assignedResult.data || []).map((row) => normalizeClassCode(row.class_code))
        );

        let assignedRooms: ClassroomRow[] = [];
        if (assignedCodesRaw.length > 0) {
          const assignedRoomsResult = await supabase
            .from("classrooms")
            .select("*")
            .in("code", assignedCodesRaw);
          if (assignedRoomsResult.error) throw assignedRoomsResult.error;
          assignedRooms = (assignedRoomsResult.data || []) as ClassroomRow[];
        }

        const roomMap = new Map<string, ClassroomRow>();
        [...ownedRooms, ...assignedRooms].forEach((room) => roomMap.set(normalizeClassCode(room.code), room));
        classroomRows = Array.from(roomMap.values());

        classroomRows.forEach((room) => {
          const code = normalizeClassCode(room.code);
          teacherClassSet.add(code);
          assignedCodes.push(code);
          if (room.owner_teacher_id === currentStudent.id) {
            managedCodes.push(code);
          }
        });

        currentStudent = {
          ...currentStudent,
          managedClassCodes: toUnique(managedCodes),
          assignedClassCodes: toUnique(assignedCodes),
          status: "approved",
        };
      } else {
        if (currentStudent.classCode) {
          teacherClassSet.add(normalizeClassCode(currentStudent.classCode));
        }
      }

      const activeCodes = Array.from(teacherClassSet);
      const memberBuckets: Record<string, MemberBucket> = {};
      activeCodes.forEach((code) => {
        memberBuckets[code] = { teachers: [], students: [] };
      });

      let teacherLinks: Array<{ class_code: string; teacher_id: string }> = [];
      let studentLinks: Array<{ class_code: string; student_id: string; joined_at: string }> = [];

      if (activeCodes.length > 0) {
        const [teacherLinksResult, studentLinksResult] = await Promise.all([
          supabase
            .from("classroom_teachers")
            .select("class_code, teacher_id")
            .in("class_code", activeCodes),
          supabase
            .from("classroom_students")
            .select("class_code, student_id, joined_at")
            .in("class_code", activeCodes),
        ]);

        if (teacherLinksResult.error) throw teacherLinksResult.error;
        if (studentLinksResult.error) throw studentLinksResult.error;

        teacherLinks = teacherLinksResult.data || [];
        studentLinks = studentLinksResult.data || [];
      }

      const memberIds = new Set<string>([currentStudent.id]);
      teacherLinks.forEach((row) => memberIds.add(row.teacher_id));
      studentLinks.forEach((row) => memberIds.add(row.student_id));

      let profileRows: ProfileRow[] = [];
      if (memberIds.size > 0) {
        const profileListResult = await supabase
          .from("profiles")
          .select("*")
          .in("id", Array.from(memberIds));
        if (profileListResult.error) throw profileListResult.error;
        profileRows = (profileListResult.data || []) as ProfileRow[];
      }

      const accountProfiles = profileRows.map(mapProfile);
      const profileMap = new Map(accountProfiles.map((item) => [item.id, item]));

      const teacherIdsByCode = new Map<string, string[]>();
      const studentIdsByCode = new Map<string, string[]>();

      teacherLinks.forEach((row) => {
        const code = normalizeClassCode(row.class_code);
        teacherIdsByCode.set(code, [...(teacherIdsByCode.get(code) || []), row.teacher_id]);

        if (!memberBuckets[code]) memberBuckets[code] = { teachers: [], students: [] };
        const teacherProfile = profileMap.get(row.teacher_id);
        memberBuckets[code].teachers.push({
          userId: row.teacher_id,
          role: "teacher",
          name: getClassroomMemberName(teacherProfile),
          email: getClassroomMemberEmail(teacherProfile),
          avatar: teacherProfile?.avatar,
          subject: teacherProfile?.subject,
          joinedAt: new Date().toISOString(),
        });
      });

      studentLinks.forEach((row) => {
        const code = normalizeClassCode(row.class_code);
        studentIdsByCode.set(code, [...(studentIdsByCode.get(code) || []), row.student_id]);

        if (!memberBuckets[code]) memberBuckets[code] = { teachers: [], students: [] };
        const studentProfile = profileMap.get(row.student_id);
        memberBuckets[code].students.push({
          userId: row.student_id,
          role: "student",
          name: getClassroomMemberName(studentProfile),
          email: getClassroomMemberEmail(studentProfile),
          avatar: studentProfile?.avatar,
          subject: studentProfile?.subject,
          joinedAt: row.joined_at || new Date().toISOString(),
        });
      });

      const mappedClassrooms = classroomRows.map((room) =>
        mapClassroom(
          room,
          teacherIdsByCode.get(normalizeClassCode(room.code)) || [],
          studentIdsByCode.get(normalizeClassCode(room.code)) || []
        )
      );

      const classroomCodeSet = new Set(mappedClassrooms.map((room) => room.code));
      const assignments = listTeacherAssignments().filter((assignment) => classroomCodeSet.has(assignment.classCode));

      setStudent(currentStudent);
      setAccounts(accountProfiles);
      setTeacherClassrooms(mappedClassrooms);
      setTeacherAssignments(assignments);
      setClassroomMembersByCode(memberBuckets);
      pushAuthMirror(currentStudent);
      return currentStudent;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      await applyOneTimeAuthReset();
      await syncFromCloud();
    };
    void bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void syncFromCloud();
    });

    const onChange = (event: Event) => {
      if (event.type === AUTH_EVENT) {
        const authEvent = event as CustomEvent<{ source?: string }>;
        if (authEvent.detail?.source === AUTH_MIRROR_EVENT_SOURCE) {
          return;
        }
      }
      void syncFromCloud();
    };
    window.addEventListener(CLASSROOM_EVENT, onChange);
    window.addEventListener(AUTH_EVENT, onChange);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener(CLASSROOM_EVENT, onChange);
      window.removeEventListener(AUTH_EVENT, onChange);
    };
  }, [syncFromCloud]);

  const findClassroomByCode = useCallback(async (code: string): Promise<ClassroomFinder | null> => {
    const normalizedCode = normalizeClassCode(code);
    const { data, error } = await supabase
      .from("classrooms")
      .select("code, grade_room, school")
      .eq("code", normalizedCode)
      .maybeSingle<{ code: string; grade_room: string; school: string }>();

    if (error) throw error;
    if (!data) return null;
    return {
      code: normalizeClassCode(data.code),
      gradeRoom: data.grade_room,
      school: data.school,
    };
  }, []);

  const login = useCallback(async (email: string, password = "") => {
    setIsLoading(true);
    await delay(250);

    const loginResult = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (!loginResult.error) {
      const synced = await syncFromCloud();
      if (!synced) throw new Error("Login succeeded but profile was not found.");
      return synced;
    }

    if (isTestOtpEnabled) {
      try {
        const localAccount = loginAccount({ email: email.trim(), password }, readAuthState());
        const localProfiles = getLocalProfiles(readAuthState());
        setStudent(localAccount.profile);
        setAccounts(localProfiles);
        setTeacherClassrooms([]);
        setTeacherAssignments([]);
        setClassroomMembersByCode({});
        setIsLoading(false);
        return localAccount.profile;
      } catch {
        // fallback error is handled below from Supabase login
      }
    }

    if (loginResult.error) {
      setIsLoading(false);
      throw new Error(loginResult.error.message || "Unable to login.");
    }
  }, [syncFromCloud]);

  const resolveCloudUserId = useCallback(async () => {
    if (student?.id && isUuid(student.id)) {
      return student.id;
    }

    const authUserResult = await supabase.auth.getUser();
    if (authUserResult.error) {
      throw new Error(authUserResult.error.message || "Unable to resolve your account.");
    }

    const authUserId = authUserResult.data.user?.id || "";
    if (!isUuid(authUserId)) {
      throw new Error("Current account is in local test mode. Please sign in with your real account.");
    }
    return authUserId;
  }, [student]);

  const requestRegisterEmailOtp = useCallback(async (emailInput: string) => {
    setIsLoading(true);
    await delay(250);

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setIsLoading(false);
      throw new Error("Email is required.");
    }

    if (isTestOtpEnabled) {
      setIsLoading(false);
      return { email };
    }

    const otpResult = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (otpResult.error) {
      setIsLoading(false);
      throw new Error(otpResult.error.message || "Unable to send verification code.");
    }

    setIsLoading(false);
    return { email };
  }, []);

  const register = useCallback(
    async (data: RegisterPayload): Promise<RegisterResult> => {
      setIsLoading(true);
      await delay(300);

      const email = (data.email || "").trim().toLowerCase();
      const password = data.password || "";
      const emailOtp = (data.emailOtp || "").trim();
      if (!email) {
        setIsLoading(false);
        throw new Error("Email is required.");
      }
      if (password.length < 6) {
        setIsLoading(false);
        throw new Error("Password must be at least 6 characters.");
      }
      if (!emailOtp) {
        setIsLoading(false);
        throw new Error("Verification code is required.");
      }

      const isDevFallbackOtp = isTestOtpEnabled && emailOtp === DEV_FALLBACK_EMAIL_OTP;
      if (isDevFallbackOtp) {
        const localAccount = registerAccount(
          {
            role: data.role === "teacher" ? "teacher" : "student",
            nickname: (data.nickname || "").trim() || "New User",
            school: (data.school || "").trim() || "Unknown School",
            grade: (data.grade || "").trim() || "Unknown",
            subject: (data.subject || "").trim() || "General",
            email,
            phone: (data.phone || "").trim() || undefined,
            password,
            avatar: data.avatar,
          },
          readAuthState()
        );

        const localProfiles = getLocalProfiles(readAuthState());
        setStudent(localAccount.profile);
        setAccounts(localProfiles);
        setTeacherClassrooms([]);
        setTeacherAssignments([]);
        setClassroomMembersByCode({});
        setIsLoading(false);
        return localAccount.profile;
      }

      let userId = "";
      const isPendingEmailVerification = false;
      const verifyResult = await supabase.auth.verifyOtp({
        email,
        token: emailOtp,
        type: "email",
      });

      if (verifyResult.error) {
        setIsLoading(false);
        throw new Error(verifyResult.error.message || "Unable to verify email code.");
      }

      userId = verifyResult.data.user?.id || "";
      if (!userId) {
        setIsLoading(false);
        throw new Error("Email verified but user session is unavailable.");
      }

      const normalizedRole = data.role === "teacher" ? "teacher" : "student";
      const passwordResult = await supabase.auth.updateUser({
        password,
        data: {
          role: normalizedRole,
          nickname: (data.nickname || "").trim() || "New User",
          school: (data.school || "").trim() || "Unknown School",
          grade: normalizedRole === "student" ? (data.grade || "").trim() || "Unknown" : "Teacher",
          subject: normalizedRole === "teacher" ? (data.subject || "").trim() || "General" : "",
          phone: (data.phone || "").trim(),
          avatar: data.avatar || "",
        },
      });
      if (passwordResult.error) {
        setIsLoading(false);
        throw new Error(passwordResult.error.message || "Unable to set account password.");
      }

      const existingProfileResult = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle<{ id: string }>();
      if (existingProfileResult.error) {
        setIsLoading(false);
        throw new Error(existingProfileResult.error.message || "Unable to verify account profile.");
      }
      if (existingProfileResult.data?.id) {
        setIsLoading(false);
        throw new Error("This email is already registered. Please sign in.");
      }

      if (isPendingEmailVerification) {
        setIsLoading(false);
        return {
          pendingEmailVerification: true,
          email,
        };
      }

      const profilePayload = buildProfileInsertPayload(data, userId, email);
      const upsertResult = await supabase.from("profiles").upsert(
        {
          id: userId,
          ...profilePayload,
        },
        { onConflict: "id" }
      );
      if (upsertResult.error) {
        setIsLoading(false);
        throw new Error(upsertResult.error.message || "Unable to save profile.");
      }

      const synced = await syncFromCloud();
      if (!synced) throw new Error("Account created but cannot load profile.");
      return synced;
    },
    [syncFromCloud]
  );

  const joinClass = useCallback(
    async (code: string, meta?: { grade?: string; school?: string }) => {
      if (!student || student.role !== "student") return null;

      setIsLoading(true);
      await delay(200);

      const normalizedCode = normalizeClassCode(code);
      const foundClassroom = await findClassroomByCode(normalizedCode);
      if (!foundClassroom) {
        setIsLoading(false);
        throw new Error("Classroom not found.");
      }

      const previousClassCode = student.classCode ? normalizeClassCode(student.classCode) : "";
      if (previousClassCode && previousClassCode !== normalizedCode) {
        const removeResult = await supabase
          .from("classroom_students")
          .delete()
          .eq("class_code", previousClassCode)
          .eq("student_id", student.id);
        if (removeResult.error) {
          setIsLoading(false);
          throw new Error(removeResult.error.message || "Unable to move classroom.");
        }
      }

      const addMemberResult = await supabase.from("classroom_students").upsert(
        [
          {
            class_code: normalizedCode,
            student_id: student.id,
            joined_at: new Date().toISOString(),
          },
        ],
        { onConflict: "class_code,student_id" }
      );

      if (addMemberResult.error) {
        setIsLoading(false);
        throw new Error(addMemberResult.error.message || "Unable to join classroom.");
      }

      const hasProfileGrade = Boolean(student.grade?.trim() && !/^unknown/i.test(student.grade.trim()));
      const hasProfileSchool = Boolean(student.school?.trim() && !/^unknown/i.test(student.school.trim()));
      const updateResult = await supabase
        .from("profiles")
        .update({
          class_code: normalizedCode,
          status: "approved",
          grade: hasProfileGrade ? student.grade : meta?.grade || student.grade,
          school: hasProfileSchool ? student.school : meta?.school || student.school,
        })
        .eq("id", student.id);

      if (updateResult.error) {
        setIsLoading(false);
        throw new Error(updateResult.error.message || "Unable to update your profile.");
      }

      return syncFromCloud();
    },
    [findClassroomByCode, student, syncFromCloud]
  );

  const cancelJoinRequest = useCallback(async () => {
    if (!student || student.role !== "student") return null;

    setIsLoading(true);
    await delay(150);

    const removeResult = await supabase.from("classroom_students").delete().eq("student_id", student.id);
    if (removeResult.error) {
      setIsLoading(false);
      throw new Error(removeResult.error.message || "Unable to leave classroom.");
    }

    const updateResult = await supabase
      .from("profiles")
      .update({
        class_code: null,
        status: "none",
      })
      .eq("id", student.id);
    if (updateResult.error) {
      setIsLoading(false);
      throw new Error(updateResult.error.message || "Unable to update your profile.");
    }

    return syncFromCloud();
  }, [student, syncFromCloud]);

  const updateStudent = useCallback(
    async (updates: Partial<Student>) => {
      if (!student) return null;

      const payload: Record<string, unknown> = {};

      if (updates.nickname !== undefined) payload.nickname = updates.nickname;
      if (updates.school !== undefined) payload.school = updates.school;
      if (updates.grade !== undefined) payload.grade = updates.grade;
      if (updates.subject !== undefined) payload.subject = updates.subject || null;
      if (updates.email !== undefined) payload.email = updates.email.toLowerCase();
      if (updates.phone !== undefined) payload.phone = updates.phone || null;
      if (updates.avatar !== undefined) payload.avatar = updates.avatar || null;
      if (updates.stackCount !== undefined) payload.stack_count = updates.stackCount;
      if (updates.maxStack !== undefined) payload.max_stack = updates.maxStack;
      if (updates.onTimeRate !== undefined) payload.on_time_rate = updates.onTimeRate;
      if (updates.backlogCount !== undefined) payload.backlog_count = updates.backlogCount;
      if (updates.classCode !== undefined) payload.class_code = updates.classCode || null;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.isAnonymous !== undefined) payload.is_anonymous = updates.isAnonymous;
      if (updates.managedClassCodes !== undefined) payload.managed_class_codes = updates.managedClassCodes;
      if (updates.assignedClassCodes !== undefined) payload.assigned_class_codes = updates.assignedClassCodes;

      if (Object.keys(payload).length === 0) return student;

      const updateResult = await supabase.from("profiles").update(payload).eq("id", student.id);
      if (updateResult.error) {
        throw new Error(updateResult.error.message || "Unable to update profile.");
      }

      return syncFromCloud();
    },
    [student, syncFromCloud]
  );

  const createClassroom = useCallback(
    async (payload: CreateClassroomPayload) => {
      if (!student || student.role !== "teacher") {
        throw new Error("Only teacher accounts can create classrooms.");
      }

      const gradeRoom = payload.gradeRoom.trim();
      if (!gradeRoom) {
        throw new Error("Classroom name/grade room is required.");
      }

      const code = payload.code ? normalizeClassCode(payload.code) : undefined;
      const nowIso = new Date().toISOString();
      const school = (payload.school || student.school || "Unknown School").trim();
      const ownerTeacherId = await resolveCloudUserId();

      const insertPayload: Record<string, unknown> = {
        grade_room: gradeRoom,
        school,
        owner_teacher_id: ownerTeacherId,
        owner_teacher_name: student.nickname,
        created_at: nowIso,
      };
      if (code) insertPayload.code = code;

      const insertResult = await supabase
        .from("classrooms")
        .insert(insertPayload)
        .select("code")
        .single<{ code: string }>();

      if (insertResult.error) {
        throw new Error(insertResult.error.message || "Unable to create classroom.");
      }

      const roomCode = insertResult.data?.code;

      if (!roomCode) {
        throw new Error("Classroom created but class code is unavailable.");
      }

      const teacherJoinResult = await supabase.from("classroom_teachers").upsert(
        [{ class_code: normalizeClassCode(roomCode), teacher_id: ownerTeacherId }],
        { onConflict: "class_code,teacher_id" }
      );
      if (teacherJoinResult.error) {
        throw new Error(teacherJoinResult.error.message || "Unable to assign owner teacher.");
      }

      await syncFromCloud();

      return {
        code: normalizeClassCode(roomCode),
        gradeRoom,
        school,
        ownerTeacherId,
        ownerTeacherName: student.nickname,
        teacherIds: [ownerTeacherId],
        studentIds: [],
        createdAt: nowIso,
      } as ManagedClassroom;
    },
    [resolveCloudUserId, student, syncFromCloud]
  );

  const assignTeacherToClassroom = useCallback(
    async (payload: AssignTeacherPayload) => {
      if (!student || student.role !== "teacher") {
        throw new Error("Only teacher accounts can assign teachers.");
      }

      const normalizedCode = normalizeClassCode(payload.classCode);
      const canManage = teacherClassrooms.some((room) => room.code === normalizedCode);
      if (!canManage) {
        throw new Error("You do not have permission to edit this classroom.");
      }

      const email = payload.teacherEmail.trim().toLowerCase();
      const targetProfileResult = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle<ProfileRow>();

      if (targetProfileResult.error) throw targetProfileResult.error;
      if (!targetProfileResult.data || targetProfileResult.data.role !== "teacher") {
        throw new Error("Teacher account not found for this email.");
      }

      const assignResult = await supabase.from("classroom_teachers").upsert(
        [{ class_code: normalizedCode, teacher_id: targetProfileResult.data.id }],
        { onConflict: "class_code,teacher_id" }
      );
      if (assignResult.error) {
        throw new Error(assignResult.error.message || "Unable to assign teacher.");
      }

      await syncFromCloud();
      return mapProfile(targetProfileResult.data);
    },
    [student, syncFromCloud, teacherClassrooms]
  );

  const createClassroomAssignment = useCallback(
    async (payload: CreateTeacherAssignmentPayload) => {
      if (!student || student.role !== "teacher") {
        throw new Error("Only teacher accounts can create assignments.");
      }

      const normalizedCode = normalizeClassCode(payload.classCode);
      const room = teacherClassrooms.find((item) => item.code === normalizedCode);
      if (!room) {
        throw new Error("Classroom not found.");
      }

      if (!room.teacherIds.includes(student.id)) {
        throw new Error("You are not assigned to this classroom.");
      }

      if (!payload.title.trim()) {
        throw new Error("Assignment title is required.");
      }

      const assignment = createTeacherAssignment({
        classCode: normalizedCode,
        title: payload.title,
        subject: payload.subject || student.subject || "General",
        instruction: payload.instruction,
        deadline: payload.deadline,
        teacherId: student.id,
        teacherName: student.nickname,
        teacherEmail: student.email,
        allowResubmit: payload.allowResubmit,
      });

      window.dispatchEvent(new Event(CLASSROOM_EVENT));
      return assignment;
    },
    [student, teacherClassrooms]
  );

  const createDetailedAssignment = useCallback(
    async (payload: CreateDetailedAssignmentPayload) => {
      if (!student || student.role !== "teacher") {
        throw new Error("Only teacher accounts can create assignments.");
      }

      const teacherCodeSet = new Set(teacherClassrooms.map((room) => room.code));
      const targetClassCodes = payload.assignmentInfo.targetClassCodes
        .map((code) => normalizeClassCode(code))
        .filter(Boolean);

      if (targetClassCodes.length === 0) {
        throw new Error("At least one target class code is required.");
      }

      const unauthorizedCode = targetClassCodes.find((code) => !teacherCodeSet.has(code));
      if (unauthorizedCode) {
        throw new Error(`You are not assigned to classroom ${unauthorizedCode}.`);
      }

      const assignment = createAssignmentRecord({
        assignment: {
          ...payload,
          assignmentInfo: {
            ...payload.assignmentInfo,
            targetClassCodes,
          },
        },
      });

      window.dispatchEvent(new Event(CLASSROOM_EVENT));
      return assignment;
    },
    [student, teacherClassrooms]
  );

  const getClassroomMembers = useCallback(
    (classCode: string) => {
      return classroomMembersByCode[normalizeClassCode(classCode)] || { teachers: [], students: [] };
    },
    [classroomMembersByCode]
  );

  const getClassroomAssignments = useCallback((classCode: string) => {
    return listClassroomAssignments(classCode);
  }, []);

  const logout = useCallback(async () => {
    if (isTestOtpEnabled) {
      logoutAccount(readAuthState());
    }
    await supabase.auth.signOut();
    setStudent(null);
    setAccounts(isTestOtpEnabled ? getLocalProfiles(readAuthState()) : []);
    setTeacherClassrooms([]);
    setTeacherAssignments([]);
    setClassroomMembersByCode({});
    if (!isTestOtpEnabled) {
      pushAuthMirror(null);
    }
  }, []);

  const isPendingApproval = student?.status === "pending";
  const isApproved = student?.status === "approved";
  const hasNoClass = student?.role === "student" ? student.status === "none" : false;
  const isTeacher = student?.role === "teacher";

  return {
    student,
    currentUser: student,
    accounts,
    isAuthenticated: !!student,
    isLoading,
    isPendingApproval,
    isApproved,
    hasNoClass,
    isTeacher,
    login,
    requestRegisterEmailOtp,
    logout,
    register,
    joinClass,
    cancelJoinRequest,
    updateStudent,
    createClassroom,
    assignTeacherToClassroom,
    createClassroomAssignment,
    createDetailedAssignment,
    teacherClassrooms,
    teacherAssignments,
    getClassroomMembers,
    getClassroomAssignments,
    findClassroomByCode,
    ROUTE_PATHS,
  };
};
