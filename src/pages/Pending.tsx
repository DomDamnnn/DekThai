import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MessageCircle, XCircle, ShieldCheck, ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ROUTE_PATHS } from "@/lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/hooks/useLocale";

const Pending: React.FC = () => {
  const navigate = useNavigate();
  const { tx } = useLocale();

  const handleCancelRequest = () => {
    // In a real app, this would call an API
    navigate(ROUTE_PATHS.CLASS_CODE);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md text-center"
        >
          {/* Status Icon with Pulse Effect */}
          <div className="relative mb-8 flex justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
            />
            <div className="relative bg-white dark:bg-card p-6 rounded-full shadow-xl border-4 border-primary/10">
              <Clock className="w-16 h-16 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold mb-3 text-foreground">
            {tx("ส่งคำขอเรียบร้อยแล้ว!", "Request sent!")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {tx(
              "คำขอเข้าห้องเรียนของคุณกำลังรอการอนุมัติจากคุณครู กรุณารอสักครู่ ระบบจะแจ้งเตือนเมื่อคุณเข้าห้องเรียนสำเร็จ",
              "Your classroom join request is waiting for teacher approval. We'll notify you once you're approved."
            )}
          </p>

          {/* Info Card */}
          <Card className="mb-8 border-dashed border-2 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground font-medium">{tx("รหัสห้องเรียน", "Class code")}</span>
                <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  DEK-2026-TH
                </span>
              </div>
              <div className="flex items-center gap-3 text-left p-3 bg-white dark:bg-card rounded-xl border border-border shadow-sm">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{tx("วิชาภาษาไทย (ม.5/1)", "Thai Language (M.5/1)")}</p>
                  <p className="text-xs text-muted-foreground">{tx("โดย คุณครูสมชาย รักเรียน", "By Teacher Somchai Rakrian")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all rounded-2xl shadow-lg shadow-primary/20"
              onClick={() => { /* Open Chat or Support */ }}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {tx("ติดต่อคุณครู", "Contact teacher")}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg font-medium border-border hover:bg-muted/50 rounded-2xl transition-colors"
              onClick={handleCancelRequest}
            >
              <XCircle className="mr-2 h-5 w-5 text-destructive" />
              {tx("ยกเลิกคำขอ", "Cancel request")}
            </Button>
          </div>

          {/* Help Link */}
          <motion.button
            whileHover={{ x: 5 }}
            className="mt-8 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
          >
            {tx("มีปัญหาในการเข้าห้องเรียน?", "Having trouble joining classroom?")} <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Safety Note */}
        <p className="mt-auto text-center text-xs text-muted-foreground opacity-60">
          {tx("ข้อมูลของคุณจะถูกเก็บเป็นความลับตามนโยบาย PDPA", "Your data is handled privately under PDPA policy")}
          <br />
          © 2026 DekThai
        </p>
      </div>
    </Layout>
  );
};

export default Pending;
