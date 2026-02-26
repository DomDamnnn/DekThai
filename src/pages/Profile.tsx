import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  School,
  GraduationCap,
  Zap,
  CheckCircle2,
  AlertCircle,
  Settings,
  Bell,
  Shield,
  LogOut,
  HelpCircle,
  FileText,
  ChevronRight,
  Eye,
  EyeOff,
  Camera,
  Target
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/Cards';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { student, logout, updateStudent, ROUTE_PATHS } = useAuth();
  const navigate = useNavigate();

  if (!student) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.WELCOME);
  };

  const toggleAnonymous = (checked: boolean) => {
    updateStudent({ isAnonymous: checked });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto pb-24">
        {/* Header Section */}
        <header className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-foreground">โปรไฟล์</h1>
          <p className="text-muted-foreground">จัดการข้อมูลส่วนตัวและสถิติของคุณ</p>
        </header>

        {/* Profile Card */}
        <section className="px-4 mb-8">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
            <CardContent className="relative pt-12 pb-6 text-center">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                    <AvatarImage src={student.avatar} alt={student.nickname} />
                    <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-bold">
                      {student.nickname.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full border-2 border-background shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">{student.nickname}</h2>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 py-1 px-3">
                  <School size={12} />
                  {student.school}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                  <GraduationCap size={12} />
                  {student.grade}
                </Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full rounded-xl">
                  แก้ไขโปรไฟล์
                </Button>
                <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  แชร์สถิติ
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Summary Grid */}
        <section className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target size={18} className="text-primary" />
              สรุปผลการเรียนรู้
            </h3>
            <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => navigate(ROUTE_PATHS.STACK)}>
              ดูรายละเอียด
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <StatsCard 
              title="ความต่อเนื่อง (Stack)"
              value={`${student.stackCount} วัน`}
              icon={<Zap className="text-orange-500 fill-orange-500" size={20} />}
            />
            <StatsCard 
              title="ส่งตรงเวลา"
              value={`${student.onTimeRate}%`}
              icon={<CheckCircle2 className="text-secondary" size={20} />}
            />
            <StatsCard 
              title="งานค้างในระบบ"
              value={`${student.backlogCount} งาน`}
              icon={<AlertCircle className="text-destructive" size={20} />}
            />
            <StatsCard 
              title="สถิติสูงสุด"
              value={`${student.maxStack} วัน`}
              icon={<Zap className="text-yellow-500" size={20} />}
            />
          </div>
        </section>

        {/* Settings Groups */}
        <section className="px-4 space-y-6">
          {/* General Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-2">ทั่วไป</h4>
            <Card className="border-none shadow-sm divide-y">
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Bell size={20} />
                  </div>
                  <span className="font-medium">การแจ้งเตือน</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <span className="font-medium">โหมดโฟกัส</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    {student.isAnonymous ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">โหมดไม่เปิดเผยชื่อ</span>
                    <span className="text-xs text-muted-foreground">ซ่อนชื่อจริงใน Ranking</span>
                  </div>
                </div>
                <Switch checked={student.isAnonymous} onCheckedChange={toggleAnonymous} />
              </div>
            </Card>
          </div>

          {/* Data & Privacy */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-2">ข้อมูลและความเป็นส่วนตัว</h4>
            <Card className="border-none shadow-sm divide-y">
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <span className="font-medium">ส่งออกสรุปสถิติ (PDF)</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(ROUTE_PATHS.PDPA)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <span className="font-medium">นโยบายความเป็นส่วนตัว</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Support & Logout */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-2">ความช่วยเหลือ</h4>
            <Card className="border-none shadow-sm divide-y">
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <HelpCircle size={20} />
                  </div>
                  <span className="font-medium">ศูนย์ช่วยเหลือ</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-destructive/5 transition-colors cursor-pointer group" onClick={handleLogout}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-colors">
                    <LogOut size={20} />
                  </div>
                  <span className="font-medium text-destructive">ออกจากระบบ</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center pt-4 pb-8">
            <p className="text-xs text-muted-foreground">DekThai App v1.0.0 (2026)</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Designed with ❤️ for Thai Students</p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Profile;