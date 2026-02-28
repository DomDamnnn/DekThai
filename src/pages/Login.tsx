import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import { LoginForm } from "@/components/Forms";
import { springPresets, fadeInUp } from "@/lib/motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/hooks/useLocale";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const { tx } = useLocale();

  const handleLoginSubmit = async (data: any) => {
    try {
      const user = await login(data.identifier, data.password);
      if (user.role === "teacher") {
        navigate(ROUTE_PATHS.TEACHER_CLASSROOMS);
        return;
      }
      navigate(ROUTE_PATHS.HOME);
    } catch (error: any) {
      toast({
        title: tx("เข้าสู่ระบบไม่สำเร็จ", "Login failed"),
        description: error?.message || tx("กรุณาตรวจสอบอีเมลและรหัสผ่าน", "Please check your email/password."),
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={springPresets.gentle}
        >
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                D
              </div>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">{tx("เข้าสู่ระบบ DekThai", "Login to DekThai")}</h1>
            <p className="text-muted-foreground">
              {tx("จัดการงานทั้งหมดในที่เดียว และไม่พลาดเดดไลน์อีกต่อไป", "Manage all your tasks in one place and never miss a deadline.")}
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-primary/5">
            <LoginForm onSubmit={handleLoginSubmit} />

            <div className="mt-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{tx("หรือเข้าสู่ระบบด้วย", "or continue with")}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-border bg-background hover:bg-muted transition-colors font-medium">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  {tx("เข้าสู่ระบบด้วย Google", "Continue with Google")}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {tx("ยังไม่มีบัญชีใช่ไหม?", "Don't have an account?")}{" "}
              <Link to={ROUTE_PATHS.REGISTER} className="text-primary font-semibold hover:underline">
                {tx("สมัครสมาชิก", "Register here")}
              </Link>
            </p>
          </div>
        </motion.div>

        <div className="fixed -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="fixed -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl -z-10" />
      </div>
    </Layout>
  );
};

export default Login;
