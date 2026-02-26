import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/index';
import { Layout } from '@/components/Layout';
import { RegisterForm } from '@/components/Forms';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSubmit = (data: any) => {
    console.log('Registering with data:', data);
    // In a real app, we would call an API here
    // After successful registration, proceed to PDPA consent page
    navigate(ROUTE_PATHS.PDPA);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-2xl">DT</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              สมัครสมาชิก <span className="text-primary">DekThai</span>
            </h1>
            <p className="text-muted-foreground">
              เริ่มจัดการงานของคุณให้เป็นระบบและลดความเครียดตั้งแต่วันนี้
            </p>
          </div>

          <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm mb-6">
            <RegisterForm onSubmit={handleRegisterSubmit} />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              มีบัญชีอยู่แล้ว?{' '}
              <Link 
                to={ROUTE_PATHS.LOGIN} 
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground px-4">
                การสมัครสมาชิกหมายความว่าคุณยอมรับ{' '}
                <span className="text-foreground font-medium">ข้อกำหนดการใช้งาน</span>{' '}
                และ{' '}
                <span className="text-foreground font-medium">นโยบายความเป็นส่วนตัว</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Decorative elements for the "School-Tech" feel */}
        <div className="fixed -z-10 top-20 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="fixed -z-10 bottom-20 -right-10 w-60 h-60 bg-secondary/5 rounded-full blur-3xl" />
      </div>
    </Layout>
  );
};

export default Register;
