import { useAppSettings } from "@/hooks/useAppSettings";

export const useLocale = () => {
  const { settings } = useAppSettings();
  const language = settings.language;
  const th = language === "th";

  const tx = (thText: string, enText: string) => (th ? thText : enText);

  return {
    language,
    th,
    tx,
  };
};

