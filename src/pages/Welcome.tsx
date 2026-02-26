import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col min-h-[calc(100vh-80px)] overflow-hidden bg-background">
        {/* Hero Section with Image */}
        <div className="relative w-full h-[45vh] overflow-hidden rounded-b-[2.5rem] shadow-xl">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src={IMAGES.STUDENT_HERO_1}
            alt="Student studying"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          {/* Floating Badge Area */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, ...springPresets.gentle }}
            className="absolute bottom-8 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-primary/10 flex items-center gap-2"
          >
            <div className="bg-secondary/20 p-2 rounded-full">
              <Zap className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">ส่งงานต่อเนื่อง</p>
              <p className="text-xs font-bold text-foreground">7 วันติดแล้ว!</p>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 px-6 pt-8 pb-12 flex flex-col items-center text-center"
        >
          <motion.div variants={fadeInUp} className="mb-2">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
              เพื่อนแท้สำหรับนักเรียนมัธยม
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
              Dek<span className="text-primary">Thai</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-[280px] mx-auto">
              ช่วยให้ส่งงานต่อเนื่อง และไม่มีคำว่า <span className="text-destructive font-semibold underline decoration-2 underline-offset-4">หลุด</span> อีกต่อไป
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-3 mt-6 mb-10 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5" />
              <p className="text-sm text-muted-foreground">จัดการทุกวิชาได้ในที่เดียว ไม่ต้องตามแชทให้วุ่นวาย</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5" />
              <p className="text-sm text-muted-foreground">Smart Priority ช่วยบอกว่าควรเริ่มทำชิ้นไหนก่อน</p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="w-full space-y-4 mt-auto">
            <Button 
              onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              เริ่มต้นใช้งานฟรี
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">มีบัญชีอยู่แล้ว?</span>
              <Button 
                variant="ghost" 
                onClick={() => navigate(ROUTE_PATHS.LOGIN)}
                className="text-primary font-bold hover:bg-primary/5 px-2"
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </motion.div>

          <motion.p 
            variants={fadeInUp}
            className="mt-8 text-[10px] text-muted-foreground opacity-60"
          >
            © 2026 DekThai - นวัตกรรมเพื่อการศึกษาไทย
          </motion.p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Welcome;