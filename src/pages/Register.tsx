import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/index';
import { Layout } from '@/components/Layout';
import { RegisterForm, RegisterValues } from '@/components/Forms';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useLocale } from '@/hooks/useLocale';

const isTestOtpEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_TEST_OTP === 'true';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, requestRegisterEmailOtp } = useAuth();
  const { toast } = useToast();
  const { tx } = useLocale();

  const handleRequestOtp = async (data: RegisterValues) => {
    try {
      await requestRegisterEmailOtp(data.email);
      toast({
        title: tx('ส่งรหัสยืนยันแล้ว', 'Verification code sent'),
        description: tx(`กรุณาตรวจสอบ ${data.email} และกรอกรหัส`, `Please check ${data.email} and enter the code.`),
      });
    } catch (error: any) {
      const message = String(error?.message || '').toLowerCase();
      const isRateLimited = message.includes('rate limit');

      if (isTestOtpEnabled && isRateLimited) {
        toast({
          title: tx('เปิดโหมด OTP ทดสอบ', 'Test OTP fallback enabled'),
          description: tx('OTP ทางอีเมลถูกจำกัดชั่วคราว ใช้รหัสทดสอบ 123456 เพื่อดำเนินการต่อ', 'Email OTP is rate-limited. Use test code 123456 to continue.'),
        });
        return;
      }

      toast({
        title: tx('ส่งรหัสไม่สำเร็จ', 'Send code failed'),
        description: error?.message || tx('ไม่สามารถส่งรหัสยืนยันได้', 'Unable to send verification code.'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleRegisterSubmit = async (data: RegisterValues & { emailOtp: string }) => {
    try {
      const result = await register(data);
      if ('pendingEmailVerification' in result && result.pendingEmailVerification) {
        toast({
          title: tx('สร้างบัญชีสำเร็จ', 'Account created'),
          description: tx(`บันทึกการสมัครของ ${result.email} แล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ`, `Signup saved for ${result.email}. Please confirm email once, then sign in.`),
        });
        navigate(ROUTE_PATHS.LOGIN);
        return;
      }

      const user = result;
      toast({
        title: tx('สร้างบัญชีสำเร็จ', 'Account created'),
        description: tx(`ยินดีต้อนรับ ${user.nickname}`, `Welcome ${user.nickname}`),
      });
      if (user.role === 'teacher') {
        navigate(ROUTE_PATHS.TEACHER_CLASSROOMS);
        return;
      }
      navigate(ROUTE_PATHS.HOME);
    } catch (error: any) {
      toast({
        title: tx('ยืนยันไม่สำเร็จ', 'Verify failed'),
        description: error?.message || tx('ไม่สามารถสร้างบัญชีได้', 'Unable to create account.'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleResendOtp = async (email: string) => {
    try {
      await requestRegisterEmailOtp(email);
      toast({
        title: tx('ส่งรหัสยืนยันอีกครั้งแล้ว', 'Verification code sent again'),
        description: tx(`ส่งรหัสใหม่ไปที่ ${email} แล้ว`, `A new code was sent to ${email}.`),
      });
    } catch (error: any) {
      toast({
        title: tx('ส่งรหัสซ้ำไม่สำเร็จ', 'Resend failed'),
        description: error?.message || tx('ไม่สามารถส่งรหัสยืนยันอีกครั้งได้', 'Unable to resend verification code.'),
        variant: 'destructive',
      });
      throw error;
    }
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
            <h1 className="text-3xl font-bold text-foreground mb-2">{tx('สร้างบัญชี DekThai', 'Create DekThai Account')}</h1>
            <p className="text-muted-foreground">
              {tx('เริ่มจัดการงานเรียนให้เป็นระบบและเครียดน้อยลง', 'Start organizing your school tasks with less stress.')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm mb-6">
            <RegisterForm
              onRequestOtp={handleRequestOtp}
              onVerifyOtp={handleRegisterSubmit}
              onResendOtp={handleResendOtp}
            />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {tx('มีบัญชีอยู่แล้ว?', 'Already have an account?')}{' '}
              <Link
                to={ROUTE_PATHS.LOGIN}
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                {tx('เข้าสู่ระบบ', 'Sign in')}
              </Link>
            </p>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground px-4">
                {tx('การสร้างบัญชีถือว่าคุณยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว', 'By creating an account, you agree to Terms of Use and Privacy Policy.')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="fixed -z-10 top-20 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="fixed -z-10 bottom-20 -right-10 w-60 h-60 bg-secondary/5 rounded-full blur-3xl" />
      </div>
    </Layout>
  );
};

export default Register;

