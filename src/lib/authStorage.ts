import { Student, UserRole } from "@/lib";

export const AUTH_STORAGE_KEY = "dekthai_auth_state_v3";
export const AUTH_EVENT = "dekthai_auth_updated";

export interface AccountRecord {
  id: string;
  email: string;
  emailNormalized: string;
  password: string;
  profile: Student;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  currentAccountId: string | null;
  accounts: Record<string, AccountRecord>;
  emailIndex: Record<string, string>;
}

export interface RegisterInput {
  role: UserRole;
  nickname: string;
  school: string;
  grade?: string;
  subject?: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const createEmptyAuthState = (): AuthState => ({
  currentAccountId: null,
  accounts: {},
  emailIndex: {},
});

const getAuthStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const readAuthState = (): AuthState => {
  const raw = getAuthStorage()?.getItem(AUTH_STORAGE_KEY);
  if (!raw) return createEmptyAuthState();

  try {
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      currentAccountId: parsed.currentAccountId ?? null,
      accounts: parsed.accounts ?? {},
      emailIndex: parsed.emailIndex ?? {},
    };
  } catch {
    return createEmptyAuthState();
  }
};

export const saveAuthState = (state: AuthState) => {
  getAuthStorage()?.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const listAccounts = (state = readAuthState()): AccountRecord[] => {
  return Object.values(state.accounts).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const findAccountByEmail = (email: string, state = readAuthState()): AccountRecord | null => {
  const emailNormalized = normalizeEmail(email);
  const accountId = state.emailIndex[emailNormalized];
  if (!accountId) return null;
  return state.accounts[accountId] ?? null;
};

export const getCurrentAccount = (state = readAuthState()): AccountRecord | null => {
  if (!state.currentAccountId) return null;
  return state.accounts[state.currentAccountId] ?? null;
};

export const getCurrentUser = (state = readAuthState()): Student | null => {
  return getCurrentAccount(state)?.profile ?? null;
};

export const setCurrentAccount = (accountId: string | null, state = readAuthState()) => {
  const nextState: AuthState = {
    ...state,
    currentAccountId: accountId && state.accounts[accountId] ? accountId : null,
  };
  saveAuthState(nextState);
  return nextState;
};

const createAvatarFromSeed = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;

const createProfileFromRegisterInput = (input: RegisterInput): Student => {
  const role = input.role;
  const nickname = input.nickname.trim();
  const grade = role === "teacher" ? "Teacher" : (input.grade?.trim() || "Unknown");
  const subject = role === "teacher" ? (input.subject?.trim() || "General") : undefined;
  const status = role === "teacher" ? "approved" : "none";
  const defaultAvatarSeed = `${nickname || input.email}-${role}`;

  return {
    id: generateId(role === "teacher" ? "tch" : "std"),
    role,
    nickname: nickname || "New User",
    school: input.school.trim() || "Unknown School",
    grade,
    subject,
    email: input.email.trim(),
    phone: input.phone?.trim(),
    avatar: input.avatar || createAvatarFromSeed(defaultAvatarSeed),
    stackCount: 0,
    maxStack: 0,
    onTimeRate: 100,
    backlogCount: 0,
    classCode: undefined,
    status,
    isAnonymous: false,
    managedClassCodes: role === "teacher" ? [] : undefined,
    assignedClassCodes: role === "teacher" ? [] : undefined,
  };
};

export const registerAccount = (input: RegisterInput, state = readAuthState()) => {
  const emailNormalized = normalizeEmail(input.email);
  if (!emailNormalized) {
    throw new Error("Email is required.");
  }

  if (state.emailIndex[emailNormalized]) {
    throw new Error("This email is already registered.");
  }

  if (!input.password || input.password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const profile = createProfileFromRegisterInput(input);
  const accountId = profile.id;
  const nowIso = new Date().toISOString();
  const account: AccountRecord = {
    id: accountId,
    email: input.email.trim(),
    emailNormalized,
    password: input.password,
    profile,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const nextState: AuthState = {
    currentAccountId: accountId,
    accounts: {
      ...state.accounts,
      [accountId]: account,
    },
    emailIndex: {
      ...state.emailIndex,
      [emailNormalized]: accountId,
    },
  };

  saveAuthState(nextState);
  return account;
};

export const loginAccount = (input: LoginInput, state = readAuthState()) => {
  const emailNormalized = normalizeEmail(input.email);
  const account = findAccountByEmail(emailNormalized, state);
  if (!account) {
    throw new Error("Account not found.");
  }

  if (account.password !== input.password) {
    throw new Error("Incorrect password.");
  }

  const nextState: AuthState = {
    ...state,
    currentAccountId: account.id,
  };
  saveAuthState(nextState);
  return account;
};

export const logoutAccount = (state = readAuthState()) => {
  if (!state.currentAccountId) return state;
  const nextState: AuthState = { ...state, currentAccountId: null };
  saveAuthState(nextState);
  return nextState;
};

export const updateCurrentUser = (updates: Partial<Student>, state = readAuthState()) => {
  const current = getCurrentAccount(state);
  if (!current) {
    throw new Error("Not authenticated.");
  }

  const nextProfile: Student = {
    ...current.profile,
    ...updates,
  };

  const currentEmailNormalized = normalizeEmail(current.email);
  const nextEmailRaw = updates.email?.trim() || current.email;
  const nextEmailNormalized = normalizeEmail(nextEmailRaw);

  if (!nextEmailNormalized) {
    throw new Error("Email is required.");
  }

  if (
    nextEmailNormalized !== currentEmailNormalized &&
    state.emailIndex[nextEmailNormalized] &&
    state.emailIndex[nextEmailNormalized] !== current.id
  ) {
    throw new Error("This email is already used by another account.");
  }

  const nextEmailIndex = { ...state.emailIndex };
  delete nextEmailIndex[currentEmailNormalized];
  nextEmailIndex[nextEmailNormalized] = current.id;

  const updatedAccount: AccountRecord = {
    ...current,
    email: nextEmailRaw,
    emailNormalized: nextEmailNormalized,
    profile: {
      ...nextProfile,
      email: nextEmailRaw,
    },
    updatedAt: new Date().toISOString(),
  };

  const nextState: AuthState = {
    ...state,
    accounts: {
      ...state.accounts,
      [current.id]: updatedAccount,
    },
    emailIndex: nextEmailIndex,
  };
  saveAuthState(nextState);
  return updatedAccount.profile;
};

export const updateAccountProfileById = (
  accountId: string,
  updates: Partial<Student>,
  state = readAuthState()
) => {
  const target = state.accounts[accountId];
  if (!target) return null;

  const updatedAccount: AccountRecord = {
    ...target,
    profile: {
      ...target.profile,
      ...updates,
    },
    updatedAt: new Date().toISOString(),
  };

  const nextState: AuthState = {
    ...state,
    accounts: {
      ...state.accounts,
      [accountId]: updatedAccount,
    },
  };
  saveAuthState(nextState);
  return updatedAccount.profile;
};

export const getAccountById = (accountId: string, state = readAuthState()) => state.accounts[accountId] ?? null;

