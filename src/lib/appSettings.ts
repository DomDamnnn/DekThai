export type AppLanguage = "th" | "en";
export type AppTheme = "light" | "dark";

export type AppSettings = {
  language: AppLanguage;
  theme: AppTheme;
};

export const APP_SETTINGS_STORAGE_KEY = "dekthai_app_settings_v1";
export const LEGACY_TEACHER_SETTINGS_STORAGE_KEY = "dekthai_teacher_profile_settings_v1";
export const APP_SETTINGS_EVENT = "dekthai-app-settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "th",
  theme: "light",
};

const normalizeSettings = (raw: Partial<AppSettings> | null | undefined): AppSettings => ({
  language: raw?.language === "en" ? "en" : "th",
  theme: raw?.theme === "dark" ? "dark" : "light",
});

const parseSettings = (raw: string | null): AppSettings | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return normalizeSettings(parsed);
  } catch {
    return null;
  }
};

export const readAppSettings = (): AppSettings => {
  const next = parseSettings(localStorage.getItem(APP_SETTINGS_STORAGE_KEY));
  if (next) return next;

  const legacy = parseSettings(localStorage.getItem(LEGACY_TEACHER_SETTINGS_STORAGE_KEY));
  return legacy || DEFAULT_SETTINGS;
};

export const applyAppTheme = (theme: AppTheme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const saveAppSettings = (settings: AppSettings) => {
  const next = normalizeSettings(settings);
  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem(LEGACY_TEACHER_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_EVENT, { detail: next }));
};
