import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/index';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useAppSettings } from '@/hooks/useAppSettings';
import { ArrowRight, CheckCircle2, CircleDot, Sparkles, Target } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const th = settings.language === 'th';
  const heroImageSrc = `${import.meta.env.BASE_URL}welcome-hero-student.svg`;

  const highlights = th
    ? [
        'รวมงานทุกวิชาไว้ที่เดียว ไม่ต้องคอยไล่แชต',
        'Smart Priority ช่วยเรียงลำดับงานที่ควรเริ่มก่อน',
        'ติดตามสตรีกและความคืบหน้าได้แบบเห็นภาพทันที',
      ]
    : [
        'Keep every subject in one organized workspace',
        'Smart Priority ranks what to start first',
        'Track your streak and progress at a glance',
      ];

  const stats = th
    ? [
        { label: 'นักเรียนใช้งานแล้ว', value: '12K+' },
        { label: 'งานที่ส่งตรงเวลา', value: '96%' },
        { label: 'เวลาที่ประหยัดได้', value: '4.2 ชม./สัปดาห์' },
      ]
    : [
        { label: 'Active students', value: '12K+' },
        { label: 'On-time submissions', value: '96%' },
        { label: 'Saved each week', value: '4.2 hrs' },
      ];

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex w-full max-w-md flex-col px-4 pb-10 pt-6"
        >
          <motion.section
            variants={staggerItem}
            className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-white shadow-[0_22px_60px_rgba(22,119,255,0.18)]"
          >
            <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {th ? 'พื้นที่เรียนที่ตั้งใจออกแบบเพื่อ ม.ปลาย' : 'Built for high-school students'}
            </div>

            <img
              src={heroImageSrc}
              alt={th ? 'ภาพประกอบนักเรียนจัดการงานด้วย DekThai' : 'Student productivity illustration'}
              className="h-[300px] w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-900/80 via-slate-900/35 to-transparent px-4 pb-4 pt-16 text-white">
              <div className="flex items-center gap-2 text-xs font-medium text-white/90">
                <CircleDot className="h-3.5 w-3.5 text-secondary" />
                {th ? 'สตรีกส่งงานต่อเนื่อง 7 วัน' : '7-day on-time streak'}
              </div>
              <p className="mt-1 text-sm text-white/90">
                {th ? 'วางแผนงานรายวันแบบไม่ลืมเดดไลน์' : 'Daily planning without missing deadlines'}
              </p>
            </div>
          </motion.section>

          <motion.section variants={fadeInUp} className="mt-6 space-y-4">
            <h1 className="text-center text-[2.1rem] font-bold leading-tight text-foreground">
              Dek<span className="text-primary">Thai</span>
            </h1>
            <p className="text-center text-base font-medium leading-relaxed text-muted-foreground">
              {th ? (
                <>
                  ส่งงานต่อเนื่องแบบไม่ลนเดดไลน์
                  <br />
                  และไม่มีคำว่า <span className="font-semibold text-destructive">หลุด</span> อีกต่อไป
                </>
              ) : (
                <>
                  Keep submissions consistent without deadline panic.
                  <br />
                  No more missing tasks.
                </>
              )}
            </p>
          </motion.section>

          <motion.section variants={fadeInUp} className="mt-5 grid grid-cols-3 gap-2.5">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-card/95 p-3 text-center shadow-sm">
                <p className="text-sm font-bold text-foreground">{item.value}</p>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </motion.section>

          <motion.section variants={fadeInUp} className="mt-6 space-y-3 rounded-3xl border border-primary/10 bg-muted/40 p-4">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <p className="text-sm leading-relaxed text-foreground/80">{item}</p>
              </div>
            ))}
          </motion.section>

          <motion.section variants={fadeInUp} className="mt-7 space-y-3">
            <Button
              onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-primary to-secondary text-base font-semibold text-white shadow-lg shadow-primary/25 hover:opacity-95"
            >
              {th ? 'เริ่มใช้งานฟรี' : 'Start for free'}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTE_PATHS.LOGIN)}
              className="h-12 w-full rounded-2xl border-primary/30 bg-white/70 text-base font-semibold text-primary hover:bg-primary/5"
            >
              <Target className="h-4 w-4" />
              {th ? 'มีบัญชีอยู่แล้ว เข้าสู่ระบบ' : 'Already have an account? Sign in'}
            </Button>
          </motion.section>

          <motion.p variants={fadeInUp} className="mt-6 text-center text-[11px] text-muted-foreground/70">
            © 2026 DekThai • {th ? 'ผู้ช่วยจัดการงานสำหรับนักเรียนไทย' : 'Student-first assignment planner'}
          </motion.p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Welcome;
