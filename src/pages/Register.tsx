import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/index';
import { Layout } from '@/components/Layout';
import { RegisterForm, RegisterValues } from '@/components/Forms';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, requestRegisterEmailOtp } = useAuth();
  const { toast } = useToast();

  const handleRequestOtp = async (data: RegisterValues) => {
    try {
      await requestRegisterEmailOtp(data.email);
      toast({
        title: 'Verification code sent',
        description: `Please check ${data.email} and enter the code.`,
      });
    } catch (error: any) {
      const message = String(error?.message || '').toLowerCase();
      const isRateLimited = message.includes('rate limit');

      if (import.meta.env.DEV && isRateLimited) {
        toast({
          title: 'Dev fallback enabled',
          description: 'Email OTP is rate-limited. Use test code 123456 to continue.',
        });
        return;
      }

      toast({
        title: 'Send code failed',
        description: error?.message || 'Unable to send verification code.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleRegisterSubmit = async (data: RegisterValues & { emailOtp: string }) => {
    try {
      const user = await register(data);
      toast({
        title: 'Account created',
        description: `Welcome ${user.nickname}`,
      });
      if (user.role === 'teacher') {
        navigate(ROUTE_PATHS.TEACHER_CLASSROOMS);
        return;
      }
      navigate(ROUTE_PATHS.CLASS_CODE);
    } catch (error: any) {
      toast({
        title: 'Verify failed',
        description: error?.message || 'Unable to create account.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleResendOtp = async (email: string) => {
    try {
      await requestRegisterEmailOtp(email);
      toast({
        title: 'Verification code sent again',
        description: `A new code was sent to ${email}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Resend failed',
        description: error?.message || 'Unable to resend verification code.',
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create <span className="text-primary">DekThai</span> Account
            </h1>
            <p className="text-muted-foreground">
              Start organizing your school tasks with less stress.
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
              Already have an account?{' '}
              <Link
                to={ROUTE_PATHS.LOGIN}
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground px-4">
                By creating an account, you agree to Terms of Use and Privacy Policy.
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
