import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Trophy,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  EyeOff,
  ChevronRight,
  Medal,
  Crown,
  Users,
  Star
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/Cards';
import { mockStudent, mockBadges } from '@/data/index';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const RANKING_DATA = [
  { id: '1', name: 'เทพเจ้าสายส่ง', stack: 45, league: 'Gold', isMe: false },
  { id: '2', name: 'ขยันเบอร์หนึ่ง', stack: 38, league: 'Gold', isMe: false },
  { id: '3', name: 'ส่งงานทันใจ', stack: 32, league: 'Gold', isMe: false },
  { id: '4', name: 'นักเรียนตัวอย่าง', stack: 28, league: 'Silver', isMe: false },
  { id: '5', name: mockStudent.nickname, stack: mockStudent.stackCount, league: 'Silver', isMe: true },
  { id: '6', name: 'เด็กหลังห้อง(กลับใจ)', stack: 12, league: 'Silver', isMe: false },
  { id: '7', name: 'ผู้กล้าแห่งการส่ง', stack: 8, league: 'Bronze', isMe: false },
  { id: '8', name: 'มือใหม่หัดส่ง', stack: 5, league: 'Bronze', isMe: false },
];

const StackPage: React.FC = () => {
  const [isAnonymous, setIsAnonymous] = useState(mockStudent.isAnonymous);
  const [activeTab, setActiveTab] = useState('stats');

  const getLeagueColor = (league: string) => {
    switch (league) {
      case 'Gold': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'Silver': return 'text-slate-400 bg-slate-50 border-slate-200';
      case 'Bronze': return 'text-orange-400 bg-orange-50 border-orange-200';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Layout>
      <div className="pb-24">
        {/* Header Section */}
        <section className="px-4 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">ความก้าวหน้า</h1>
              <p className="text-muted-foreground text-sm">รักษาวินัยเพื่อความสำเร็จในอนาคต</p>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
          </motion.div>

          {/* Main Stats Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <motion.div variants={staggerItem}>
              <StatsCard 
                title="Stack ปัจจุบัน"
                value={`${mockStudent.stackCount} วัน`}
                icon={<Zap className="w-5 h-5 text-orange-500 fill-orange-500" />}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatsCard 
                title="On-time Rate"
                value={`${mockStudent.onTimeRate}%`}
                icon={<CheckCircle2 className="w-5 h-5 text-secondary" />}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatsCard 
                title="งานค้างสะสม"
                value={`${mockStudent.backlogCount} งาน`}
                icon={<AlertCircle className="w-5 h-5 text-destructive" />}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatsCard 
                title="Stack สูงสุด"
                value={`${mockStudent.maxStack} วัน`}
                icon={<Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
              />
            </motion.div>
          </motion.div>

          {/* Navigation Tabs */}
          <Tabs defaultValue="stats" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 rounded-xl p-1">
              <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">สถิติ</TabsTrigger>
              <TabsTrigger value="badges" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">เหรียญตรา</TabsTrigger>
              <TabsTrigger value="ranking" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">อันดับ</TabsTrigger>
            </TabsList>

            {/* Stats View */}
            <TabsContent value="stats" className="space-y-4">
              <Card className="border-none shadow-soft rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">เป้าหมายส่งงานต่อเนื่อง</CardTitle>
                  <CardDescription>ส่งงานทุกวันเพื่อเพิ่ม Stack และรับรางวัล</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium">ความคืบหน้าสู่ 14 วัน</span>
                    <span className="text-2xl font-bold text-primary">{mockStudent.stackCount}/14</span>
                  </div>
                  <Progress value={(mockStudent.stackCount / 14) * 100} className="h-3" />
                  <div className="grid grid-cols-7 gap-2 pt-2">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i < 4 ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {i < 4 ? <Zap className="w-4 h-4 fill-white" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground">ส-{i+11}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-2 border-primary text-primary hover:bg-primary/5">
                    กู้คืน Stack ที่หลุดไป
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-soft rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">ภาพรวมประสิทธิภาพ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">อัตราการส่งตรงเวลา</p>
                        <p className="text-xs text-muted-foreground">สัปดาห์นี้ดีขึ้น 5%</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-secondary">{mockStudent.onTimeRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">งานค้างสะสม (Backlog)</p>
                        <p className="text-xs text-muted-foreground">รีบเคลียร์ก่อนเดดไลน์ถัดไป</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-destructive">{mockStudent.backlogCount}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges View */}
            <TabsContent value="badges">
              <div className="grid grid-cols-2 gap-4">
                {mockBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center space-y-3 shadow-sm ${
                      badge.earnedDate ? 'bg-white border-primary/20' : 'bg-muted/30 border-transparent opacity-60'
                    }`}
                  >
                    <div className={`p-4 rounded-full ${
                      badge.earnedDate ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {badge.icon === 'Zap' && <Zap className={`w-8 h-8 ${badge.earnedDate ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground'}`} />}
                      {badge.icon === 'CheckCircle2' && <CheckCircle2 className={`w-8 h-8 ${badge.earnedDate ? 'text-secondary' : 'text-muted-foreground'}`} />}
                      {badge.icon === 'Users' && <Users className={`w-8 h-8 ${badge.earnedDate ? 'text-blue-500' : 'text-muted-foreground'}`} />}
                      {badge.icon === 'Trophy' && <Trophy className={`w-8 h-8 ${badge.earnedDate ? 'text-yellow-500' : 'text-muted-foreground'}`} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{badge.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                    {badge.earnedDate ? (
                      <UIBadge variant="secondary" className="text-[10px] font-normal">
                        ได้รับเมื่อ {badge.earnedDate}
                      </UIBadge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ยังไม่ได้รับ
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">สะสม Badge เพิ่มเพื่อปลดล็อกธีมพิเศษ!</p>
              </div>
            </TabsContent>

            {/* Ranking View */}
            <TabsContent value="ranking" className="space-y-4">
              <Card className="border-none shadow-soft rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm">Safe Ranking Design</h3>
                      <p className="text-xs text-muted-foreground">
                        การจัดอันดับภายในโรงเรียนเท่านั้น ข้อมูลของคุณจะปลอดภัย
                        และสามารถเลือกแสดงผลแบบนามแฝงได้
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="anonymous-mode" className="text-sm">โหมดไม่เปิดเผยชื่อ</Label>
                    </div>
                    <Switch 
                      id="anonymous-mode" 
                      checked={isAnonymous} 
                      onCheckedChange={setIsAnonymous}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h3 className="text-sm font-bold px-1 mb-3">ลีกประจำสัปดาห์ (โรงเรียนสาธิตฯ)</h3>
                {RANKING_DATA.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      user.isMe 
                        ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-md' 
                        : 'bg-white border-border shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-6 text-center font-bold text-muted-foreground">
                        {index === 0 ? <Crown className="w-5 h-5 text-yellow-500 mx-auto" /> : index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                        {user.isMe ? (
                          <img src={mockStudent.avatar} alt="Me" className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${user.isMe ? 'text-primary' : 'text-foreground'}`}>
                            {user.isMe && isAnonymous ? 'ฉัน (นามแฝง)' : user.name}
                          </p>
                          {user.isMe && <UIBadge className="text-[9px] h-4 px-1">ME</UIBadge>}
                        </div>
                        <UIBadge variant="outline" className={`text-[9px] px-1 h-4 mt-0.5 ${getLeagueColor(user.league)}`}>
                          {user.league} League
                        </UIBadge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-bold">{user.stack}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Stack</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 text-center">
                <Button variant="ghost" className="text-xs text-muted-foreground">
                  ดูอันดับทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
};

export default StackPage;