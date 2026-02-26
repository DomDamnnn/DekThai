import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, HelpCircle, ChevronLeft } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { Layout } from '@/components/Layout';
import { ClassCodeForm } from '@/components/Forms';
import { Button } from '@/components/ui/button';

/**
 * ClassCode Page
 * Allows students to enter a classroom code provided by their teacher.
 * This is a critical step in the onboarding flow to connect students with their school system.
 */
const ClassCode: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinClass = (code: string) => {
    // In a production environment, this would involve an API call to validate the code
    // and link the student to the classroom record.
    console.log('Attempting to join classroom with code:', code);
    
    // Navigate to the Pending page where the student waits for teacher approval
    navigate(ROUTE_PATHS.PENDING);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <School className="text-white w-12 h-12" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
                  <div className="bg-secondary/10 p-1 rounded-full">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                เข้าร่วมห้องเรียน
              </h1>
              <p className="text-muted-foreground">
                กรอกรหัส Class Code 6 หลักที่ได้รับจากคุณครู <br />
                เพื่อเชื่อมต่อข้อมูลวิชาและงานของคุณ
              </p>
            </div>
          </div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card p-6 rounded-[2rem] border border-border shadow-xl shadow-black/[0.03] relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <ClassCodeForm onSubmit={handleJoinClass} />
            </div>
          </motion.div>

          {/* Secondary Actions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 pt-4"
          >
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                พบปัญหาใช่ไหม?
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                className="rounded-2xl h-14 flex items-center justify-center gap-3 border-dashed hover:bg-accent"
              >
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">ฉันไม่มีรหัสห้องเรียน</span>
              </Button>

              <Button 
                variant="ghost" 
                className="rounded-2xl h-12 text-muted-foreground hover:text-foreground"
                onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                กลับไปแก้ไขข้อมูลส่วนตัว
              </Button>
            </div>
          </motion.div>

          {/* Footer Info */}
          <p className="text-[13px] text-center text-muted-foreground leading-relaxed px-4">
            การเข้าร่วมห้องเรียนช่วยให้คุณได้รับการแจ้งเตือนงานทันทีเมื่อคุณครูมอบหมาย และระบบ Smart Priority จะเริ่มจัดลำดับงานให้คุณโดยอัตโนมัติ
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ClassCode;