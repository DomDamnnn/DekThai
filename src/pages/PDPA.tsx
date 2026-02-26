import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Info, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

const PDPA: React.FC = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    // In a real app, this would update the user's consent status in the database
    navigate(ROUTE_PATHS.CLASS_CODE);
  };

  const dataItems = [
    {
      title: 'ข้อมูลระบุตัวตน',
      description: 'ชื่อเล่น, โรงเรียน และระดับชั้น เพื่อใช้แสดงผลในระบบและกลุ่มการทำงาน',
      icon: <Info className="w-5 h-5 text-primary" />,
    },
    {
      title: 'ข้อมูลการติดต่อ',
      description: 'อีเมล หรือเบอร์โทรศัพท์ สำหรับการแจ้งเตือนงานและการกู้คืนบัญชี',
      icon: <Lock className="w-5 h-5 text-primary" />,
    },
    {
      title: 'ข้อมูลการเรียน',
      description: 'รายการงาน, เดดไลน์ และไฟล์แนบ เพื่อใช้ในการประมวลผล Smart Priority และจัดตารางงาน',
      icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 pb-12">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">ความเป็นส่วนตัวของคุณ</h1>
          <p className="text-muted-foreground">เราให้ความสำคัญกับการปกป้องข้อมูลส่วนบุคคลของนักเรียนทุกคน</p>
        </div>

        {/* Summary Card */}
        <Card className="border-none shadow-sm mb-6 bg-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">สรุปสั้นๆ ให้เข้าใจง่าย</CardTitle>
            <CardDescription>
              DekThai เก็บข้อมูลเพื่อช่วยให้คุณจัดการงานได้ดีขึ้น ไม่มีการขายข้อมูลให้บุคคลที่สาม
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Details Section */}
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-lg px-2">เราเก็บอะไร และใช้ทำอะไร?</h2>
          {dataItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Terms Scroll Area */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg px-2 mb-3">รายละเอียดเพิ่มเติม</h2>
          <Card className="border-border/50">
            <ScrollArea className="h-40 p-4 text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                1. การประมวลผลข้อมูล: เราใช้ระบบ AI ในการวิเคราะห์ลำดับความสำคัญของงาน (Smart Priority) เพื่อช่วยลดความเครียดและป้องกันการส่งงานล่าช้า
              </p>
              <p className="mb-3">
                2. การแชร์ข้อมูล: ข้อมูลชื่อและสถานะงานของคุณจะถูกแสดงให้ครูและเพื่อนในกลุ่มงาน (DekGroup) เห็นเฉพาะในส่วนที่เกี่ยวข้องกับการทำงานเท่านั้น
              </p>
              <p className="mb-3">
                3. สิทธิของคุณ: คุณสามารถขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณได้ตลอดเวลาผ่านเมนูการตั้งค่าในโปรไฟล์
              </p>
              <p>
                4. ความปลอดภัย: ข้อมูลทั้งหมดจะถูกเข้ารหัสและจัดเก็บไว้ในระบบคลาวด์ที่ได้มาตรฐานสากล
              </p>
            </ScrollArea>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleAccept}
            className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            ยอมรับและดำเนินการต่อ
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="w-full h-12 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-widest">
          DekThai © 2026 Privacy Policy System
        </p>
      </div>
    </div>
  );
};

export default PDPA;