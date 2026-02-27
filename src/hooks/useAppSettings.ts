import { useCallback, useEffect, useState } from "react";
import {
  APP_SETTINGS_EVENT,
  AppSettings,
  applyAppTheme,
  readAppSettings,
  saveAppSettings,
} from "@/lib/appSettings";

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => readAppSettings());

  useEffect(() => {
    const sync = () => {
      setSettings(readAppSettings());
    };

    window.addEventListener("storage", sync);
    window.addEventListener(APP_SETTINGS_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(APP_SETTINGS_EVENT, sync as EventListener);
    };
  }, []);

  useEffect(() => {
    applyAppTheme(settings.theme);
  }, [settings.theme]);

  const commitSettings = useCallback((next: AppSettings) => {
    saveAppSettings(next);
    setSettings(next);
  }, []);

  return {
    settings,
    commitSettings,
  };
};
