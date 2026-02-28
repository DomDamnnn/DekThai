import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { useLocale } from '@/hooks/useLocale';

type WelcomeProps = {
  onStart?: () => void | Promise<void>;
  onLogin?: () => void | Promise<void>;
};

const LOGO_SRC = `${import.meta.env.BASE_URL}dekthai-logo.png`;

const Welcome: React.FC<WelcomeProps> = ({ onStart, onLogin }) => {
  const navigate = useNavigate();
  const { tx } = useLocale();
  const startLabel = tx('เริ่มใช้งานฟรี', 'Start Free');
  const loginLabel = tx('มีบัญชีอยู่แล้ว เข้าสู่ระบบ', 'I already have an account');
  const footerText = tx('© 2026 DekThai • ผู้ช่วยจัดการงานสำหรับนักเรียนไทย', '© 2026 DekThai • Task assistant for students');

  const handleStart = React.useCallback(async () => {
    if (onStart) {
      await onStart();
      return;
    }

    navigate(ROUTE_PATHS.REGISTER);
  }, [navigate, onStart]);

  const handleLogin = React.useCallback(async () => {
    if (onLogin) {
      await onLogin();
      return;
    }

    navigate(ROUTE_PATHS.LOGIN);
  }, [navigate, onLogin]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F7FAFF] via-[#FCFEFF] to-white px-6 sm:px-8 [padding-top:calc(env(safe-area-inset-top)+1.25rem)] [padding-bottom:calc(env(safe-area-inset-bottom)+1.25rem)]"
      aria-label={tx('หน้าเริ่มต้น DekThai', 'DekThai welcome page')}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(70,130,180,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(70,130,180,0.08)_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl motion-safe:animate-pulse motion-reduce:animate-none" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl motion-safe:animate-pulse motion-reduce:animate-none" />
      <div className="pointer-events-none absolute bottom-16 left-1/3 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl motion-safe:animate-pulse motion-reduce:animate-none" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2.5rem)] w-full max-w-3xl flex-col">
        <section className="flex flex-1 items-center justify-center">
          <div className="rounded-[30px] border border-white/75 bg-white/65 p-3 shadow-[0_20px_60px_-35px_rgba(14,116,144,0.45)] ring-1 ring-sky-100/80 backdrop-blur-md sm:p-4">
            <img
              src={LOGO_SRC}
              alt="DekThai logo"
              className="w-[190px] rounded-[22px] object-contain drop-shadow-[0_12px_26px_rgba(14,116,144,0.18)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700 motion-reduce:opacity-100 sm:w-[225px] md:w-[260px]"
            />
          </div>
        </section>

        <section className="mx-auto mb-7 flex w-full max-w-[500px] flex-col items-center gap-3 sm:mb-8">
          <button
            type="button"
            onClick={handleStart}
            aria-label={startLabel}
            className="h-14 w-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-10 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(14,165,233,0.75)] transition-all duration-300 hover:brightness-105 hover:shadow-[0_24px_46px_-24px_rgba(16,185,129,0.8)] active:scale-[0.985] active:shadow-[0_14px_30px_-20px_rgba(14,165,233,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7FAFF]"
          >
            {`${startLabel} \u2192`}
          </button>

          <button
            type="button"
            onClick={handleLogin}
            aria-label={loginLabel}
            className="h-[54px] w-full rounded-full border border-sky-200/80 bg-white/45 px-8 text-[15px] font-semibold text-sky-700 shadow-[0_8px_24px_-20px_rgba(14,116,144,0.65)] backdrop-blur-sm transition-colors duration-300 hover:bg-sky-50/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7FAFF]"
          >
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-sky-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{loginLabel}</span>
            </span>
          </button>
        </section>

        <footer className="pb-1 text-center text-[11px] text-slate-400 sm:text-xs">{footerText}</footer>
      </div>
    </main>
  );
};

export default Welcome;
